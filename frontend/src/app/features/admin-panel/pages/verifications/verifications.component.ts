import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PendingPro {
  uid: string;
  displayName: string;
  phoneNumber: string;
  city: string;
  idDocumentUrl: string;
  submittedAt: string;
}

@Component({
  selector: 'gs-professional-verification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 space-y-5">
      <h2 class="text-xl font-bold text-gray-900">
        Professional Verification
        @if (pending().length > 0) {
          <span class="ml-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {{ pending().length }}
          </span>
        }
      </h2>

      @if (pending().length === 0) {
        <div class="text-center py-20 text-gray-400">
          <p class="text-4xl mb-3">✅</p>
          <p class="text-sm">All verifications are up to date.</p>
        </div>
      }

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (pro of pending(); track pro.uid) {
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div class="flex items-start justify-between">
              <div>
                <p class="font-semibold text-gray-800">{{ pro.displayName }}</p>
                <p class="text-xs text-gray-500">{{ pro.phoneNumber }} · {{ pro.city }}</p>
                <p class="text-xs text-gray-400 mt-1">Submitted: {{ pro.submittedAt }}</p>
              </div>
              <span class="bg-amber-50 text-amber-600 text-xs px-2 py-1 rounded-lg">Pending</span>
            </div>

            <!-- ID Document Preview -->
            <div class="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 h-36 flex items-center justify-center text-gray-400 text-sm">
              📄 ID Document Preview
            </div>

            <div class="flex gap-3">
              <button (click)="approve(pro.uid)"
                      class="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-xl transition-colors">
                ✓ Approve
              </button>
              <button (click)="reject(pro.uid)"
                      class="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium py-2 rounded-xl border border-red-200 transition-colors">
                ✗ Reject
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class VerificationsComponent implements OnInit {
  readonly pending = signal<PendingPro[]>([]);

  ngOnInit(): void {
    // TODO: load from HttpClient → backend GET /admin/professionals/pending
  }

  approve(uid: string): void {
    // TODO: POST /admin/professionals/:uid/verify
    this.pending.update((list) => list.filter((p) => p.uid !== uid));
  }

  reject(uid: string): void {
    // TODO: POST /admin/professionals/:uid/reject
    this.pending.update((list) => list.filter((p) => p.uid !== uid));
  }
}
