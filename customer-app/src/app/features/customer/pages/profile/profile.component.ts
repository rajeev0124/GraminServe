import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@app/core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'gs-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 pb-20">
      <header class="bg-white p-6 shadow-sm border-b border-gray-100 flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900">Profile</h1>
        <button (click)="logout()" class="text-red-500 text-sm font-bold">Logout</button>
      </header>

      <div class="max-w-lg mx-auto p-5 space-y-6">
        <!-- User Info -->
        <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-4">
          <div class="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-4xl overflow-hidden border-4 border-white shadow-md">
            @if (user()?.photoURL; as url) {
              <img [src]="url" class="w-full h-full object-cover" />
            } @else {
              👤
            }
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ user()?.displayName || 'User' }}</h2>
            <p class="text-sm text-gray-500">{{ user()?.phoneNumber || user()?.email }}</p>
          </div>
          <span class="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {{ user()?.role }}
          </span>
        </div>

        <!-- Links -->
        <div class="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 divide-y divide-gray-50">
          @for (link of links; track link.label) {
            <button (click)="router.navigate([link.route])"
                    class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-all text-sm font-medium text-gray-700">
              <div class="flex items-center gap-3">
                <span>{{ link.icon }}</span>
                <span>{{ link.label }}</span>
              </div>
              <span class="text-gray-300">→</span>
            </button>
          }
        </div>
      </div>

      <!-- Navigation Bar Placeholder (Shared component later) -->
      <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex justify-around shadow-lg">
        <button (click)="router.navigate(['/home'])" class="text-gray-400">🏠</button>
        <button (click)="router.navigate(['/search'])" class="text-gray-400">🔍</button>
        <button (click)="router.navigate(['/orders'])" class="text-gray-400">📋</button>
        <button class="text-indigo-600">👤</button>
      </nav>
    </div>
  `,
})
export class ProfileComponent {
  private readonly auth = inject(AuthService);
  readonly router = inject(Router);

  readonly user = this.auth.currentUser;

  links = [
    { icon: '📋', label: 'My Bookings', route: '/orders' },
    { icon: '💳', label: 'Payment Methods', route: '/profile' },
    { icon: '📍', label: 'Saved Addresses', route: '/profile' },
    { icon: '⭐', label: 'My Reviews', route: '/profile' },
    { icon: '⚙️', label: 'Settings', route: '/profile' },
    { icon: '❓', label: 'Help & Support', route: '/profile' },
  ];

  logout() {
    this.auth.signOut().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }
}
