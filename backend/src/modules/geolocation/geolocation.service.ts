import { Injectable } from '@nestjs/common';
import {
  geohashForLocation,
  geohashQueryBounds,
  distanceBetween,
} from 'geofire-common';
import { GeoPoint } from 'firebase-admin/firestore';

export interface Coordinates { lat: number; lng: number; }

@Injectable()
export class GeolocationService {
  encodeGeohash(lat: number, lng: number, precision = 9): string {
    return geohashForLocation([lat, lng], precision);
  }

  getQueryBounds(centre: Coordinates, radiusMetres: number): Array<{ start: string; end: string }> {
    return geohashQueryBounds([centre.lat, centre.lng], radiusMetres).map(
      ([start, end]) => ({ start, end }),
    );
  }

  distanceMetres(a: Coordinates, b: Coordinates): number {
    return distanceBetween([a.lat, a.lng], [b.lat, b.lng]) * 1000;
  }

  toGeoPoint(lat: number, lng: number): GeoPoint {
    return new GeoPoint(lat, lng);
  }

  filterByRadius<T extends { location: { geopoint: GeoPoint } }>(
    docs: T[],
    centre: Coordinates,
    radiusMetres: number,
  ): Array<T & { _distanceMetres: number }> {
    return docs
      .map((doc) => ({
        ...doc,
        _distanceMetres: this.distanceMetres(centre, {
          lat: doc.location.geopoint.latitude,
          lng: doc.location.geopoint.longitude,
        }),
      }))
      .filter((d) => d._distanceMetres <= radiusMetres)
      .sort((a, b) => a._distanceMetres - b._distanceMetres);
  }

  isWithinIndia(lat: number, lng: number): boolean {
    return lat >= 6.5 && lat <= 37.5 && lng >= 68.0 && lng <= 97.5;
  }
}
