import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Service } from '@app/core/models/domain.models';

@Component({
  selector: 'gs-service-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div (click)="selected.emit()"
         class="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 overflow-hidden group">

      <!-- Portfolio thumbnail -->
      <div class="relative h-36 bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
        @if (service.portfolioImages?.length) {
          <img [src]="service.portfolioImages[0]" alt="Portfolio"
               class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        } @else {
          <div class="w-full h-full flex items-center justify-center text-5xl">
            {{ categoryEmoji(service.category) }}
          </div>
        }
        <!-- Distance badge -->
        @if (service._distanceKm !== undefined) {
          <span class="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
            {{ service._distanceKm | number:'1.1-1' }} km
          </span>
        }
      </div>

      <!-- Info -->
      <div class="p-4 space-y-1.5">
        <p class="text-sm font-semibold text-gray-800 truncate">{{ service.title }}</p>
        <p class="text-xs text-gray-500 line-clamp-2">{{ service.description }}</p>

        <div class="flex items-center justify-between pt-1">
          <!-- Rating -->
          <div class="flex items-center gap-1">
            <span class="text-amber-400 text-xs">★</span>
            <span class="text-xs font-medium text-gray-700">{{ service.averageRating | number:'1.1-1' }}</span>
            <span class="text-xs text-gray-400">({{ service.totalReviews }})</span>
          </div>
          <!-- Price -->
          <p class="text-sm font-bold text-indigo-600">
            ₹{{ service.price | number }}
            <span class="text-xs font-normal text-gray-400">/ {{ service.pricingType === 'HOURLY' ? 'hr' : 'job' }}</span>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class ServiceCardComponent {
  @Input({ required: true }) service!: Service;
  @Output() selected = new EventEmitter<void>();

  categoryEmoji(cat: string): string {
    return ({
      PLUMBING: '🔧', ELECTRICAL: '⚡', CARPENTRY: '🪚',
      PAINTING: '🎨', CLEANING: '🧹', APPLIANCE_REPAIR: '🔌',
    })[cat] ?? '🛠️';
  }
}
