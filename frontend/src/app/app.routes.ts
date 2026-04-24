import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/user-role.model';

export const routes: Routes = [
    // ── Default redirect ────────────────────────────────────────────────────
    { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

    // ── Auth (public) ────────────────────────────────────────────────────────
    {
        path: 'auth',
        loadChildren: () =>
            import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
    },

    // ── Customer Dashboard ────────────────────────────────────────────────────
    {
        path: 'customer',
        canActivate: [authGuard, roleGuard([UserRole.CUSTOMER])],
        loadChildren: () =>
            import('./features/customer-dashboard/customer-dashboard.routes').then(
                (m) => m.CUSTOMER_ROUTES,
            ),
    },

    // ── Professional Dashboard ────────────────────────────────────────────────
    {
        path: 'pro',
        canActivate: [authGuard, roleGuard([UserRole.PROFESSIONAL])],
        loadChildren: () =>
            import('./features/pro-dashboard/pro-dashboard.routes').then(
                (m) => m.PRO_ROUTES,
            ),
    },

    // ── Admin Panel ────────────────────────────────────────────────────────────
    {
        path: 'admin',
        canActivate: [authGuard, roleGuard([UserRole.ADMIN, UserRole.SUPER_ADMIN])],
        loadChildren: () =>
            import('./features/admin-panel/admin-panel.routes').then(
                (m) => m.ADMIN_ROUTES,
            ),
    },

    // ── Catch-all ─────────────────────────────────────────────────────────────
    { path: '**', redirectTo: 'auth/login' },
];
