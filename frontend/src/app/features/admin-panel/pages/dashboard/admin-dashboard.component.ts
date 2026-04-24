import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DashboardKpi {
  label: string;
  value: string | number;
  icon: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
}

@Component({
  selector: 'gs-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 space-y-6">
      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p class="text-sm text-gray-500 mt-1">GraminServe Platform Overview</p>
        </div>
        <span class="text-xs text-gray-400">Last updated: {{ lastUpdated() }}</span>
      </header>

      <!-- KPI Cards -->
      <section class="grid grid-cols-2 md:grid-cols-4 gap-4">
        @for (kpi of kpis(); track kpi.label) {
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-2xl">{{ kpi.icon }}</span>
              <span class="text-xs font-medium px-2 py-0.5 rounded-full"
                    [class]="kpi.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'">
                {{ kpi.trendValue }}
              </span>
            </div>
            <p class="text-2xl font-bold text-gray-800">{{ kpi.value }}</p>
            <p class="text-xs text-gray-500">{{ kpi.label }}</p>
          </div>
        }
      </section>

      <!-- Pending Verifications Alert -->
      @if (pendingVerifications() > 0) {
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <span class="text-amber-500 text-xl">⚠️</span>
          <p class="text-sm text-amber-800 font-medium">
            {{ pendingVerifications() }} professional(s) awaiting ID verification.
          </p>
          <a class="ml-auto text-xs text-amber-700 underline cursor-pointer">Review now</a>
        </div>
      }

      <!-- Open Complaints Alert -->
      @if (openComplaints() > 0) {
        <div class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <span class="text-red-500 text-xl">🚨</span>
          <p class="text-sm text-red-800 font-medium">
            {{ openComplaints() }} open complaint(s) need attention.
          </p>
          <a class="ml-auto text-xs text-red-700 underline cursor-pointer">View complaints</a>
        </div>
      }
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  readonly kpis = signal<DashboardKpi[]>([]);
  readonly pendingVerifications = signal(0);
  readonly openComplaints = signal(0);
  readonly lastUpdated = signal(new Date().toLocaleTimeString());

  ngOnInit(): void {
    this.kpis.set([
      { label: 'Total Users', value: '—', icon: '👤', trend: 'up', trendValue: '+12%' },
      { label: 'Professionals', value: '—', icon: '🔧', trend: 'up', trendValue: '+8%' },
      { label: 'Bookings Today', value: '—', icon: '📋', trend: 'up', trendValue: '+5%' },
      { label: 'Revenue (₹)', value: '—', icon: '💰', trend: 'up', trendValue: '+18%' },
    ]);
    // TODO: inject AnalyticsService via HttpClient and populate signals
  }
}
