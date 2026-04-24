import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'gs-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <div class="w-full max-w-sm space-y-6">
        <p class="text-6xl">🚫</p>
        <h1 class="text-2xl font-bold text-gray-800">Access Denied</h1>
        <p class="text-sm text-gray-500">You do not have the required role to access this page.</p>
        <a routerLink="/home" class="inline-block bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
          Go Back Home
        </a>
      </div>
    </div>
  `,
})
export class UnauthorizedComponent {}
