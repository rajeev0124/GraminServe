import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'gs-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div class="w-full max-w-sm space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div class="text-center">
          <h1 class="text-3xl font-extrabold text-indigo-600">GraminServe</h1>
          <p class="mt-2 text-sm text-gray-500">Your local service marketplace</p>
        </div>

        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">+91</span>
              <input [(ngModel)]="phone" type="tel" placeholder="9876543210"
                     class="block w-full pl-12 pr-3 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-300 transition-all" />
            </div>
          </div>

          <div id="recaptcha-container"></div>

          <button (click)="sendOtp()" [disabled]="loading() || phone.length !== 10"
                  class="w-full bg-indigo-600 text-white py-3 rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200">
            {{ loading() ? 'Sending...' : 'Get OTP' }}
          </button>

          <div class="relative">
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-100"></div></div>
            <div class="relative flex justify-center text-sm"><span class="px-2 bg-white text-gray-400">or</span></div>
          </div>

          <button (click)="signInWithGoogle()" [disabled]="loading()"
                  class="w-full border border-gray-200 bg-white text-gray-700 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
            <img src="https://www.google.com/favicon.ico" class="w-4 h-4" alt="Google" />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  phone = '';
  loading = signal(false);

  sendOtp() {
    this.loading.set(true);
    this.auth.sendOtp(`+91${this.phone}`).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/auth/otp'], { queryParams: { phone: this.phone } });
      },
      error: (err) => {
        this.loading.set(false);
        console.error('OTP Send Error', err);
      }
    });
  }

  signInWithGoogle() {
    this.loading.set(true);
    this.auth.signInWithGoogle().subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Google Sign In Error', err);
      }
    });
  }
}
