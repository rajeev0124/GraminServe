/**
 * Mirrors the UserRole enum from the NestJS backend.
 * Must match the Firebase Auth custom claim value for role.
 */
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  PROFESSIONAL = 'PROFESSIONAL',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}
