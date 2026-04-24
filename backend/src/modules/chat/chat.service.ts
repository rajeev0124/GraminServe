import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '@app/shared/firebase/firebase.service';
import { ServerValue } from 'firebase-admin/database';

export interface ChatMessage {
  senderUid: string;
  text?: string;
  imageUrl?: string | null;
  timestamp: object; // ServerValue.TIMESTAMP
  read: boolean;
}

export interface SendMessageDto {
  bookingId: string;
  senderUid: string;
  text?: string;
  imageUrl?: string | null;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly firebase: FirebaseService) {}

  /**
   * Pushes a new message to the RTDB chat node for a booking.
   * Node path: /chats/{bookingId}/{auto-generated-id}
   */
  async sendMessage(dto: SendMessageDto): Promise<string> {
    const ref = this.firebase
      .database()
      .ref(`chats/${dto.bookingId}`)
      .push();

    const message: ChatMessage = {
      senderUid: dto.senderUid,
      text: dto.text,
      imageUrl: dto.imageUrl ?? null,
      timestamp: ServerValue.TIMESTAMP,
      read: false,
    };

    await ref.set(message);
    this.logger.log(`Message sent in booking ${dto.bookingId} by ${dto.senderUid}`);
    return ref.key as string;
  }

  /**
   * Marks all messages in a booking chat as read for a given recipient.
   */
  async markAsRead(bookingId: string, recipientUid: string): Promise<void> {
    const chatRef = this.firebase.database().ref(`chats/${bookingId}`);
    const snapshot = await chatRef.get();

    if (!snapshot.exists()) return;

    const updates: Record<string, boolean> = {};

    snapshot.forEach((child) => {
      const msg = child.val() as ChatMessage;
      if (msg.senderUid !== recipientUid && !msg.read) {
        updates[`${child.key}/read`] = true;
      }
    });

    if (Object.keys(updates).length > 0) {
      await chatRef.update(updates);
    }
  }

  /**
   * Sets the online presence for a user in RTDB.
   * The client should call this on connect and on-disconnect cleanup.
   */
  async setPresence(uid: string, online: boolean): Promise<void> {
    await this.firebase
      .database()
      .ref(`presence/${uid}`)
      .set({ online, lastSeen: ServerValue.TIMESTAMP });
  }
}
