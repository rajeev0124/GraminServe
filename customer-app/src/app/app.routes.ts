import { Routes } from '@angular/router';
import { authGuard } from '@app/core/guards/auth.guard';
import { roleGuard } from '@app/core/guards/role.guard';
import { UserRole }  from '@app/core/models/user-role.model';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // ── Public ────────────────────────────────────────────────────────────────
  {
    path: 'auth',
    loadChildren: () =>
      import('@app/features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // ── Customer ─────────────────────────────────────────────────────────────
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@app/features/customer/pages/home/home.component').then(
        (c) => c.HomeComponent,
      ),
  },
  {
    path: 'search',
    canActivate: [authGuard, roleGuard([UserRole.CUSTOMER])],
    loadComponent: () =>
      import('@app/features/customer/pages/search/search.component').then(
        (c) => c.SearchComponent,
      ),
  },
  {
    path: 'services/:serviceId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@app/features/customer/pages/service-details/service-details.component').then(
        (c) => c.ServiceDetailsComponent,
      ),
  },
  {
    path: 'book/:serviceId',
    canActivate: [authGuard, roleGuard([UserRole.CUSTOMER])],
    loadComponent: () =>
      import('@app/features/customer/pages/booking/booking.component').then(
        (c) => c.BookingComponent,
      ),
  },
  {
    path: 'pay/:bookingId',
    canActivate: [authGuard, roleGuard([UserRole.CUSTOMER])],
    loadComponent: () =>
      import('@app/features/customer/pages/payment/payment.component').then(
        (c) => c.PaymentComponent,
      ),
  },
  {
    path: 'chat/:bookingId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@app/features/customer/pages/chat/chat.component').then(
        (c) => c.ChatComponent,
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@app/features/customer/pages/profile/profile.component').then(
        (c) => c.ProfileComponent,
      ),
  },
  {
    path: 'orders',
    canActivate: [authGuard, roleGuard([UserRole.CUSTOMER])],
    loadComponent: () =>
      import('@app/features/customer/pages/order-history/order-history.component').then(
        (c) => c.OrderHistoryComponent,
      ),
  },

  // ── Professional ─────────────────────────────────────────────────────────
  {
    path: 'pro',
    canActivate: [authGuard, roleGuard([UserRole.PROFESSIONAL])],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@app/features/professional/pages/dashboard/pro-dashboard.component').then(
            (c) => c.ProDashboardComponent,
          ),
      },
      {
        path: 'add-service',
        loadComponent: () =>
          import('@app/features/professional/pages/add-service/add-service.component').then(
            (c) => c.AddServiceComponent,
          ),
      },
      {
        path: 'portfolio',
        loadComponent: () =>
          import('@app/features/professional/pages/portfolio/portfolio-upload.component').then(
            (c) => c.PortfolioUploadComponent,
          ),
      },
      {
        path: 'availability',
        loadComponent: () =>
          import('@app/features/professional/pages/availability/availability.component').then(
            (c) => c.AvailabilityComponent,
          ),
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('@app/features/professional/pages/booking-requests/booking-requests.component').then(
            (c) => c.BookingRequestsComponent,
          ),
      },
      {
        path: 'earnings',
        loadComponent: () =>
          import('@app/features/professional/pages/earnings/earnings.component').then(
            (c) => c.EarningsComponent,
          ),
      },
    ],
  },

  { path: '**', redirectTo: 'home' },
];
