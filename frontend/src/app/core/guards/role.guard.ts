import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { UserRole } from '@app/core/models/user-role.model';

/**
 * roleGuard — Factory function that returns a CanActivateFn for the given roles.
 * Redirects to /auth/unauthorized if the user's role is not in the allowed list.
 *
 * Usage in routes:
 *   canActivate: [authGuard, roleGuard([UserRole.ADMIN])]
 */
export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const role = authService.userRole();

    if (role && allowedRoles.includes(role)) {
      return true;
    }

    return router.parseUrl('/auth/unauthorized');
  };
};
