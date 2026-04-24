import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { FirebaseService } from '@app/shared/firebase/firebase.service';
import { FieldValue, GeoPoint } from 'firebase-admin/firestore';
import { geohashQueryBounds, distanceBetween } from 'geofire-common';

export type PricingType = 'HOURLY' | 'FIXED';

export interface CreateServiceDto {
  professionalId: string;
  category: string;
  title: string;
  description: string;
  pricingType: PricingType;
  price: number;
  coverageRadius: number;
  location: { lat: number; lng: number; geohash: string };
}

export interface ServiceSearchDto {
  lat: number;
  lng: number;
  radiusMetres: number;
  category?: string;
  maxPrice?: number;
  sortBy?: 'price' | 'rating' | 'distance';
}

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);
  private readonly COL = 'services';

  constructor(private readonly firebase: FirebaseService) {}

  async createService(dto: CreateServiceDto): Promise<string> {
    const ref = this.firebase.firestore().collection(this.COL).doc();
    await ref.set({
      serviceId: ref.id,
      ...dto,
      location: {
        geopoint: new GeoPoint(dto.location.lat, dto.location.lng),
        geohash: dto.location.geohash,
      },
      portfolioImages: [],
      isActive: true,
      averageRating: 0,
      totalReviews: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    this.logger.log(`Service created: ${ref.id} by ${dto.professionalId}`);
    return ref.id;
  }

  async getService(serviceId: string): Promise<FirebaseFirestore.DocumentData> {
    const doc = await this.firebase.firestore().collection(this.COL).doc(serviceId).get();
    if (!doc.exists) throw new NotFoundException(`Service ${serviceId} not found.`);
    return doc.data()!;
  }

  async updateService(
    serviceId: string,
    updates: Partial<CreateServiceDto>,
  ): Promise<void> {
    await this.firebase.firestore().collection(this.COL).doc(serviceId).update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  async deactivateService(serviceId: string): Promise<void> {
    await this.firebase.firestore().collection(this.COL).doc(serviceId).update({
      isActive: false,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  /**
   * Geohash-bounding-box query + Haversine post-filter.
   * Returns services within the requested radius sorted by chosen strategy.
   */
  async searchServices(dto: ServiceSearchDto): Promise<FirebaseFirestore.DocumentData[]> {
    const bounds = geohashQueryBounds([dto.lat, dto.lng], dto.radiusMetres);

    const queryPromises = bounds.map(([start, end]) => {
      let q = this.firebase.firestore()
        .collection(this.COL)
        .where('isActive', '==', true)
        .where('location.geohash', '>=', start)
        .where('location.geohash', '<=', end);
      if (dto.category) q = q.where('category', '==', dto.category);
      if (dto.maxPrice)  q = q.where('price', '<=', dto.maxPrice);
      return q.get();
    });

    const snaps = await Promise.all(queryPromises);
    const seen = new Set<string>();
    const results: Array<FirebaseFirestore.DocumentData & { _distanceKm: number }> = [];

    for (const snap of snaps) {
      for (const doc of snap.docs) {
        if (seen.has(doc.id)) continue;
        seen.add(doc.id);

        const data = doc.data();
        const gp = data['location']['geopoint'] as GeoPoint;
        const distKm = distanceBetween([dto.lat, dto.lng], [gp.latitude, gp.longitude]);

        if (distKm * 1000 <= dto.radiusMetres) {
          results.push({ ...data, _distanceKm: distKm });
        }
      }
    }

    // Sort post-filter results
    if (dto.sortBy === 'price') {
      results.sort((a, b) => (a['price'] as number) - (b['price'] as number));
    } else if (dto.sortBy === 'rating') {
      results.sort((a, b) => (b['averageRating'] as number) - (a['averageRating'] as number));
    } else {
      results.sort((a, b) => a._distanceKm - b._distanceKm);
    }

    return results;
  }

  async listByProfessional(professionalId: string): Promise<FirebaseFirestore.DocumentData[]> {
    const snap = await this.firebase.firestore()
      .collection(this.COL)
      .where('professionalId', '==', professionalId)
      .get();
    return snap.docs.map((d) => d.data());
  }
}
