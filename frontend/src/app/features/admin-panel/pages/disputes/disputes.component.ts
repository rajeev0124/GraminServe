import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Complaint {
  complaintId: string;
  reporterName: string;
  againstName: string;
  reason: string;
  description: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

@Component({
  selector: 'gs-complaint-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 space-y-5">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-900">Complaint Management</h2>
        <select [(ngModel)]="statusFilter" (change)="applyFilter()"
                class="text-sm border rounded-lg px-3 py-2 bg-white shadow-sm">
          <option value="">All Status</option>
          <option value="OPEN">Open</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="RESOLVED">Resolved</option>
          <option value="DISMISSED">Dismissed</option>
        </select>
      </div>

      <div class="space-y-3">
        @for (c of filtered(); track c.complaintId) {
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div class="flex items-start gap-4">
              <div class="flex-1 space-y-1">
                <div class="flex items-center gap-2">
                  <span [class]="statusClass(c.status)"
                        class="text-xs font-semibold px-2 py-0.5 rounded-full">{{ c.status }}</span>
                  <span class="text-xs text-gray-400">{{ c.createdAt }}</span>
                </div>
                <p class="text-sm font-medium text-gray-800">
                  {{ c.reporterName }}
                  <span class="text-gray-400 font-normal"> reported </span>
                  {{ c.againstName }}
                </p>
                <p class="text-xs text-gray-500 font-medium">{{ c.reason }}</p>
                <p class="text-xs text-gray-400">{{ c.description }}</p>
              </div>
              @if (c.status === 'OPEN' || c.status === 'UNDER_REVIEW') {
                <div class="flex flex-col gap-2">
                  <button (click)="resolve(c)" class="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700">Resolve</button>
                  <button (click)="dismiss(c)" class="text-xs px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">Dismiss</button>
                </div>
              }
            </div>
          </div>
        } @empty {
          <div class="text-center py-16 text-gray-400 text-sm">No complaints found.</div>
        }
      </div>
    </div>
  `,
})
export class DisputesComponent implements OnInit {
  readonly complaints = signal<Complaint[]>([]);
  readonly filtered = signal<Complaint[]>([]);
  statusFilter = '';

  ngOnInit(): void {
    // TODO: load from HttpClient → GET /admin/complaints
    this.applyFilter();
  }

  applyFilter(): void {
    const data = this.complaints();
    this.filtered.set(this.statusFilter ? data.filter((c) => c.status === this.statusFilter) : data);
  }

  resolve(c: Complaint): void {
    // TODO: PATCH /admin/complaints/:id/resolve
    this.complaints.update((list) =>
      list.map((x) => x.complaintId === c.complaintId ? { ...x, status: 'RESOLVED' as const } : x),
    );
    this.applyFilter();
  }

  dismiss(c: Complaint): void {
    // TODO: PATCH /admin/complaints/:id/dismiss
    this.complaints.update((list) =>
      list.map((x) => x.complaintId === c.complaintId ? { ...x, status: 'DISMISSED' as const } : x),
    );
    this.applyFilter();
  }

  statusClass(status: string): string {
    return ({
      OPEN: 'bg-red-50 text-red-600',
      UNDER_REVIEW: 'bg-amber-50 text-amber-600',
      RESOLVED: 'bg-green-50 text-green-600',
      DISMISSED: 'bg-gray-100 text-gray-500',
    })[status] ?? '';
  }
}
