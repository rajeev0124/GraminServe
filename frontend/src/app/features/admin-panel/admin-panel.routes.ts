import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard/admin-dashboard.component').then((c) => c.AdminDashboardComponent),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./pages/users/users.component').then((c) => c.UsersComponent),
  },
  {
    path: 'verifications',
    loadComponent: () =>
      import('./pages/verifications/verifications.component').then((c) => c.VerificationsComponent),
  },
  {
    path: 'disputes',
    loadComponent: () =>
      import('./pages/disputes/disputes.component').then((c) => c.DisputesComponent),
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('./pages/analytics/analytics.component').then((c) => c.AnalyticsComponent),
  },
  {
    path: 'revenue',
    loadComponent: () =>
      import('./pages/revenue/revenue-tracking.component').then((c) => c.RevenueTrackingComponent),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./pages/categories/category-management.component').then((c) => c.CategoryManagementComponent),
  },
];
