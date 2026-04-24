export interface Service {
  serviceId: string;
  professionalId: string;
  category: string;
  title: string;
  description: string;
  pricingType: 'HOURLY' | 'FIXED';
  price: number;
  coverageRadius: number;
  portfolioImages: string[];
  isActive: boolean;
  averageRating: number;
  totalReviews: number;
  _distanceKm?: number;
}

export type BookingStatus =
  | 'PENDING' | 'ACCEPTED' | 'STARTED' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
  bookingId: string;
  customerId: string;
  professionalId: string;
  serviceId: string;
  status: BookingStatus;
  scheduledAt: string;
  address: string;
  agreedPrice: number;
  pricingType: 'HOURLY' | 'FIXED';
  paymentMethod: 'UPI' | 'CARD' | 'WALLET' | 'COD';
  razorpayOrderId: string | null;
  note: string | null;
  createdAt: string;
}

export interface ChatMessage {
  key?: string;
  senderUid: string;
  text?: string;
  imageUrl?: string | null;
  timestamp: number;
  read: boolean;
}
