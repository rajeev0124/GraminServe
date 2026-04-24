import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { FirebaseService } from '@app/shared/firebase/firebase.service';
import { DecodedIdToken } from 'firebase-admin/auth';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: DecodedIdToken;
}

/**
 * Validates the Firebase ID token from the Authorization header.
 * On success, attaches the decoded token to request.user.
 * Must be applied before RolesGuard.
 */
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or malformed Authorization header.');
    }

    const idToken = authHeader.slice(7);

    try {
      const decodedToken = await this.firebaseService.auth().verifyIdToken(idToken);
      request.user = decodedToken;
      return true;
    } catch (err) {
      this.logger.warn(`Token verification failed: ${(err as Error).message}`);
      throw new UnauthorizedException('Invalid or expired Firebase ID token.');
    }
  }
}
