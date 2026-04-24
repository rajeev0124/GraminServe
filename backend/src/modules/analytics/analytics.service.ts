import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '@app/shared/firebase/firebase.service';

export interface PlatformMetrics {
  totalUsers: number;
  totalProfessionals: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  avgRating: number;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly firebase: FirebaseService) {}

  async getPlatformMetrics(): Promise<PlatformMetrics> {
    const db = this.firebase.firestore();

    const [
      totalUsersSnap, totalProSnap,
      totalBookSnap, completedSnap,
      cancelledSnap, paymentsSnap, reviewsSnap,
    ] = await Promise.all([
      db.collection('users').where('role', '==', 'CUSTOMER').count().get(),
      db.collection('users').where('role', '==', 'PROFESSIONAL').count().get(),
      db.collection('bookings').count().get(),
      db.collection('bookings').where('status', '==', 'COMPLETED').count().get(),
      db.collection('bookings').where('status', '==', 'CANCELLED').count().get(),
      db.collection('payments').get(),
      db.collection('reviews').get(),
    ]);

    const totalRevenue = paymentsSnap.docs.reduce(
      (sum, d) => sum + ((d.data()['amountPaise'] as number) ?? 0), 0,
    ) / 100;

    const reviewDocs = reviewsSnap.docs;
    const avgRating = reviewDocs.length > 0
      ? reviewDocs.reduce((s, d) => s + (d.data()['rating'] as number), 0) / reviewDocs.length
      : 0;

    return {
      totalUsers: totalUsersSnap.data().count,
      totalProfessionals: totalProSnap.data().count,
      totalBookings: totalBookSnap.data().count,
      completedBookings: completedSnap.data().count,
      cancelledBookings: cancelledSnap.data().count,
      totalRevenue: Math.round(totalRevenue),
      avgRating: Math.round(avgRating * 10) / 10,
    };
  }

  async getBookingsByStatus(): Promise<Record<string, number>> {
    const statuses = ['PENDING', 'ACCEPTED', 'STARTED', 'COMPLETED', 'CANCELLED'];
    const counts = await Promise.all(
      statuses.map((s) =>
        this.firebase.firestore()
          .collection('bookings').where('status', '==', s).count().get()
          .then((snap) => [s, snap.data().count] as [string, number]),
      ),
    );
    return Object.fromEntries(counts);
  }

  async getTopCategories(limit = 10): Promise<Array<{ category: string; bookings: number }>> {
    const snap = await this.firebase.firestore().collection('bookings').get();
    const counts: Record<string, number> = {};
    for (const doc of snap.docs) {
      const cat = (doc.data()['serviceCategory'] as string) ?? 'OTHER';
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([category, bookings]) => ({ category, bookings }));
  }

  async getRevenueByMonth(year: number): Promise<Array<{ month: number; revenue: number }>> {
    const snap = await this.firebase.firestore()
      .collection('payments')
      .where('status', '==', 'CAPTURED')
      .get();

    const monthly: Record<number, number> = {};
    for (const doc of snap.docs) {
      const ts = (doc.data()['createdAt'] as FirebaseFirestore.Timestamp)?.toDate();
      if (ts && ts.getFullYear() === year) {
        const m = ts.getMonth() + 1;
        monthly[m] = (monthly[m] ?? 0) + ((doc.data()['amountPaise'] as number) ?? 0) / 100;
      }
    }

    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: Math.round(monthly[i + 1] ?? 0),
    }));
  }
}
