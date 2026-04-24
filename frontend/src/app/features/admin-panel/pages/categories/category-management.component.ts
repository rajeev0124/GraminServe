import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Category {
  slug: string;
  name: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
}

@Component({
  selector: 'gs-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 space-y-5">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-900">Category Management</h2>
        <button (click)="showAddForm.set(true)"
                class="text-sm bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors">
          + Add Category
        </button>
      </div>

      @if (showAddForm()) {
        <div class="bg-indigo-50 rounded-2xl border border-indigo-100 p-5 space-y-3">
          <h3 class="text-sm font-semibold text-indigo-800">New Category</h3>
          <div class="grid grid-cols-2 gap-3">
            <input [(ngModel)]="newCat.name" placeholder="Display name"
                   class="text-sm border rounded-lg px-3 py-2" />
            <input [(ngModel)]="newCat.icon" placeholder="Emoji icon (e.g. 🔧)"
                   class="text-sm border rounded-lg px-3 py-2" />
          </div>
          <div class="flex gap-2">
            <button (click)="addCategory()" class="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg">Save</button>
            <button (click)="showAddForm.set(false)" class="text-sm text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100">Cancel</button>
          </div>
        </div>
      }

      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        @for (cat of categories(); track cat.slug) {
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <span class="text-3xl">{{ cat.icon }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-800 truncate">{{ cat.name }}</p>
              <p class="text-xs text-gray-400">{{ cat.slug }}</p>
            </div>
            <button (click)="toggleActive(cat)"
                    [class]="cat.isActive ? 'text-green-500 hover:text-red-500' : 'text-red-400 hover:text-green-500'"
                    class="transition-colors text-lg" [title]="cat.isActive ? 'Deactivate' : 'Activate'">
              {{ cat.isActive ? '●' : '○' }}
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class CategoryManagementComponent implements OnInit {
  readonly categories = signal<Category[]>([]);
  readonly showAddForm = signal(false);
  newCat = { name: '', icon: '' };

  ngOnInit(): void {
    // TODO: load from GET /admin/categories
    this.categories.set([
      { slug: 'plumbing',   name: 'Plumbing',   icon: '🔧', displayOrder: 1, isActive: true },
      { slug: 'electrical', name: 'Electrical',  icon: '⚡', displayOrder: 2, isActive: true },
      { slug: 'carpentry',  name: 'Carpentry',   icon: '🪚', displayOrder: 3, isActive: true },
      { slug: 'painting',   name: 'Painting',    icon: '🎨', displayOrder: 4, isActive: true },
      { slug: 'cleaning',   name: 'Cleaning',    icon: '🧹', displayOrder: 5, isActive: true },
    ]);
  }

  addCategory(): void {
    if (!this.newCat.name || !this.newCat.icon) return;
    const slug = this.newCat.name.toLowerCase().replace(/\s+/g, '-');
    this.categories.update((list) => [
      ...list,
      { slug, name: this.newCat.name, icon: this.newCat.icon, displayOrder: list.length + 1, isActive: true },
    ]);
    this.newCat = { name: '', icon: '' };
    this.showAddForm.set(false);
  }

  toggleActive(cat: Category): void {
    this.categories.update((list) =>
      list.map((c) => c.slug === cat.slug ? { ...c, isActive: !c.isActive } : c),
    );
    // TODO: PATCH /admin/categories/:slug
  }
}
