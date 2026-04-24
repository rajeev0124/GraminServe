import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '@app/core/services/api.service';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'gs-add-service',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 pb-24">
      <header class="bg-white border-b border-gray-100 p-4 sticky top-0 z-10">
        <div class="max-w-lg mx-auto flex items-center gap-3">
          <button (click)="router.navigate(['/pro'])" class="text-gray-500">←</button>
          <h1 class="text-lg font-bold text-gray-900">Add New Service</h1>
        </div>
      </header>

      <div class="max-w-lg mx-auto p-5 space-y-6">
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div class="space-y-1">
            <label class="text-xs text-gray-400 font-bold uppercase tracking-wider">Category</label>
            <select [(ngModel)]="category" class="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="PLUMBING">🔧 Plumbing</option>
              <option value="ELECTRICAL">⚡ Electrical</option>
              <option value="CARPENTRY">🪚 Carpentry</option>
              <option value="PAINTING">🎨 Painting</option>
              <option value="CLEANING">🧹 Cleaning</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="text-xs text-gray-400 font-bold uppercase tracking-wider">Service Title</label>
            <input [(ngModel)]="title" type="text" placeholder="e.g. Expert Pipe Leak Fix"
                   class="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>

          <div class="space-y-1">
            <label class="text-xs text-gray-400 font-bold uppercase tracking-wider">Description</label>
            <textarea [(ngModel)]="description" placeholder="Describe what you offer..." rows="3"
                      class="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300 resize-none"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs text-gray-400 font-bold uppercase tracking-wider">Pricing Type</label>
              <select [(ngModel)]="pricingType" class="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="HOURLY">Hourly</option>
                <option value="FIXED">Fixed Price</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="text-xs text-gray-400 font-bold uppercase tracking-wider">Price (₹)</label>
              <input [(ngModel)]="price" type="number" placeholder="500"
                     class="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs text-gray-400 font-bold uppercase tracking-wider">Coverage Radius (m)</label>
            <input [(ngModel)]="radius" type="number" placeholder="5000"
                   class="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
        </div>

        <button (click)="save()" [disabled]="!title || !price || loading()"
                class="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 disabled:opacity-50 active:scale-95 transition-all">
          {{ loading() ? 'Saving...' : 'Create Service Listing' }}
        </button>
      </div>
    </div>
  `,
})
export class AddServiceComponent {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  readonly router = inject(Router);

  loading = signal(false);

  category = 'PLUMBING';
  title = '';
  description = '';
  pricingType: 'HOURLY' | 'FIXED' = 'HOURLY';
  price = 0;
  radius = 5000;

  save() {
    this.loading.set(true);
    this.api.createService({
      professionalId: this.auth.currentUser()?.uid,
      category: this.category,
      title: this.title,
      description: this.description,
      pricingType: this.pricingType,
      price: this.price,
      coverageRadius: this.radius,
      isActive: true,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/pro']);
      },
      error: () => this.loading.set(false)
    });
  }
}
