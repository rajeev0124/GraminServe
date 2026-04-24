import { Component } from '@angular/core';

@Component({
  selector: 'gs-loading-spinner',
  standalone: true,
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div class="h-14 w-14 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent shadow-lg"></div>
    </div>
  `,
})
export class LoadingSpinnerComponent {}
