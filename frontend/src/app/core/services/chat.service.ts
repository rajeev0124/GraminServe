import { Injectable, inject } from '@angular/core';
import { Database, ref, push, query, orderByChild, limitToLast, onValue, update } from '@angular/fire/database';
import { Observable } from 'rxjs';

export interface ChatMessage {
  key?: string;
  senderUid: string;
  text?: string;
  imageUrl?: string | null;
  timestamp: number;
  read: boolean;
}

export interface SendMessagePayload {
  senderUid: string;
  text?: string;
  imageUrl?: string | null;
}

/**
 * ChatService streams messages from Firebase Realtime Database.
 * Node structure: /chats/{bookingId}/{messageId}
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly db = inject(Database);

  /**
   * Returns a hot Observable that emits the last `limit` messages
   * of the given booking chat, ordered by timestamp ascending.
   */
  streamMessages(bookingId: string, limit = 50): Observable<ChatMessage[]> {
    const chatRef = ref(this.db, `chats/${bookingId}`);
    const chatQuery = query(chatRef, orderByChild('timestamp'), limitToLast(limit));

    return new Observable<ChatMessage[]>((observer) => {
      const unsubscribe = onValue(
        chatQuery,
        (snapshot) => {
          const messages: ChatMessage[] = [];
          snapshot.forEach((child) => {
            messages.push({ key: child.key ?? undefined, ...(child.val() as ChatMessage) });
          });
          observer.next(messages);
        },
        (error) => observer.error(error),
      );

      // Cleanup subscription on unsubscribe
      return () => unsubscribe();
    });
  }

  /**
   * Pushes a new message into the booking chat node.
   */
  async sendMessage(bookingId: string, payload: SendMessagePayload): Promise<string> {
    const chatRef = ref(this.db, `chats/${bookingId}`);
    const message: Omit<ChatMessage, 'key'> = {
      ...payload,
      imageUrl: payload.imageUrl ?? null,
      timestamp: Date.now(),
      read: false,
    };
    const newRef = await push(chatRef, message);
    return newRef.key as string;
  }

  /**
   * Marks all unread messages (not sent by recipientUid) as read.
   */
  async markAsRead(bookingId: string, recipientUid: string, messages: ChatMessage[]): Promise<void> {
    const chatRef = ref(this.db, `chats/${bookingId}`);
    const updates: Record<string, boolean> = {};

    messages
      .filter((m) => m.senderUid !== recipientUid && !m.read && m.key)
      .forEach((m) => { updates[`${m.key}/read`] = true; });

    if (Object.keys(updates).length > 0) {
      await update(chatRef, updates);
    }
  }

  /**
   * Updates the user's online presence in RTDB.
   */
  async setPresence(uid: string, online: boolean): Promise<void> {
    const presenceRef = ref(this.db, `presence/${uid}`);
    await update(presenceRef, { online, lastSeen: Date.now() });
  }
}
