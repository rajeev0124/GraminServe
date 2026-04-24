import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '@app/shared/firebase/firebase.service';
import { FieldValue } from 'firebase-admin/firestore';
import { ServerValue } from 'firebase-admin/database';

export type NotificationType =
  | 'NEW_BOOKING'
  | 'BOOKING_ACCEPTED'
  | 'BOOKING_STARTED'
  | 'BOOKING_COMPLETED'
  | 'BOOKING_CANCELLED'
  | 'PAYMENT_RELEASED'
  | 'OTP_PROMPT'
  | 'VERIFICATION_APPROVED'
  | 'VERIFICATION_REJECTED';

export interface SendNotificationDto {
  recipientUid: string;
  type: NotificationType;
  title: string;
  body: string;
  bookingId?: string;
  metadata?: Record<string, string>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly NOTIF_COL = 'notifications';

  constructor(private readonly firebase: FirebaseService) {}

  /**
   * Writes a notification document to Firestore sub-collection
   * and a RTDB entry for real-time delivery.
   */
  async send(dto: SendNotificationDto): Promise<string> {
    // Persist to Firestore for notification history
    const ref = this.firebase.firestore()
      .collection(this.NOTIF_COL)
      .doc(dto.recipientUid)
      .collection('items')
      .doc();

    await ref.set({
      notificationId: ref.id,
      type: dto.type,
      title: dto.title,
      body: dto.body,
      bookingId: dto.bookingId ?? null,
      metadata: dto.metadata ?? {},
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Push to RTDB for live badge count
    await this.firebase.database()
      .ref(`notifications/${dto.recipientUid}/${ref.id}`)
      .set({
        type: dto.type,
        title: dto.title,
        read: false,
        timestamp: ServerValue.TIMESTAMP,
      });

    this.logger.log(`Notification [${dto.type}] → ${dto.recipientUid}`);
    return ref.id;
  }

  /** Sends the same notification to multiple recipients (fan-out). */
  async broadcast(uids: string[], base: Omit<SendNotificationDto, 'recipientUid'>): Promise<void> {
    await Promise.all(uids.map((uid) => this.send({ ...base, recipientUid: uid })));
  }

  async markAsRead(uid: string, notificationId: string): Promise<void> {
    await this.firebase.firestore()
      .collection(this.NOTIF_COL)
      .doc(uid)
      .collection('items')
      .doc(notificationId)
      .update({ read: true });

    await this.firebase.database()
      .ref(`notifications/${uid}/${notificationId}/read`)
      .set(true);
  }

  async getUnreadCount(uid: string): Promise<number> {
    const snap = await this.firebase.firestore()
      .collection(this.NOTIF_COL)
      .doc(uid)
      .collection('items')
      .where('read', '==', false)
      .count()
      .get();
    return snap.data().count;
  }
}
