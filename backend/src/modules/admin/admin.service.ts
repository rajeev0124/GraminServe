import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '@app/shared/firebase/firebase.service';
import { FieldValue } from 'firebase-admin/firestore';

export type ComplaintStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';

export interface CreateComplaintDto {
  bookingId: string;
  reporterUid: string;
  againstUid: string;
  reason: string;
  description: string;
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private readonly COMPLAINTS = 'complaints';
  private readonly CATEGORIES = 'categories';

  constructor(private readonly firebase: FirebaseService) {}

  // ── Complaints ─────────────────────────────────────────────────────────────

  async createComplaint(dto: CreateComplaintDto): Promise<string> {
    const ref = this.firebase.firestore().collection(this.COMPLAINTS).doc();
    await ref.set({
      complaintId: ref.id,
      ...dto,
      status: 'OPEN' as ComplaintStatus,
      resolvedBy: null,
      resolution: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    this.logger.log(`Complaint ${ref.id} filed by ${dto.reporterUid}`);
    return ref.id;
  }

  async listComplaints(status?: ComplaintStatus): Promise<FirebaseFirestore.DocumentData[]> {
    let q: FirebaseFirestore.Query = this.firebase.firestore().collection(this.COMPLAINTS);
    if (status) q = q.where('status', '==', status);
    q = q.orderBy('createdAt', 'desc').limit(50);
    const snap = await q.get();
    return snap.docs.map((d) => d.data());
  }

  async resolveComplaint(
    complaintId: string,
    adminUid: string,
    resolution: string,
    status: 'RESOLVED' | 'DISMISSED',
  ): Promise<void> {
    await this.firebase.firestore().collection(this.COMPLAINTS).doc(complaintId).update({
      status,
      resolvedBy: adminUid,
      resolution,
      updatedAt: FieldValue.serverTimestamp(),
    });
    this.logger.log(`Complaint ${complaintId} → ${status} by ${adminUid}`);
  }

  // ── Categories ─────────────────────────────────────────────────────────────

  async listCategories(): Promise<FirebaseFirestore.DocumentData[]> {
    const snap = await this.firebase.firestore()
      .collection(this.CATEGORIES)
      .where('isActive', '==', true)
      .orderBy('displayOrder', 'asc')
      .get();
    return snap.docs.map((d) => d.data());
  }

  async upsertCategory(
    slug: string,
    data: { name: string; icon: string; displayOrder: number; isActive: boolean },
  ): Promise<void> {
    await this.firebase.firestore().collection(this.CATEGORIES).doc(slug).set(
      { slug, ...data, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
  }

  async deactivateCategory(slug: string): Promise<void> {
    await this.firebase.firestore().collection(this.CATEGORIES).doc(slug).update({
      isActive: false,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  // ── Commission Rate ────────────────────────────────────────────────────────

  async updateCommissionRate(rate: number, adminUid: string): Promise<void> {
    await this.firebase.firestore().collection('config').doc('platform').set(
      { commissionRate: rate, updatedBy: adminUid, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
    this.logger.log(`Commission rate updated to ${rate * 100}% by ${adminUid}`);
  }

  async getConfig(): Promise<FirebaseFirestore.DocumentData | undefined> {
    const doc = await this.firebase.firestore().collection('config').doc('platform').get();
    return doc.data();
  }
}
