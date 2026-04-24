import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FirebaseService } from '@app/shared/firebase/firebase.service';
import { UserRole } from '@app/common/enums';
import { DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly firebase: FirebaseService) {}

  /**
   * Verifies a Firebase ID token and returns the decoded payload.
   * Used internally by FirebaseAuthGuard; can also be called directly.
   */
  async verifyToken(idToken: string): Promise<DecodedIdToken> {
    try {
      return await this.firebase.auth().verifyIdToken(idToken, true);
    } catch (err) {
      this.logger.warn(`Token verification failed: ${(err as Error).message}`);
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }

  /**
   * Sets a custom role claim on a Firebase user.
   * Only callable by Super Admin via the Admin SDK.
   */
  async setUserRole(uid: string, role: UserRole): Promise<void> {
    const validRoles = Object.values(UserRole) as string[];
    if (!validRoles.includes(role)) {
      throw new BadRequestException(`Invalid role: ${role}`);
    }
    await this.firebase.auth().setCustomUserClaims(uid, { role });
    this.logger.log(`Role '${role}' assigned to UID: ${uid}`);
  }

  /**
   * Revokes all refresh tokens for a user (force sign-out).
   */
  async revokeUserTokens(uid: string): Promise<void> {
    await this.firebase.auth().revokeRefreshTokens(uid);
    this.logger.log(`Tokens revoked for UID: ${uid}`);
  }
}
