import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '@app/core/services/api.service';
import { AuthService } from '@app/core/services/auth.service';
import { Service } from '@app/core/models/domain.models';
import { LoadingSpinnerComponent } from '@app/shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'gs-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
    @if (loading()) {
      <gs-loading-spinner />
    } @else if (service(); as s) {
      <div class="min-h-screen bg-gray-50 pb-24">
        <header class="bg-white border-b border-gray-100 p-4 sticky top-0 z-10">
          <div class="max-w-lg mx-auto flex items-center gap-3">
            <button (click)="router.navigate(['/services', s.serviceId])" class="text-gray-500">←</button>
            <h1 class="text-lg font-bold text-gray-900">Book {{ s.title }}</h1>
          </div>
        </header>

        <div class="max-w-lg mx-auto p-5 space-y-6">
          <!-- Date & Time -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wider">Schedule</h2>
            <div class="grid grid-cols-1 gap-4">
              <div class="space-y-1">
                <label class="text-xs text-gray-400 font-medium">Select Date & Time</label>
                <input type="datetime-local" [(ngModel)]="scheduledAt"
                       class="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            </div>
          </div>

          <!-- Address -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wider">Service Location</h2>
            <div class="space-y-3">
              <textarea [(ngModel)]="address" placeholder="Enter your full address..." rows="3"
                        class="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300 resize-none"></textarea>
              <button class="text-indigo-600 text-xs font-bold flex items-center gap-1">
                📍 Use Current Location
              </button>
            </div>
          </div>

          <!-- Notes -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wider">Additional Notes</h2>
            <textarea [(ngModel)]="note" placeholder="Any specific requirements?" rows="2"
                      class="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300 resize-none"></textarea>
          </div>

          <!-- Summary -->
          <div class="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 space-y-4">
            <h2 class="text-sm font-bold uppercase tracking-wider opacity-70">Price Summary</h2>
            <div class="flex justify-between items-center">
              <span>{{ s.title }}</span>
              <span class="font-bold">₹{{ s.price }}</span>
            </div>
            <div class="border-t border-white/10 pt-4 flex justify-between items-center text-lg">
              <span class="font-bold">Total Payable</span>
              <span class="font-extrabold">₹{{ s.price }}</span>
            </div>
          </div>
        </div>

        <div class="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100">
          <div class="max-w-lg mx-auto">
            <button (click)="confirmBooking()" [disabled]="!scheduledAt || !address || submittng()"
                    class="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 disabled:opacity-50 active:scale-95 transition-all">
              {{ submittng() ? 'Creating Booking...' : 'Confirm Booking' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class BookingComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);

  readonly service = signal<Service | null>(null);
  readonly loading = signal(true);
  readonly submittng = signal(false);

  scheduledAt = '';
  address = '';
  note = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('serviceId');
    if (id) {
      this.api.getService(id).subscribe({
        next: (s) => {
          this.service.set(s);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  confirmBooking() {
    const s = this.service();
    if (!s) return;

    this.submittng.set(true);
    this.api.createBooking({
      serviceId: s.serviceId,
      professionalId: s.professionalId,
      customerId: this.auth.currentUser()?.uid,
      scheduledAt: this.scheduledAt,
      address: this.address,
      note: this.note,
      agreedPrice: s.price,
      pricingType: s.pricingType,
      status: 'PENDING',
      paymentMethod: 'UPI' // Default for now
    }).subscribe({
      next: (res) => {
        this.submittng.set(false);
        this.router.navigate(['/pay', res.bookingId]);
      },
      error: () => this.submittng.set(false)
    });
  }
}
