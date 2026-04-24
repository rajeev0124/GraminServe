import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface UserRow {
  uid: string;
  displayName: string;
  phoneNumber: string;
  role: string;
  isDisabled: boolean;
  createdAt: string;
}

@Component({
  selector: 'gs-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 space-y-5">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-900">User Management</h2>
        <span class="text-sm text-gray-500">{{ users().length }} users</span>
      </div>

      <!-- Filters -->
      <div class="flex gap-3 flex-wrap">
        <select [(ngModel)]="selectedRole" (change)="applyFilters()"
                class="text-sm border rounded-lg px-3 py-2 bg-white shadow-sm">
          <option value="">All Roles</option>
          <option value="CUSTOMER">Customer</option>
          <option value="PROFESSIONAL">Professional</option>
          <option value="ADMIN">Admin</option>
        </select>
        <input [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Search by name or phone…"
               class="text-sm border rounded-lg px-3 py-2 bg-white shadow-sm flex-1 min-w-48" />
      </div>

      <!-- Table -->
      <div class="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
            <tr>
              <th class="px-4 py-3 text-left">Name</th>
              <th class="px-4 py-3 text-left">Phone</th>
              <th class="px-4 py-3 text-left">Role</th>
              <th class="px-4 py-3 text-left">Joined</th>
              <th class="px-4 py-3 text-left">Status</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 bg-white">
            @for (user of filtered(); track user.uid) {
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 font-medium text-gray-800">{{ user.displayName }}</td>
                <td class="px-4 py-3 text-gray-600">{{ user.phoneNumber }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                        [class]="roleBadgeClass(user.role)">{{ user.role }}</span>
                </td>
                <td class="px-4 py-3 text-gray-500">{{ user.createdAt }}</td>
                <td class="px-4 py-3">
                  <span [class]="user.isDisabled ? 'text-red-500' : 'text-green-600'"
                        class="text-xs font-medium">
                    {{ user.isDisabled ? 'Suspended' : 'Active' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right space-x-2">
                  <button (click)="toggleSuspend(user)"
                          class="text-xs px-3 py-1 rounded-lg border transition-colors"
                          [class]="user.isDisabled ? 'border-green-300 text-green-600 hover:bg-green-50' : 'border-red-300 text-red-600 hover:bg-red-50'">
                    {{ user.isDisabled ? 'Reinstate' : 'Suspend' }}
                  </button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="text-center py-10 text-gray-400">No users found.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class UsersComponent implements OnInit {
  readonly users = signal<UserRow[]>([]);
  readonly filtered = signal<UserRow[]>([]);
  selectedRole = '';
  searchTerm = '';

  ngOnInit(): void {
    // TODO: load from HttpClient → backend /users
    this.applyFilters();
  }

  applyFilters(): void {
    let data = this.users();
    if (this.selectedRole) data = data.filter((u) => u.role === this.selectedRole);
    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      data = data.filter(
        (u) => u.displayName.toLowerCase().includes(q) || u.phoneNumber.includes(q),
      );
    }
    this.filtered.set(data);
  }

  toggleSuspend(user: UserRow): void {
    // TODO: call backend PATCH /admin/users/:uid/suspend or reinstate
    this.users.update((list) =>
      list.map((u) => u.uid === user.uid ? { ...u, isDisabled: !u.isDisabled } : u),
    );
    this.applyFilters();
  }

  roleBadgeClass(role: string): string {
    return ({
      CUSTOMER: 'bg-blue-50 text-blue-700',
      PROFESSIONAL: 'bg-purple-50 text-purple-700',
      ADMIN: 'bg-amber-50 text-amber-700',
      SUPER_ADMIN: 'bg-red-50 text-red-700',
    })[role] ?? 'bg-gray-100 text-gray-600';
  }
}
