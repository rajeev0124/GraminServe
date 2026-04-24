import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '@app/core/services/api.service';
import { AuthService } from '@app/core/services/auth.service';
import { Booking } from '@app/core/models/domain.models';

@Component({
  selector: 'gs-order-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 px-4 py-5 max-w-lg mx-auto space-y-4">
      <h1 class="text-xl font-bold text-gray-900">My Bookings</h1>

      @if (loading()) {
        <div class="text-center py-16 text-gray-400 animate-pulse">Loading…</div>
      } @else if (bookings().length === 0) {
        <div class="text-center py-20 text-gray-400">
          <p class="text-4xl mb-3">📋</p>
          <p class="text-sm">No bookings yet. Find a professional to get started.</p>
        </div>
      } @else {
        @for (b of bookings(); track b.bookingId) {
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm font-semibold text-gray-800">{{ b.serviceId }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ b.scheduledAt | date:'dd MMM yyyy, hh:mm a' }}</p>
              </div>
              <span class="text-xs font-semibold px-2.5 py-1 rounded-full"
                    [class]="statusClass(b.status)">{{ b.status }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">₹{{ b.agreedPrice | number }} · {{ b.paymentMethod }}</span>
              <div class="flex gap-2">
                <button (click)="router.navigate(['/chat', b.bookingId])"
                        class="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100">
                  💬 Chat
                </button>
                @if (b.status === 'COMPLETED') {
                  <button class="text-xs px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg font-medium hover:bg-amber-100">
                    ★ Review
                  </button>
                }
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class OrderHistoryComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly router      = inject(Router);

  readonly bookings = signal<Booking[]>([]);
  readonly loading  = signal(false);

  ngOnInit(): void {
    this.loading.set(true);
    this.api.getMyBookings().subscribe({
      next: (b) => { this.bookings.set(b); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  statusClass(status: string): string {
    return ({
      PENDING:   'bg-amber-50 text-amber-600',
      ACCEPTED:  'bg-blue-50 text-blue-600',
      STARTED:   'bg-indigo-50 text-indigo-600',
      COMPLETED: 'bg-green-50 text-green-600',
      CANCELLED: 'bg-red-50 text-red-500',
    })[status] ?? 'bg-gray-100 text-gray-600';
  }
}
