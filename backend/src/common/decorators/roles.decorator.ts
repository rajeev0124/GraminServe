import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@app/common/enums';

export const ROLES_KEY = 'roles';

/**
 * Decorator to attach required roles to a route handler.
 * Usage: @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
