import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'gs-availability',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 pb-24">
      <header class="bg-white border-b border-gray-100 p-4 sticky top-0 z-10">
        <div class="max-w-lg mx-auto flex items-center gap-3">
          <button (click)="router.navigate(['/pro'])" class="text-gray-500">←</button>
          <h1 class="text-lg font-bold text-gray-900">Weekly Availability</h1>
        </div>
      </header>

      <div class="max-w-lg mx-auto p-5 space-y-4">
        @for (day of days; track day) {
          <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <span class="font-medium text-gray-700">{{ day }}</span>
            <div class="flex items-center gap-3">
              <span class="text-xs text-gray-400">9:00 AM - 6:00 PM</span>
              <div class="w-10 h-5 bg-green-400 rounded-full relative">
                <div class="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow"></div>
              </div>
            </div>
          </div>
        }
      </div>

      <div class="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100">
        <div class="max-w-lg mx-auto">
          <button class="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200">
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  `,
})
export class AvailabilityComponent {
  readonly router = inject(Router);
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
}
