import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { UserRole }   from '@app/core/models/user-role.model';

export const roleGuard = (allowed: UserRole[]): CanActivateFn => () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const role   = auth.userRole();
  return (role && allowed.includes(role)) ? true : router.parseUrl('/auth/unauthorized');
};
