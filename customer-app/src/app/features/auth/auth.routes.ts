import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((c) => c.LoginComponent),
  },
  {
    path: 'otp',
    loadComponent: () =>
      import('./pages/otp/otp.component').then((c) => c.OtpComponent),
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./pages/unauthorized/unauthorized.component').then(
        (c) => c.UnauthorizedComponent,
      ),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
