import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '@app/core/services/api.service';
import { Booking } from '@app/core/models/domain.models';

@Component({
  selector: 'gs-booking-requests',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 pb-20">
      <header class="bg-white border-b border-gray-100 p-4 sticky top-0 z-10">
        <div class="max-w-lg mx-auto flex items-center gap-3">
          <button (click)="router.navigate(['/pro'])" class="text-gray-500">←</button>
          <h1 class="text-lg font-bold text-gray-900">New Requests</h1>
        </div>
      </header>

      <div class="max-w-lg mx-auto p-5 space-y-4">
        @if (loading()) {
          <div class="text-center py-10 text-gray-400">Loading...</div>
        } @else if (requests().length === 0) {
          <div class="text-center py-20 text-gray-400">
            <p class="text-4xl mb-3">📬</p>
            <p class="text-sm">No new requests at the moment.</p>
          </div>
        } @else {
          @for (r of requests(); track r.bookingId) {
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-bold text-gray-900">{{ r.address }}</h3>
                  <p class="text-xs text-gray-500">{{ r.scheduledAt | date:'dd MMM, hh:mm a' }}</p>
                </div>
                <span class="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase">₹{{ r.agreedPrice }}</span>
              </div>
              
              <p class="text-sm text-gray-600 italic">"{{ r.note || 'No special instructions' }}"</p>

              <div class="flex gap-3 pt-2">
                <button (click)="accept(r.bookingId)"
                        class="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-sm font-bold shadow-md shadow-indigo-100">
                  Accept
                </button>
                <button class="flex-1 bg-white text-red-500 py-3 rounded-xl text-sm font-bold border border-red-50">
                  Decline
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class BookingRequestsComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly router = inject(Router);

  requests = signal<Booking[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.api.getMyBookings().subscribe({
      next: (b) => {
        this.requests.set(b.filter(x => x.status === 'PENDING'));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  accept(id: string) {
    this.api.updateBookingStatus(id, 'ACCEPTED').subscribe(() => {
      this.requests.update(list => list.filter(b => b.bookingId !== id));
    });
  }
}
