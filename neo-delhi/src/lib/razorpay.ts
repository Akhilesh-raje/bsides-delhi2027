import Razorpay from "razorpay";
import crypto from "node:crypto";

/**
 * Global singleton Razorpay client instance
 */
let razorpayInstance: Razorpay | null = null;

/**
 * Returns the Razorpay Key ID for client-side checkout initiation
 */
export function getRazorpayKeyId(): string {
  return (
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    "rzp_test_placeholder"
  );
}

/**
 * Lazily instantiates and returns the Razorpay server client instance.
 *
 * Requirements:
 * - RAZORPAY_KEY_ID or NEXT_PUBLIC_RAZORPAY_KEY_ID
 * - RAZORPAY_KEY_SECRET
 */
export function getRazorpayInstance(): Razorpay {
  if (razorpayInstance) {
    return razorpayInstance;
  }

  const key_id = getRazorpayKeyId();
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder";

  if (!process.env.RAZORPAY_KEY_SECRET && process.env.NODE_ENV === "production") {
    console.error(
      "[Razorpay] CRITICAL: RAZORPAY_KEY_SECRET is not configured in production!"
    );
  }

  razorpayInstance = new Razorpay({
    key_id,
    key_secret,
  });

  return razorpayInstance;
}

export interface CreateOrderParams {
  amountInPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: "created" | "attempted" | "paid";
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

/**
 * Creates a new order on Razorpay for conference ticket purchases.
 *
 * @param params.amountInPaise - Order amount in Paise (e.g. ₹1,499 = 149900 paise)
 * @param params.receipt - Unique internal receipt reference (e.g. "rcpt_ND27_...")
 * @param params.notes - Key-value metadata (attendee email, tierId, quantity)
 */
export async function createRazorpayOrder({
  amountInPaise,
  currency = "INR",
  receipt,
  notes = {},
}: CreateOrderParams): Promise<RazorpayOrderResponse> {
  const rzp = getRazorpayInstance();

  const options = {
    amount: Math.round(amountInPaise),
    currency,
    receipt,
    notes,
  };

  const order = await rzp.orders.create(options);
  return order as unknown as RazorpayOrderResponse;
}

export interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

/**
 * Cryptographically verifies Razorpay payment signature using HMAC SHA-256.
 *
 * Uses constant-time buffer comparison (`crypto.timingSafeEqual`) to prevent
 * timing attack vulnerabilities.
 *
 * Formula: HMAC_SHA256(order_id + "|" + payment_id, secret) == signature
 */
export function verifyRazorpayPaymentSignature({
  orderId,
  paymentId,
  signature,
}: VerifyPaymentParams): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  // Never bypass: a missing secret must not let unpaid orders mint tickets.
  if (!secret) {
    console.error("[Razorpay Verification] RAZORPAY_KEY_SECRET is not configured.");
    return false;
  }

  try {
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(generatedSignature, "utf8");
    const providedBuffer = Buffer.from(signature, "utf8");

    if (expectedBuffer.length !== providedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
  } catch (err) {
    console.error("[Razorpay Signature] Verification error:", err);
    return false;
  }
}

/**
 * Cryptographically verifies Razorpay Webhook signatures (`x-razorpay-signature`).
 *
 * @param rawBody - Raw unparsed webhook request payload string
 * @param signature - Signature from `x-razorpay-signature` HTTP header
 * @param secret - Optional override (defaults to RAZORPAY_WEBHOOK_SECRET)
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string = process.env.RAZORPAY_WEBHOOK_SECRET || ""
): boolean {
  if (!secret) {
    console.error(
      "[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET is not configured."
    );
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const providedBuffer = Buffer.from(signature, "utf8");

    if (expectedBuffer.length !== providedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
  } catch (err) {
    console.error("[Razorpay Webhook] Verification error:", err);
    return false;
  }
}

/**
 * Retrieves payment status from Razorpay API
 */
export async function fetchPaymentDetails(paymentId: string) {
  const rzp = getRazorpayInstance();
  return await rzp.payments.fetch(paymentId);
}

/**
 * Retrieves order status from Razorpay API
 */
export async function fetchOrderDetails(orderId: string) {
  const rzp = getRazorpayInstance();
  return await rzp.orders.fetch(orderId);
}
