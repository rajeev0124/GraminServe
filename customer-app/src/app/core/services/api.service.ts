import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Service, Booking } from '@app/core/models/domain.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  // ── Service Discovery ──────────────────────────────────────────────────────

  searchServices(params: {
    lat: number; lng: number; radiusMetres: number;
    category?: string; maxPrice?: number; sortBy?: string;
  }): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.base}/discover`, { params: params as Record<string, string | number> });
  }

  getService(serviceId: string): Observable<Service> {
    return this.http.get<Service>(`${this.base}/services/${serviceId}`);
  }

  // ── Bookings ───────────────────────────────────────────────────────────────

  createBooking(dto: Partial<Booking>): Observable<{ bookingId: string }> {
    return this.http.post<{ bookingId: string }>(`${this.base}/bookings`, dto);
  }

  getBooking(bookingId: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.base}/bookings/${bookingId}`);
  }

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.base}/bookings/mine`);
  }

  updateBookingStatus(bookingId: string, status: string): Observable<Booking> {
    return this.http.patch<Booking>(`${this.base}/bookings/${bookingId}/status`, { status });
  }

  // ── Payments ───────────────────────────────────────────────────────────────

  createPaymentOrder(bookingId: string, amountPaise: number): Observable<{ orderId: string }> {
    return this.http.post<{ orderId: string }>(`${this.base}/payments/order`, { bookingId, amountPaise });
  }

  verifyPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.base}/payments/verify`, payload);
  }

  // ── Reviews ────────────────────────────────────────────────────────────────

  submitReview(dto: {
    bookingId: string; revieweeId: string;
    serviceId: string; rating: number; comment?: string;
  }): Observable<{ reviewId: string }> {
    return this.http.post<{ reviewId: string }>(`${this.base}/reviews`, dto);
  }

  // ── Professional ───────────────────────────────────────────────────────────

  getMyServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.base}/services/mine`);
  }

  createService(dto: Partial<Service>): Observable<{ serviceId: string }> {
    return this.http.post<{ serviceId: string }>(`${this.base}/services`, dto);
  }

  setAvailability(isAvailable: boolean): Observable<void> {
    return this.http.patch<void>(`${this.base}/professionals/me/availability`, { isAvailable });
  }
}
