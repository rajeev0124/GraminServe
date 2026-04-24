import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'gs-rating',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-3">
      <!-- Stars -->
      <div class="flex items-center gap-1">
        @for (star of stars; track star) {
          <button (click)="setRating(star)"
                  (mouseenter)="hovered.set(star)"
                  (mouseleave)="hovered.set(0)"
                  class="text-3xl transition-transform hover:scale-110 focus:outline-none">
            {{ (hovered() || value) >= star ? '★' : '☆' }}
          </button>
        }
        @if (value > 0) {
          <span class="ml-2 text-sm text-gray-600 font-medium">{{ labels[value - 1] }}</span>
        }
      </div>
      <!-- Comment -->
      @if (showComment) {
        <textarea [(ngModel)]="comment" (ngModelChange)="commentChange.emit($event)"
                  placeholder="Share your experience (optional)…"
                  rows="3"
                  class="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none outline-none focus:ring-2 focus:ring-indigo-300">
        </textarea>
      }
    </div>
  `,
})
export class RatingComponent {
  @Input() value = 0;
  @Input() showComment = true;
  @Output() valueChange   = new EventEmitter<number>();
  @Output() commentChange = new EventEmitter<string>();

  readonly stars   = [1, 2, 3, 4, 5];
  readonly labels  = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  readonly hovered = signal(0);
  comment = '';

  setRating(star: number): void {
    this.value = star;
    this.valueChange.emit(star);
  }
}
