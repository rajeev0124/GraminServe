import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/auth';

/**
 * Extracts the verified Firebase token payload from the request.
 * Available after FirebaseAuthGuard has run.
 *
 * Usage: @CurrentUser() user: DecodedIdToken
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): DecodedIdToken => {
    const request = ctx.switchToHttp().getRequest<{ user: DecodedIdToken }>();
    return request.user;
  },
);
