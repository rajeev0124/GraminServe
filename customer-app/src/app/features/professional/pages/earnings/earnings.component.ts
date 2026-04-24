import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'gs-earnings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 pb-20">
      <header class="bg-white border-b border-gray-100 p-4 sticky top-0 z-10">
        <div class="max-w-lg mx-auto flex items-center gap-3">
          <button (click)="router.navigate(['/pro'])" class="text-gray-500">←</button>
          <h1 class="text-lg font-bold text-gray-900">Earnings</h1>
        </div>
      </header>

      <div class="max-w-lg mx-auto p-5 space-y-6">
        <div class="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 text-center space-y-2">
          <p class="text-xs uppercase tracking-widest opacity-70">Withdrawable Balance</p>
          <p class="text-4xl font-extrabold">₹4,250</p>
          <button class="mt-4 bg-white text-indigo-600 px-8 py-2 rounded-full text-sm font-bold shadow-lg shadow-black/10 active:scale-95 transition-all">
            Withdraw to Bank
          </button>
        </div>

        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <h2 class="p-5 text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-50">Recent Payouts</h2>
          <div class="divide-y divide-gray-50">
            @for (p of payouts; track p.date) {
              <div class="p-5 flex justify-between items-center">
                <div>
                  <p class="text-sm font-bold text-gray-800">{{ p.amount }}</p>
                  <p class="text-xs text-gray-400">{{ p.date }} · {{ p.status }}</p>
                </div>
                <span class="text-xs font-bold text-green-500">Completed</span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EarningsComponent {
  readonly router = inject(Router);
  payouts = [
    { amount: '₹1,500', date: '24 Apr 2026', status: 'Bank Transfer' },
    { amount: '₹800',   date: '20 Apr 2026', status: 'Bank Transfer' },
    { amount: '₹2,100', date: '15 Apr 2026', status: 'Bank Transfer' },
  ];
}
