import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'gs-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div class="w-full max-w-sm space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-800">Verify OTP</h1>
          <p class="mt-2 text-sm text-gray-500">Sent to +91 {{ phone }}</p>
        </div>

        <div class="space-y-6">
          <div class="flex justify-center gap-2">
            <input [(ngModel)]="otp" type="text" maxlength="6" placeholder="000000"
                   class="block w-full text-center text-2xl tracking-[0.5em] py-3 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-300 transition-all font-mono" />
          </div>

          <button (click)="verify()" [disabled]="loading() || otp.length !== 6"
                  class="w-full bg-indigo-600 text-white py-3 rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200">
            {{ loading() ? 'Verifying...' : 'Verify & Continue' }}
          </button>

          <p class="text-center text-xs text-gray-400">
            Didn't receive code? <button (click)="resend()" class="text-indigo-600 font-medium hover:underline">Resend</button>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class OtpComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  phone = '';
  otp = '';
  loading = signal(false);

  ngOnInit() {
    this.phone = this.route.snapshot.queryParamMap.get('phone') || '';
  }

  verify() {
    this.loading.set(true);
    this.auth.verifyOtp(this.otp).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('OTP Verification Error', err);
      }
    });
  }

  resend() {
    this.router.navigate(['/auth/login']);
  }
}
