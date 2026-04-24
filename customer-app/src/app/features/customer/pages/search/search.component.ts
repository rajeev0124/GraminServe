import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@app/core/services/api.service';
import { Service } from '@app/core/models/domain.models';
import { SearchBarComponent }   from '@app/shared/components/search-bar/search-bar.component';
import { ServiceListComponent } from '@app/shared/components/service-list/service-list.component';

@Component({
  selector: 'gs-search',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchBarComponent, ServiceListComponent],
  template: `
    <div class="min-h-screen bg-gray-50 px-4 py-5 space-y-4 max-w-lg mx-auto">

      <gs-search-bar [(keyword)]="keyword" [(category)]="category" (search)="runSearch()" />

      <!-- Radius Selector -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
        <span class="text-sm text-gray-600 font-medium whitespace-nowrap">Radius:</span>
        <input type="range" [(ngModel)]="radius" [min]="2" [max]="20" [step]="1"
               (change)="runSearch()"
               class="flex-1 accent-indigo-600" />
        <span class="text-sm font-semibold text-indigo-600 w-14 text-right">{{ radius }} km</span>
      </div>

      <!-- Sort -->
      <div class="flex gap-2">
        @for (opt of sortOptions; track opt.value) {
          <button (click)="setSortBy(opt.value)"
                  class="text-xs px-3 py-1.5 rounded-full border transition-colors font-medium"
                  [class]="sortBy === opt.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'">
            {{ opt.label }}
          </button>
        }
      </div>

      <!-- Results -->
      <p class="text-xs text-gray-500">{{ results().length }} services found</p>
      <gs-service-list [services]="results()" [loading]="loading()" />
    </div>
  `,
})
export class SearchComponent implements OnInit {
  private readonly api   = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  readonly results = signal<Service[]>([]);
  readonly loading = signal(false);

  keyword  = '';
  category = '';
  radius   = 5;
  sortBy   = 'distance';

  sortOptions = [
    { label: '📍 Nearest', value: 'distance' },
    { label: '⭐ Top Rated', value: 'rating'   },
    { label: '💰 Cheapest', value: 'price'    },
  ];

  ngOnInit(): void {
    this.route.queryParams.subscribe((p) => {
      this.keyword  = p['q']        ?? '';
      this.category = p['category'] ?? '';
      this.runSearch();
    });
  }

  setSortBy(val: string): void {
    this.sortBy = val;
    this.runSearch();
  }

  runSearch(): void {
    this.loading.set(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.api.searchServices({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          radiusMetres: this.radius * 1000,
          category: this.category || undefined,
          sortBy: this.sortBy as 'distance' | 'price' | 'rating',
        }).subscribe({
          next: (s) => { this.results.set(s); this.loading.set(false); },
          error: () => this.loading.set(false),
        });
      },
      () => this.loading.set(false),
    );
  }
}
