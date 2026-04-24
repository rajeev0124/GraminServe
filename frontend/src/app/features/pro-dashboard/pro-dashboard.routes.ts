import { Routes } from '@angular/router';

export const PRO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/pro-home.component').then(
        (c) => c.ProHomeComponent,
      ),
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./pages/onboarding/pro-onboarding.component').then(
        (c) => c.ProOnboardingComponent,
      ),
  },
  {
    path: 'bookings',
    loadComponent: () =>
      import('./pages/bookings/pro-bookings.component').then(
        (c) => c.ProBookingsComponent,
      ),
  },
  {
    path: 'chat/:bookingId',
    loadComponent: () =>
      import('./pages/chat/chat-room.component').then(
        (c) => c.ChatRoomComponent,
      ),
  },
  {
    path: 'earnings',
    loadComponent: () =>
      import('./pages/earnings/earnings.component').then(
        (c) => c.EarningsComponent,
      ),
  },
  {
    path: 'portfolio',
    loadComponent: () =>
      import('./pages/portfolio/portfolio.component').then(
        (c) => c.PortfolioComponent,
      ),
  },
];
