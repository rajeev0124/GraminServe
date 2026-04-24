import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'gs-search-bar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex gap-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
      <div class="flex items-center gap-2 flex-1 px-3">
        <span class="text-gray-400">🔍</span>
        <input [(ngModel)]="keyword" (ngModelChange)="keywordChange.emit($event)"
               [placeholder]="placeholder"
               class="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent" />
      </div>
      <select [(ngModel)]="category" (ngModelChange)="categoryChange.emit($event)"
              class="text-sm border-l pl-3 pr-2 outline-none text-gray-600 bg-transparent">
        <option value="">All Categories</option>
        <option value="PLUMBING">🔧 Plumbing</option>
        <option value="ELECTRICAL">⚡ Electrical</option>
        <option value="CARPENTRY">🪚 Carpentry</option>
        <option value="PAINTING">🎨 Painting</option>
        <option value="CLEANING">🧹 Cleaning</option>
        <option value="APPLIANCE_REPAIR">🔌 Appliance Repair</option>
      </select>
      <button (click)="search.emit()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-xl transition-colors font-medium">
        Search
      </button>
    </div>
  `,
})
export class SearchBarComponent {
  @Input() placeholder = 'Search for services…';
  @Input() keyword = '';
  @Input() category = '';
  @Output() keywordChange  = new EventEmitter<string>();
  @Output() categoryChange = new EventEmitter<string>();
  @Output() search         = new EventEmitter<void>();
}
