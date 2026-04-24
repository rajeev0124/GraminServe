import { UserRole } from './user-role.model';

export interface AuthUser {
  uid: string;
  displayName: string | null;
  phoneNumber: string | null;
  email: string | null;
  photoURL: string | null;
  role: UserRole | null;
  idToken: string;
}
