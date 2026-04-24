import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'gs-portfolio-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 pb-24">
      <header class="bg-white border-b border-gray-100 p-4 sticky top-0 z-10">
        <div class="max-w-lg mx-auto flex items-center gap-3">
          <button (click)="router.navigate(['/pro'])" class="text-gray-500">←</button>
          <h1 class="text-lg font-bold text-gray-900">Portfolio Upload</h1>
        </div>
      </header>

      <div class="max-w-lg mx-auto p-5 space-y-6">
        <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-2 border-indigo-200">
          <div class="text-5xl">📸</div>
          <div>
            <h2 class="text-sm font-bold text-gray-800">Upload Work Photos</h2>
            <p class="text-xs text-gray-400 mt-1">Showcase your before and after results.</p>
          </div>
          <button class="bg-indigo-50 text-indigo-600 px-6 py-2 rounded-xl text-sm font-bold border border-indigo-100">
            Select Files
          </button>
        </div>

        <div class="grid grid-cols-2 gap-3">
          @for (i of [1,2,3]; track i) {
            <div class="aspect-square bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400 text-xs">
              Preview {{ i }}
            </div>
          }
        </div>
      </div>

      <div class="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100">
        <div class="max-w-lg mx-auto">
          <button class="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200">
            Save Portfolio
          </button>
        </div>
      </div>
    </div>
  `,
})
export class PortfolioUploadComponent {
  readonly router = inject(Router);
}
