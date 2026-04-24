import { Injectable, inject, signal, computed } from '@angular/core';
import {
  Auth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  getIdTokenResult,
} from '@angular/fire/auth';
import { from, Observable, switchMap, of } from 'rxjs';
import { AuthUser, FirebaseClaims } from '@app/core/models/auth-user.model';
import { UserRole } from '@app/core/models/user-role.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);

  // ── Reactive state ─────────────────────────────────────────────────────────
  readonly currentUser = signal<AuthUser | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly userRole = computed(() => this.currentUser()?.role ?? null);

  private confirmationResult: ConfirmationResult | null = null;

  constructor() {
    // Subscribe to Firebase auth state on construction
    onAuthStateChanged(this.auth, (firebaseUser) => {
      if (firebaseUser) {
        this.hydrateUser(firebaseUser);
      } else {
        this.currentUser.set(null);
      }
    });
  }

  // ── Phone OTP ──────────────────────────────────────────────────────────────

  /**
   * Sends an OTP to the given phone number.
   * Requires an invisible reCAPTCHA container with id="recaptcha-container"
   * to be present in the DOM before calling this method.
   *
   * @param phoneNumber - E.164 format (e.g., +919876543210)
   */
  sendOtp(phoneNumber: string): Observable<void> {
    const verifier = new RecaptchaVerifier(
      this.auth,
      'recaptcha-container',
      { size: 'invisible' },
    );

    return from(
      signInWithPhoneNumber(this.auth, phoneNumber, verifier).then(
        (result) => {
          this.confirmationResult = result;
        },
      ),
    );
  }

  /**
   * Confirms the OTP entered by the user.
   * Returns the resolved AuthUser on success.
   */
  verifyOtp(otp: string): Observable<AuthUser> {
    if (!this.confirmationResult) {
      throw new Error('No active OTP session. Call sendOtp() first.');
    }

    return from(this.confirmationResult.confirm(otp)).pipe(
      switchMap((credential) => from(this.hydrateUser(credential.user))),
    );
  }

  // ── Social Login ────────────────────────────────────────────────────────────

  /**
   * Opens a Google sign-in popup and hydrates the user on success.
   */
  signInWithGoogle(): Observable<AuthUser> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider)).pipe(
      switchMap((credential) => from(this.hydrateUser(credential.user))),
    );
  }

  // ── Sign Out ────────────────────────────────────────────────────────────────

  signOut(): Observable<void> {
    return from(signOut(this.auth));
  }

  // ── Token ───────────────────────────────────────────────────────────────────

  /**
   * Returns a fresh Firebase ID token for the currently signed-in user.
   * Used by ApiInterceptor to attach to every NestJS request.
   */
  getIdToken(): Observable<string | null> {
    const user = this.auth.currentUser;
    if (!user) return of(null);
    return from(user.getIdToken());
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private async hydrateUser(firebaseUser: User): Promise<AuthUser> {
    const tokenResult = await getIdTokenResult(firebaseUser);
    const claims = tokenResult.claims as Partial<FirebaseClaims>;

    const authUser: AuthUser = {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName,
      phoneNumber: firebaseUser.phoneNumber,
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL,
      role: (claims['role'] as UserRole) ?? null,
      idToken: tokenResult.token,
    };

    this.currentUser.set(authUser);
    return authUser;
  }
}
