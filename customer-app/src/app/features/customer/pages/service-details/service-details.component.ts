import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '@app/core/services/api.service';
import { Service } from '@app/core/models/domain.models';
import { LoadingSpinnerComponent } from '@app/shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'gs-service-details',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  template: `
    @if (loading()) {
      <gs-loading-spinner />
    } @else if (service(); as s) {
      <div class="min-h-screen bg-gray-50 pb-24">
        <!-- Image Gallery (Simplified) -->
        <div class="h-64 bg-gray-200 relative overflow-hidden">
          @if (s.portfolioImages.length > 0) {
            <img [src]="s.portfolioImages[0]" class="w-full h-full object-cover" alt="Portfolio" />
          } @else {
            <div class="w-full h-full flex items-center justify-center text-6xl bg-indigo-100">🛠️</div>
          }
          <button (click)="router.navigate(['/home'])" class="absolute top-4 left-4 bg-white/80 backdrop-blur shadow-sm rounded-full p-2 text-gray-700">←</button>
        </div>

        <div class="max-w-lg mx-auto px-5 -mt-6">
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div class="flex justify-between items-start">
              <h1 class="text-xl font-bold text-gray-900">{{ s.title }}</h1>
              <div class="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {{ s.category }}
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <span class="text-amber-400">★</span>
                <span class="font-bold">{{ s.averageRating }}</span>
              </div>
              <span class="text-gray-300">|</span>
              <span class="text-sm text-gray-500">{{ s.totalReviews }} Reviews</span>
            </div>

            <p class="text-sm text-gray-600 leading-relaxed">{{ s.description }}</p>

            <div class="border-t border-gray-50 pt-4 flex items-center justify-between">
              <div>
                <p class="text-xs text-gray-400 uppercase font-semibold">Pricing</p>
                <p class="text-lg font-bold text-indigo-600">
                  ₹{{ s.price }} <span class="text-xs font-normal text-gray-400">/ {{ s.pricingType === 'HOURLY' ? 'hour' : 'job' }}</span>
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-400 uppercase font-semibold">Status</p>
                <p class="text-sm font-medium" [class.text-green-500]="s.isActive">{{ s.isActive ? 'Available' : 'Unavailable' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sticky Footer -->
        <div class="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100">
          <div class="max-w-lg mx-auto">
            <button (click)="bookNow()" [disabled]="!s.isActive"
                    class="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 disabled:opacity-50 active:scale-95 transition-all">
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ServiceDetailsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);

  readonly service = signal<Service | null>(null);
  readonly loading = signal(true);

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

  bookNow() {
    this.router.navigate(['/book', this.service()?.serviceId]);
  }
}
