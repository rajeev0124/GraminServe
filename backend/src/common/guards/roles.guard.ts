import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@app/common/decorators';
import { UserRole } from '@app/common/enums';
import { DecodedIdToken } from 'firebase-admin/auth';

interface AuthenticatedRequest {
  user: DecodedIdToken & { role?: UserRole };
}

/**
 * Checks that the authenticated user's role matches the roles
 * declared via the @Roles() decorator.
 * Must run after FirebaseAuthGuard (request.user must be populated).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no @Roles() decorator is present, the route is accessible to any authenticated user.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userRole = request.user?.['role'] as UserRole | undefined;

    if (!userRole || !requiredRoles.includes(userRole)) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}.`,
      );
    }

    return true;
  }
}
