import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '@app/core/services/api.service';
import { AuthService } from '@app/core/services/auth.service';
import { ServiceListComponent } from '@app/shared/components/service-list/service-list.component';
import { SearchBarComponent }   from '@app/shared/components/search-bar/search-bar.component';
import { Service } from '@app/core/models/domain.models';

const CATEGORIES = [
  { slug: 'PLUMBING',        icon: '🔧', name: 'Plumbing'        },
  { slug: 'ELECTRICAL',      icon: '⚡', name: 'Electrical'      },
  { slug: 'CARPENTRY',       icon: '🪚', name: 'Carpentry'       },
  { slug: 'PAINTING',        icon: '🎨', name: 'Painting'        },
  { slug: 'CLEANING',        icon: '🧹', name: 'Cleaning'        },
  { slug: 'APPLIANCE_REPAIR',icon: '🔌', name: 'Appliance Repair'},
];

@Component({
  selector: 'gs-home',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, ServiceListComponent],
  template: `
    <div class="min-h-screen bg-gray-50">

      <!-- Hero Banner -->
      <div class="bg-gradient-to-br from-indigo-600 to-purple-700 text-white px-5 pt-10 pb-16">
        <div class="max-w-lg mx-auto space-y-3">
          <p class="text-sm font-medium opacity-80">Welcome back, {{ userName() }} 👋</p>
          <h1 class="text-2xl font-bold leading-tight">Find Trusted Professionals Near You</h1>
          <p class="text-sm opacity-70">Plumbing, Electrical, Carpentry & more — in your village or town.</p>

          <!-- Search Bar -->
          <div class="mt-5">
            <gs-search-bar (search)="onSearch()" [(keyword)]="keyword" [(category)]="selectedCategory" />
          </div>
        </div>
      </div>

      <div class="max-w-lg mx-auto -mt-6 px-4 space-y-6 pb-10">

        <!-- Category Grid -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 class="text-sm font-semibold text-gray-700 mb-3">Browse by Category</h2>
          <div class="grid grid-cols-3 gap-3">
            @for (cat of categories; track cat.slug) {
              <button (click)="filterByCategory(cat.slug)"
                      class="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-indigo-50 transition-colors"
                      [class.bg-indigo-50]="selectedCategory === cat.slug"
                      [class.ring-1]="selectedCategory === cat.slug"
                      [class.ring-indigo-300]="selectedCategory === cat.slug">
                <span class="text-2xl">{{ cat.icon }}</span>
                <span class="text-xs text-gray-600 font-medium text-center leading-tight">{{ cat.name }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Nearby Services -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-semibold text-gray-700">Nearby Services</h2>
            <button (click)="router.navigate(['/search'])" class="text-xs text-indigo-600 font-medium">See all</button>
          </div>
          <gs-service-list [services]="nearbyServices()" [loading]="loading()" />
        </div>
      </div>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  private readonly api  = inject(ApiService);
  private readonly auth = inject(AuthService);
  readonly router       = inject(Router);

  readonly nearbyServices = signal<Service[]>([]);
  readonly loading        = signal(false);
  readonly userName       = () => this.auth.currentUser()?.displayName ?? 'there';

  categories      = CATEGORIES;
  keyword         = '';
  selectedCategory = '';

  ngOnInit(): void {
    this.loadNearby();
  }

  private loadNearby(): void {
    this.loading.set(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.api.searchServices({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          radiusMetres: 5000,
          category: this.selectedCategory || undefined,
        }).subscribe({
          next: (services) => { this.nearbyServices.set(services); this.loading.set(false); },
          error: () => this.loading.set(false),
        });
      },
      () => this.loading.set(false),
    );
  }

  filterByCategory(cat: string): void {
    this.selectedCategory = this.selectedCategory === cat ? '' : cat;
    this.loadNearby();
  }

  onSearch(): void {
    void this.router.navigate(['/search'], {
      queryParams: { q: this.keyword, category: this.selectedCategory },
    });
  }
}
