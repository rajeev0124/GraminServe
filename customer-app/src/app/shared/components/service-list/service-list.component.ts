import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Service } from '@app/core/models/domain.models';
import { ServiceCardComponent } from '../service-card/service-card.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'gs-service-list',
  standalone: true,
  imports: [CommonModule, ServiceCardComponent, LoadingSpinnerComponent],
  template: `
    @if (loading) {
      <gs-loading-spinner />
    } @else if (services.length === 0) {
      <div class="text-center py-16 text-gray-400">
        <p class="text-4xl mb-3">🔍</p>
        <p class="text-sm">No services found nearby. Try expanding your radius.</p>
      </div>
    } @else {
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        @for (service of services; track service.serviceId) {
          <gs-service-card [service]="service" (selected)="onSelect(service.serviceId)" />
        }
      </div>
    }
  `,
})
export class ServiceListComponent {
  @Input() services: Service[] = [];
  @Input() loading = false;

  constructor(private readonly router: Router) {}

  onSelect(serviceId: string): void {
    void this.router.navigate(['/services', serviceId]);
  }
}
