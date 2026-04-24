import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MonthlyRevenue { month: string; revenue: number; bookings: number; }

@Component({
  selector: 'gs-revenue-tracking',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 space-y-6">
      <h2 class="text-xl font-bold text-gray-900">Revenue Tracking</h2>

      <div class="grid grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p class="text-xs text-gray-500 mb-1">Today</p>
          <p class="text-xl font-bold text-gray-800">₹{{ todayRevenue() | number }}</p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p class="text-xs text-gray-500 mb-1">This Month</p>
          <p class="text-xl font-bold text-indigo-600">₹{{ monthRevenue() | number }}</p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p class="text-xs text-gray-500 mb-1">Platform Commission (15%)</p>
          <p class="text-xl font-bold text-green-600">₹{{ commission() | number }}</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th class="px-4 py-3 text-left">Month</th>
              <th class="px-4 py-3 text-right">Bookings</th>
              <th class="px-4 py-3 text-right">GMV (₹)</th>
              <th class="px-4 py-3 text-right">Commission (₹)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            @for (row of monthlyData(); track row.month) {
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">{{ row.month }}</td>
                <td class="px-4 py-3 text-right text-gray-600">{{ row.bookings }}</td>
                <td class="px-4 py-3 text-right">₹{{ row.revenue | number }}</td>
                <td class="px-4 py-3 text-right text-green-600">₹{{ (row.revenue * 0.15) | number:'1.0-0' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class RevenueTrackingComponent implements OnInit {
  readonly todayRevenue = signal(0);
  readonly monthRevenue = signal(0);
  readonly commission = signal(0);
  readonly monthlyData = signal<MonthlyRevenue[]>([]);

  ngOnInit(): void {
    // TODO: load from GET /analytics/revenue
  }
}
