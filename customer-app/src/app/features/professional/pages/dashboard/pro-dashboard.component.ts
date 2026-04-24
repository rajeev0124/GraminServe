import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '@app/core/services/api.service';
import { AuthService } from '@app/core/services/auth.service';
import { Booking, Service } from '@app/core/models/domain.models';

@Component({
  selector: 'gs-pro-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-gradient-to-br from-purple-600 to-indigo-700 text-white px-5 pt-10 pb-14">
        <div class="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p class="text-sm opacity-70">Professional Dashboard</p>
            <h1 class="text-xl font-bold mt-1">{{ userName() }}</h1>
          </div>
          <!-- Availability Toggle -->
          <div class="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
            <span class="text-xs">{{ isAvailable() ? 'Available' : 'Offline' }}</span>
            <button (click)="toggleAvailability()"
                    class="w-10 h-5 rounded-full transition-colors relative"
                    [class]="isAvailable() ? 'bg-green-400' : 'bg-white/30'">
              <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                    [class]="isAvailable() ? 'left-5' : 'left-0.5'"></span>
            </button>
          </div>
        </div>
      </div>

      <div class="max-w-lg mx-auto -mt-8 px-4 space-y-5 pb-10">
        <!-- Quick Actions -->
        <div class="grid grid-cols-3 gap-3">
          @for (action of quickActions; track action.label) {
            <button (click)="router.navigate([action.route])"
                    class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2 hover:border-indigo-200 transition-colors">
              <span class="text-2xl">{{ action.icon }}</span>
              <span class="text-xs text-gray-600 font-medium text-center">{{ action.label }}</span>
            </button>
          }
        </div>

        <!-- Pending Requests -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 class="text-sm font-semibold text-gray-700 mb-3">Pending Requests</h2>
          @if (pendingBookings().length === 0) {
            <p class="text-center text-gray-400 text-sm py-6">No pending requests.</p>
          }
          @for (b of pendingBookings(); track b.bookingId) {
            <div class="border border-gray-100 rounded-xl p-3 mb-2 flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-800">{{ b.address }}</p>
                <p class="text-xs text-gray-500">{{ b.scheduledAt | date:'dd MMM, hh:mm a' }} · ₹{{ b.agreedPrice }}</p>
              </div>
              <div class="flex gap-2">
                <button (click)="acceptBooking(b.bookingId)"
                        class="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">Accept</button>
                <button class="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50">Decline</button>
              </div>
            </div>
          }
        </div>

        <!-- My Services -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-semibold text-gray-700">My Services</h2>
            <button (click)="router.navigate(['/pro/add-service'])"
                    class="text-xs text-indigo-600 font-medium">+ Add</button>
          </div>
          @for (svc of myServices(); track svc.serviceId) {
            <div class="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <span class="text-xl">🛠️</span>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-800">{{ svc.title }}</p>
                <p class="text-xs text-gray-500">₹{{ svc.price }} · ★{{ svc.averageRating }}</p>
              </div>
              <span [class]="svc.isActive ? 'text-green-500' : 'text-gray-400'" class="text-xs font-medium">
                {{ svc.isActive ? 'Active' : 'Paused' }}
              </span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class ProDashboardComponent implements OnInit {
  private readonly api  = inject(ApiService);
  private readonly auth = inject(AuthService);
  readonly router       = inject(Router);

  readonly isAvailable    = signal(false);
  readonly pendingBookings = signal<Booking[]>([]);
  readonly myServices     = signal<Service[]>([]);
  readonly userName       = () => this.auth.currentUser()?.displayName ?? 'Professional';

  quickActions = [
    { icon: '📋', label: 'Requests',    route: '/pro/requests'    },
    { icon: '💰', label: 'Earnings',    route: '/pro/earnings'    },
    { icon: '🖼️', label: 'Portfolio',   route: '/pro/portfolio'   },
    { icon: '📅', label: 'Availability',route: '/pro/availability'},
    { icon: '➕', label: 'Add Service', route: '/pro/add-service' },
    { icon: '👤', label: 'Profile',     route: '/profile'         },
  ];

  ngOnInit(): void {
    this.api.getMyBookings().subscribe((b) =>
      this.pendingBookings.set(b.filter((x) => x.status === 'PENDING')),
    );
    this.api.getMyServices().subscribe((s) => this.myServices.set(s));
  }

  toggleAvailability(): void {
    const next = !this.isAvailable();
    this.isAvailable.set(next);
    this.api.setAvailability(next).subscribe();
  }

  acceptBooking(bookingId: string): void {
    this.api.updateBookingStatus(bookingId, 'ACCEPTED').subscribe(() => {
      this.pendingBookings.update((list) => list.filter((b) => b.bookingId !== bookingId));
    });
  }
}
