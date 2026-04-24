import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '@app/core/services/api.service';
import { Booking } from '@app/core/models/domain.models';
import { LoadingSpinnerComponent } from '@app/shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'gs-payment',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    @if (loading()) {
      <gs-loading-spinner />
    } @else if (booking(); as b) {
      <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div class="w-full max-w-sm space-y-6 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <div class="text-center space-y-2">
            <h1 class="text-xl font-bold text-gray-900">Complete Payment</h1>
            <p class="text-sm text-gray-500">For Booking #{{ b.bookingId.slice(0, 8) }}</p>
          </div>

          <div class="bg-indigo-50 rounded-2xl p-6 text-center">
            <p class="text-xs text-indigo-400 uppercase font-bold tracking-widest mb-1">Amount to Pay</p>
            <p class="text-3xl font-extrabold text-indigo-600">₹{{ b.agreedPrice }}</p>
          </div>

          <div class="space-y-3">
            <p class="text-xs text-gray-400 font-bold uppercase tracking-wider text-center">Select Payment Method</p>
            
            <button class="w-full flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50 transition-all">
              <div class="flex items-center gap-3">
                <span class="text-xl">💳</span>
                <span class="font-medium text-gray-700">Razorpay (UPI, Card)</span>
              </div>
              <span class="text-indigo-600">→</span>
            </button>

            <button class="w-full flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50 transition-all opacity-50 cursor-not-allowed">
              <div class="flex items-center gap-3">
                <span class="text-xl">💵</span>
                <span class="font-medium text-gray-700">Cash on Delivery</span>
              </div>
              <span class="text-gray-400">Locked</span>
            </button>
          </div>

          <button (click)="payNow()"
                  class="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all">
            Pay with Razorpay
          </button>

          <p class="text-center text-xs text-gray-400">Secured by Razorpay</p>
        </div>
      </div>
    }
  `,
})
export class PaymentComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);

  readonly booking = signal<Booking | null>(null);
  readonly loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('bookingId');
    if (id) {
      this.api.getBooking(id).subscribe({
        next: (b) => {
          this.booking.set(b);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  payNow() {
    const b = this.booking();
    if (!b) return;

    // TODO: Implement actual Razorpay flow
    this.api.updateBookingStatus(b.bookingId, 'ACCEPTED').subscribe(() => {
      this.router.navigate(['/orders']);
    });
  }
}
