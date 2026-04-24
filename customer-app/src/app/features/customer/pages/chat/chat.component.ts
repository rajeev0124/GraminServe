import { Component, OnInit, OnDestroy, signal, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatService } from '@app/core/services/chat.service';
import { AuthService } from '@app/core/services/auth.service';
import { ChatMessage } from '@app/core/models/domain.models';

@Component({
  selector: 'gs-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-screen bg-gray-50">

      <!-- Header -->
      <div class="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button onclick="history.back()" class="text-gray-500 hover:text-gray-700">←</button>
        <div>
          <p class="text-sm font-semibold text-gray-800">Chat</p>
          <p class="text-xs text-gray-400">Booking #{{ bookingId }}</p>
        </div>
        <div class="ml-auto flex items-center gap-1.5">
          <div class="w-2 h-2 rounded-full" [class]="online() ? 'bg-green-400' : 'bg-gray-300'"></div>
          <span class="text-xs text-gray-500">{{ online() ? 'Online' : 'Offline' }}</span>
        </div>
      </div>

      <!-- Messages -->
      <div #scrollContainer class="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        @for (msg of messages(); track msg.key) {
          <div class="flex" [class]="msg.senderUid === myUid() ? 'justify-end' : 'justify-start'">
            <div class="max-w-xs rounded-2xl px-4 py-2.5 text-sm shadow-sm"
                 [class]="msg.senderUid === myUid()
                   ? 'bg-indigo-600 text-white rounded-br-sm'
                   : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'">
              @if (msg.imageUrl) {
                <img [src]="msg.imageUrl" alt="Image" class="rounded-xl max-w-full mb-1" />
              }
              @if (msg.text) { <p>{{ msg.text }}</p> }
              <p class="text-xs mt-1 opacity-60">{{ msg.timestamp | date:'HH:mm' }}</p>
            </div>
          </div>
        }
        @if (messages().length === 0) {
          <p class="text-center text-gray-400 text-sm mt-20">No messages yet. Say hello! 👋</p>
        }
      </div>

      <!-- Input -->
      <div class="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3">
        <input [(ngModel)]="newMessage" (keyup.enter)="send()"
               placeholder="Type a message…"
               class="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-300" />
        <button (click)="send()" [disabled]="!newMessage.trim()"
                class="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 transition-colors">
          ➤
        </button>
      </div>
    </div>
  `,
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() bookingId!: string;

  private readonly chatSvc = inject(ChatService);
  private readonly authSvc = inject(AuthService);
  private sub?: Subscription;

  readonly messages = signal<ChatMessage[]>([]);
  readonly online   = signal(false);
  readonly myUid    = () => this.authSvc.currentUser()?.uid ?? '';
  newMessage = '';

  ngOnInit(): void {
    void this.chatSvc.setPresence(this.myUid(), true);
    this.sub = this.chatSvc.streamMessages(this.bookingId).subscribe((msgs) => {
      this.messages.set(msgs);
      void this.chatSvc.markAsRead(this.bookingId, this.myUid(), msgs);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    void this.chatSvc.setPresence(this.myUid(), false);
  }

  send(): void {
    const text = this.newMessage.trim();
    if (!text) return;
    this.newMessage = '';
    void this.chatSvc.sendMessage(this.bookingId, this.myUid(), text);
  }
}
