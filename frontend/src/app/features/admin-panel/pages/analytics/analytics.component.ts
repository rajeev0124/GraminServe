import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MonthlyRevenue { month: string; revenue: number; }
interface BookingStats { status: string; count: number; color: string; }

@Component({
  selector: 'gs-analytics-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 space-y-6">
      <h2 class="text-xl font-bold text-gray-900">Analytics Dashboard</h2>

      <!-- Summary KPIs -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        @for (kpi of summaryKpis(); track kpi.label) {
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p class="text-2xl font-bold text-gray-800">{{ kpi.value }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ kpi.label }}</p>
          </div>
        }
      </div>

      <!-- Booking Status Breakdown -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">Bookings by Status</h3>
        <div class="space-y-3">
          @for (stat of bookingStats(); track stat.status) {
            <div class="flex items-center gap-3">
              <span class="text-xs w-24 text-gray-600">{{ stat.status }}</span>
              <div class="flex-1 bg-gray-100 rounded-full h-2">
                <div class="h-2 rounded-full transition-all"
                     [style.width.%]="barWidth(stat.count)"
                     [class]="stat.color"></div>
              </div>
              <span class="text-xs font-medium text-gray-700 w-8 text-right">{{ stat.count }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Monthly Revenue -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">Monthly Revenue (₹)</h3>
        <div class="flex items-end gap-2 h-32">
          @for (m of monthlyRevenue(); track m.month) {
            <div class="flex-1 flex flex-col items-center gap-1">
              <div class="w-full bg-indigo-500 rounded-t-sm transition-all"
                   [style.height.%]="revenueBarHeight(m.revenue)"></div>
              <span class="text-xs text-gray-400">{{ m.month }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class AnalyticsComponent implements OnInit {
  readonly summaryKpis = signal([
    { label: 'Total Bookings', value: '—' },
    { label: 'Completion Rate', value: '—' },
    { label: 'Avg. Rating', value: '—' },
    { label: 'Total Revenue', value: '—' },
  ]);

  readonly bookingStats = signal<BookingStats[]>([
    { status: 'COMPLETED', count: 0, color: 'bg-green-500' },
    { status: 'PENDING',   count: 0, color: 'bg-amber-400' },
    { status: 'ACCEPTED',  count: 0, color: 'bg-blue-400'  },
    { status: 'STARTED',   count: 0, color: 'bg-indigo-400'},
    { status: 'CANCELLED', count: 0, color: 'bg-red-400'   },
  ]);

  readonly monthlyRevenue = signal<MonthlyRevenue[]>(
    ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      .map((month) => ({ month, revenue: 0 })),
  );

  ngOnInit(): void {
    // TODO: inject HttpClient, call GET /analytics/metrics + /analytics/revenue
  }

  barWidth(count: number): number {
    const max = Math.max(...this.bookingStats().map((s) => s.count), 1);
    return (count / max) * 100;
  }

  revenueBarHeight(rev: number): number {
    const max = Math.max(...this.monthlyRevenue().map((m) => m.revenue), 1);
    return (rev / max) * 100;
  }
}
