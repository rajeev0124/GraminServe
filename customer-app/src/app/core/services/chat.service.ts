import { Injectable, inject } from '@angular/core';
import {
  Database, ref, push, query, orderByChild, limitToLast,
  onValue, update, serverTimestamp,
} from '@angular/fire/database';
import { Observable } from 'rxjs';
import { ChatMessage } from '@app/core/models/domain.models';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly db = inject(Database);

  /** Hot Observable — last `limit` messages ordered by timestamp asc. */
  streamMessages(bookingId: string, limit = 50): Observable<ChatMessage[]> {
    const chatRef = ref(this.db, `chats/${bookingId}/messages`);
    const q = query(chatRef, orderByChild('timestamp'), limitToLast(limit));
    return new Observable<ChatMessage[]>((observer) => {
      const unsub = onValue(
        q,
        (snap) => {
          const msgs: ChatMessage[] = [];
          snap.forEach((child) => {
            msgs.push({ key: child.key ?? undefined, ...(child.val() as ChatMessage) });
          });
          observer.next(msgs);
        },
        (err) => observer.error(err),
      );
      return () => unsub();
    });
  }

  async sendMessage(
    bookingId: string,
    senderUid: string,
    text?: string,
    imageUrl?: string | null,
  ): Promise<string> {
    const chatRef = ref(this.db, `chats/${bookingId}/messages`);
    const newRef = await push(chatRef, {
      senderUid,
      text: text ?? null,
      imageUrl: imageUrl ?? null,
      timestamp: serverTimestamp(),
      read: false,
    });
    return newRef.key as string;
  }

  async markAsRead(bookingId: string, recipientUid: string, messages: ChatMessage[]): Promise<void> {
    const chatRef = ref(this.db, `chats/${bookingId}/messages`);
    const updates: Record<string, boolean> = {};
    messages
      .filter((m) => m.senderUid !== recipientUid && !m.read && m.key)
      .forEach((m) => { updates[`${m.key}/read`] = true; });
    if (Object.keys(updates).length) await update(chatRef, updates);
  }

  async setPresence(uid: string, online: boolean): Promise<void> {
    await update(ref(this.db, `presence/${uid}`), { online, lastSeen: serverTimestamp() });
  }
}
