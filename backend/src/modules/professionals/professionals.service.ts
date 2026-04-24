import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FirebaseService } from '@app/shared/firebase/firebase.service';
import { FieldValue, GeoPoint } from 'firebase-admin/firestore';

export interface ProfessionalProfileDto {
  uid: string;
  displayName: string;
  phoneNumber: string;
  bio?: string;
  location: {
    lat: number;
    lng: number;
    geohash: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
}

@Injectable()
export class ProfessionalsService {
  private readonly logger = new Logger(ProfessionalsService.name);
  private readonly USERS_COL = 'users';

  constructor(private readonly firebase: FirebaseService) {}

  async getProfessional(uid: string): Promise<FirebaseFirestore.DocumentData> {
    const doc = await this.firebase.firestore().collection(this.USERS_COL).doc(uid).get();
    if (!doc.exists) throw new NotFoundException(`Professional ${uid} not found.`);
    const data = doc.data()!;
    if (data['role'] !== 'PROFESSIONAL') {
      throw new BadRequestException(`User ${uid} is not a professional.`);
    }
    return data;
  }

  async updateProfile(uid: string, dto: Partial<ProfessionalProfileDto>): Promise<void> {
    const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (dto.displayName) update['displayName'] = dto.displayName;
    if (dto.bio) update['bio'] = dto.bio;
    if (dto.location) {
      update['location.geopoint'] = new GeoPoint(dto.location.lat, dto.location.lng);
      update['location.geohash'] = dto.location.geohash;
      update['location.address'] = dto.location.address;
      update['location.city'] = dto.location.city;
      update['location.state'] = dto.location.state;
      update['location.pincode'] = dto.location.pincode;
    }
    await this.firebase.firestore().collection(this.USERS_COL).doc(uid).update(update);
  }

  async setAvailability(uid: string, isAvailable: boolean): Promise<void> {
    await this.firebase.firestore().collection(this.USERS_COL).doc(uid).update({
      isAvailable,
      updatedAt: FieldValue.serverTimestamp(),
    });
    this.logger.log(`Professional ${uid} availability → ${isAvailable}`);
  }

  /** Admin SDK: verify a professional after ID document review. */
  async verifyProfessional(uid: string, adminUid: string): Promise<void> {
    await this.firebase.firestore().collection(this.USERS_COL).doc(uid).update({
      isVerified: true,
      verifiedBy: adminUid,
      verifiedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    this.logger.log(`Professional ${uid} verified by admin ${adminUid}`);
  }

  async rejectProfessional(uid: string, reason: string): Promise<void> {
    await this.firebase.firestore().collection(this.USERS_COL).doc(uid).update({
      isVerified: false,
      rejectionReason: reason,
      updatedAt: FieldValue.serverTimestamp(),
    });
    this.logger.warn(`Professional ${uid} rejected. Reason: ${reason}`);
  }

  async listPendingVerifications(): Promise<FirebaseFirestore.DocumentData[]> {
    const snap = await this.firebase.firestore()
      .collection(this.USERS_COL)
      .where('role', '==', 'PROFESSIONAL')
      .where('isVerified', '==', false)
      .limit(50)
      .get();
    return snap.docs.map((d) => d.data());
  }

  /** Aggregates rating from the reviews collection onto the professional profile. */
  async recalculateRating(professionalId: string): Promise<void> {
    const reviews = await this.firebase.firestore()
      .collection('reviews')
      .where('revieweeId', '==', professionalId)
      .get();

    const total = reviews.docs.length;
    const sum = reviews.docs.reduce((acc, d) => acc + (d.data()['rating'] as number), 0);
    const avg = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;

    await this.firebase.firestore().collection(this.USERS_COL).doc(professionalId).update({
      averageRating: avg,
      totalReviews: total,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}
