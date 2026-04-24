import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FirebaseService } from '@app/shared/firebase/firebase.service';
import { FieldValue } from 'firebase-admin/firestore';

export interface CreateReviewDto {
  bookingId: string;
  reviewerId: string;  // customer UID
  revieweeId: string;  // professional UID
  serviceId: string;
  rating: number;      // 1–5
  comment?: string;
}

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);
  private readonly REVIEWS_COL = 'reviews';

  constructor(private readonly firebase: FirebaseService) {}

  async createReview(dto: CreateReviewDto): Promise<string> {
    if (dto.rating < 1 || dto.rating > 5 || !Number.isInteger(dto.rating)) {
      throw new BadRequestException('Rating must be an integer between 1 and 5.');
    }

    // Ensure only one review per booking
    const existing = await this.firebase.firestore()
      .collection(this.REVIEWS_COL)
      .where('bookingId', '==', dto.bookingId)
      .where('reviewerId', '==', dto.reviewerId)
      .limit(1)
      .get();

    if (!existing.empty) {
      throw new ConflictException(`Review for booking ${dto.bookingId} already exists.`);
    }

    const ref = this.firebase.firestore().collection(this.REVIEWS_COL).doc();
    await ref.set({
      reviewId: ref.id,
      ...dto,
      comment: dto.comment ?? '',
      createdAt: FieldValue.serverTimestamp(),
    });

    this.logger.log(`Review ${ref.id}: ${dto.rating}★ for professional ${dto.revieweeId}`);
    return ref.id;
  }

  async getReview(reviewId: string): Promise<FirebaseFirestore.DocumentData> {
    const doc = await this.firebase.firestore().collection(this.REVIEWS_COL).doc(reviewId).get();
    if (!doc.exists) throw new NotFoundException(`Review ${reviewId} not found.`);
    return doc.data()!;
  }

  async listForProfessional(
    professionalId: string,
    limit = 20,
  ): Promise<FirebaseFirestore.DocumentData[]> {
    const snap = await this.firebase.firestore()
      .collection(this.REVIEWS_COL)
      .where('revieweeId', '==', professionalId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map((d) => d.data());
  }

  async getRatingSummary(professionalId: string): Promise<{ average: number; total: number }> {
    const snap = await this.firebase.firestore()
      .collection(this.REVIEWS_COL)
      .where('revieweeId', '==', professionalId)
      .get();

    const total = snap.docs.length;
    const sum = snap.docs.reduce((acc, d) => acc + (d.data()['rating'] as number), 0);
    return { average: total > 0 ? Math.round((sum / total) * 10) / 10 : 0, total };
  }

  async deleteReview(reviewId: string): Promise<void> {
    await this.firebase.firestore().collection(this.REVIEWS_COL).doc(reviewId).delete();
    this.logger.warn(`Review ${reviewId} deleted (admin action).`);
  }
}
