import { Component } from '@angular/core';

/**
 * Full-screen loading spinner component.
 * Usage: <gs-loading-spinner />
 */
@Component({
  selector: 'gs-loading-spinner',
  standalone: true,
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="h-14 w-14 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
    </div>
  `,
})
export class LoadingSpinnerComponent {}
