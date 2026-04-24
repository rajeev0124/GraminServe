import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

export interface CreateOrderOptions {
  amountPaise: number; // Amount in Indian Paise (₹1 = 100 paise)
  currency?: string;
  receipt: string; // Unique identifier — typically the booking ID
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface VerifySignaturePayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * PaymentService wraps the Razorpay Node SDK.
 *
 * - createOrder: Creates a Razorpay order to initiate a payment.
 * - verifySignature: Validates the HMAC-SHA256 signature from the Razorpay webhook
 *   or the client-side callback to prevent tampering.
 */
@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly razorpay: Razorpay;
  private readonly keySecret: string;

  constructor(private readonly config: ConfigService) {
    const keyId = this.config.getOrThrow<string>('RAZORPAY_KEY_ID');
    this.keySecret = this.config.getOrThrow<string>('RAZORPAY_KEY_SECRET');

    this.razorpay = new Razorpay({ key_id: keyId, key_secret: this.keySecret });
    this.logger.log('Razorpay client initialized.');
  }

  /**
   * Creates a Razorpay order.
   * @param options.amountPaise - Amount in paise. E.g., ₹500 → 50000 paise.
   * @returns The created Razorpay order object.
   */
  async createOrder(options: CreateOrderOptions): Promise<RazorpayOrder> {
    if (options.amountPaise <= 0) {
      throw new BadRequestException('Order amount must be greater than zero.');
    }

    try {
      const order = await this.razorpay.orders.create({
        amount: options.amountPaise,
        currency: options.currency ?? 'INR',
        receipt: options.receipt,
        notes: options.notes ?? {},
      });

      this.logger.log(`Razorpay order created: ${order.id} (receipt: ${options.receipt})`);
      return order as unknown as RazorpayOrder;
    } catch (err) {
      this.logger.error('Razorpay order creation failed.', err);
      throw new InternalServerErrorException('Payment order creation failed. Please retry.');
    }
  }

  /**
   * Verifies the Razorpay payment signature to confirm authenticity.
   *
   * Signature algorithm (from Razorpay docs):
   *   HMAC-SHA256( razorpay_order_id + "|" + razorpay_payment_id, key_secret )
   *
   * @throws BadRequestException if the signature is invalid.
   */
  verifySignature(payload: VerifySignaturePayload): void {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;

    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature),
    );

    if (!isValid) {
      this.logger.warn(
        `Signature mismatch for order: ${razorpay_order_id}, payment: ${razorpay_payment_id}`,
      );
      throw new BadRequestException('Payment signature verification failed.');
    }

    this.logger.log(`Payment verified: ${razorpay_payment_id}`);
  }
}
