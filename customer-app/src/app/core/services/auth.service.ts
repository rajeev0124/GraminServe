import { Injectable, inject, signal, computed } from '@angular/core';
import {
  Auth, signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult,
  GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
  User, getIdTokenResult,
} from '@angular/fire/auth';
import { from, Observable, switchMap, of } from 'rxjs';
import { AuthUser } from '@app/core/models/auth-user.model';
import { UserRole } from '@app/core/models/user-role.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);

  readonly currentUser    = signal<AuthUser | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly userRole        = computed(() => this.currentUser()?.role ?? null);

  private confirmationResult: ConfirmationResult | null = null;

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) void this.hydrateUser(user);
      else this.currentUser.set(null);
    });
  }

  // ── Phone OTP ──────────────────────────────────────────────────────────────

  /** Sends OTP. Requires <div id="recaptcha-container"> in the DOM. */
  sendOtp(phoneNumber: string): Observable<void> {
    const verifier = new RecaptchaVerifier(this.auth, 'recaptcha-container', { size: 'invisible' });
    return from(
      signInWithPhoneNumber(this.auth, phoneNumber, verifier).then((r) => {
        this.confirmationResult = r;
      }),
    );
  }

  verifyOtp(otp: string): Observable<AuthUser> {
    if (!this.confirmationResult) throw new Error('No active OTP session.');
    return from(this.confirmationResult.confirm(otp)).pipe(
      switchMap((cred) => from(this.hydrateUser(cred.user))),
    );
  }

  // ── Google ─────────────────────────────────────────────────────────────────

  signInWithGoogle(): Observable<AuthUser> {
    return from(signInWithPopup(this.auth, new GoogleAuthProvider())).pipe(
      switchMap((cred) => from(this.hydrateUser(cred.user))),
    );
  }

  // ── Sign Out ────────────────────────────────────────────────────────────────

  signOut(): Observable<void> {
    return from(signOut(this.auth));
  }

  // ── Token ───────────────────────────────────────────────────────────────────

  getIdToken(): Observable<string | null> {
    const user = this.auth.currentUser;
    if (!user) return of(null);
    return from(user.getIdToken());
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  private async hydrateUser(firebaseUser: User): Promise<AuthUser> {
    const tokenResult = await getIdTokenResult(firebaseUser);
    const role = (tokenResult.claims['role'] as UserRole) ?? null;
    const authUser: AuthUser = {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName,
      phoneNumber: firebaseUser.phoneNumber,
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL,
      role,
      idToken: tokenResult.token,
    };
    this.currentUser.set(authUser);
    return authUser;
  }
}
