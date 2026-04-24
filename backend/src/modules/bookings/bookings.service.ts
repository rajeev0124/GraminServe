import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FirebaseService } from '@app/shared/firebase/firebase.service';
import { BookingStatus } from '@app/common/enums';
import { FieldValue } from 'firebase-admin/firestore';

/** Valid state transitions for the booking lifecycle */
const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.PENDING]: [BookingStatus.ACCEPTED, BookingStatus.CANCELLED],
  [BookingStatus.ACCEPTED]: [BookingStatus.STARTED, BookingStatus.CANCELLED],
  [BookingStatus.STARTED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  [BookingStatus.COMPLETED]: [],
  [BookingStatus.CANCELLED]: [],
};

export interface CreateBookingDto {
  customerId: string;
  professionalId: string;
  serviceCategory: string;
  scheduledAt: string; // ISO 8601
  address: string;
  note?: string;
}

export interface Booking extends CreateBookingDto {
  id: string;
  status: BookingStatus;
  otpCode?: string;
  transactionId?: string;
  createdAt: FirebaseFirestore.FieldValue;
  updatedAt: FirebaseFirestore.FieldValue;
}

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);
  private readonly COLLECTION = 'bookings';

  constructor(private readonly firebase: FirebaseService) {}

  /**
   * Creates a new booking in Firestore with PENDING status.
   */
  async createBooking(dto: CreateBookingDto): Promise<string> {
    const ref = this.firebase.firestore().collection(this.COLLECTION).doc();
    const booking: Booking = {
      ...dto,
      id: ref.id,
      status: BookingStatus.PENDING,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await ref.set(booking);
    this.logger.log(`Booking created: ${ref.id}`);
    return ref.id;
  }

  /**
   * Retrieves a booking by ID.
   */
  async getBooking(bookingId: string): Promise<Booking> {
    const doc = await this.firebase
      .firestore()
      .collection(this.COLLECTION)
      .doc(bookingId)
      .get();

    if (!doc.exists) {
      throw new NotFoundException(`Booking ${bookingId} not found.`);
    }

    return doc.data() as Booking;
  }

  /**
   * Transitions booking to a new status, enforcing the state machine.
   */
  async updateStatus(bookingId: string, newStatus: BookingStatus): Promise<Booking> {
    const booking = await this.getBooking(bookingId);
    const allowed = ALLOWED_TRANSITIONS[booking.status];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${booking.status} to ${newStatus}.`,
      );
    }

    const updates: Partial<Booking> = {
      status: newStatus,
      updatedAt: FieldValue.serverTimestamp() as FirebaseFirestore.FieldValue,
    };

    await this.firebase
      .firestore()
      .collection(this.COLLECTION)
      .doc(bookingId)
      .update(updates);

    this.logger.log(`Booking ${bookingId}: ${booking.status} → ${newStatus}`);
    return { ...booking, ...updates };
  }

  /**
   * Stores the OTP required to complete the booking and release the payout.
   */
  async storeCompletionOtp(bookingId: string, otp: string): Promise<void> {
    await this.firebase
      .firestore()
      .collection(this.COLLECTION)
      .doc(bookingId)
      .update({ otpCode: otp, updatedAt: FieldValue.serverTimestamp() });
  }
}
