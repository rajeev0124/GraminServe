import { UserRole } from './user-role.model';

/** Shape of the Firebase DecodedIdToken custom claims we expect. */
export interface FirebaseClaims {
  role: UserRole;
}

/** Represents the authenticated user stored in AuthService. */
export interface AuthUser {
  uid: string;
  displayName: string | null;
  phoneNumber: string | null;
  email: string | null;
  photoURL: string | null;
  role: UserRole | null;
  idToken: string;
}
