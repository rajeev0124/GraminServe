/**
 * Centralises all UserRole values used across the platform.
 * These values must match the Firebase Auth custom claims set by the Admin SDK.
 */
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  PROFESSIONAL = 'PROFESSIONAL',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}
