import QRCode from "qrcode";
import crypto from "node:crypto";
import type {
  TicketTierId,
  AttendeeInput,
  TicketRecord,
  TicketStatus,
} from "@/types/ticket";
import { TICKET_TIERS } from "@/types/ticket";

const DEFAULT_SECRET = "neo_delhi_2027_ticket_signing_secret_dev";

function getSigningSecret(): string {
  const secret = process.env.TICKET_SIGNING_SECRET;
  // The dev default is public in this repo; using it in production would let anyone forge QR passes.
  if (!secret && process.env.NODE_ENV === "production") throw new Error("TICKET_SIGNING_SECRET is not configured");
  return secret || DEFAULT_SECRET;
}

export interface TicketPayloadData {
  ticketNumber: string;
  tierId: TicketTierId;
  attendeeName: string;
  attendeeEmail: string;
  orderId: string;
  issuedAt: number;
}

export interface EncodedTicketPayload extends TicketPayloadData {
  signature: string;
}

/**
 * Generates a memorable, unique Neo-Delhi conference ticket code.
 * Format: ND27-[TIER]-[RANDOM_HEX]-[CHECKSUM]
 * Example: ND27-IND-A8B2-9F
 */
export function generateTicketNumber(tierId: TicketTierId): string {
  const tierPrefix =
    tierId === "student"
      ? "STU"
      : tierId === "individual"
      ? "IND"
      : tierId === "workshop"
      ? "WRK"
      : tierId === "corporate"
      ? "COR"
      : "VIP";

  const randomBytes = crypto.randomBytes(3).toString("hex").toUpperCase();
  const checksum = crypto
    .createHash("sha256")
    .update(`${tierPrefix}-${randomBytes}`)
    .digest("hex")
    .slice(0, 2)
    .toUpperCase();

  return `ND27-${tierPrefix}-${randomBytes}-${checksum}`;
}

/**
 * Creates a cryptographically signed ticket payload for the QR code.
 * Prevents forged or altered QR badges at event check-in desks.
 */
export function createSignedTicketPayload(data: TicketPayloadData): string {
  const secret = getSigningSecret();
  const rawString = `${data.ticketNumber}|${data.tierId}|${data.attendeeEmail}|${data.orderId}|${data.issuedAt}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(rawString)
    .digest("hex")
    .slice(0, 16);

  const payload: EncodedTicketPayload = {
    ...data,
    signature,
  };

  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

/**
 * Decodes and cryptographically verifies an incoming scanned QR code payload string.
 */
export function verifyTicketPayload(
  encodedPayload: string
): { valid: boolean; data?: TicketPayloadData; error?: string } {
  try {
    const jsonStr = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const parsed = JSON.parse(jsonStr) as EncodedTicketPayload;

    if (
      !parsed.ticketNumber ||
      !parsed.tierId ||
      !parsed.attendeeEmail ||
      !parsed.orderId ||
      !parsed.issuedAt ||
      !parsed.signature
    ) {
      return { valid: false, error: "Malformed ticket payload structure" };
    }

    const secret = getSigningSecret();
    const rawString = `${parsed.ticketNumber}|${parsed.tierId}|${parsed.attendeeEmail}|${parsed.orderId}|${parsed.issuedAt}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawString)
      .digest("hex")
      .slice(0, 16);

    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const providedBuf = Buffer.from(parsed.signature, "utf8");

    if (expectedBuf.length !== providedBuf.length) {
      return { valid: false, error: "Invalid signature length" };
    }

    const match = crypto.timingSafeEqual(expectedBuf, providedBuf);
    if (!match) {
      return { valid: false, error: "Tampered or invalid signature" };
    }

    return {
      valid: true,
      data: {
        ticketNumber: parsed.ticketNumber,
        tierId: parsed.tierId,
        attendeeName: parsed.attendeeName,
        attendeeEmail: parsed.attendeeEmail,
        orderId: parsed.orderId,
        issuedAt: parsed.issuedAt,
      },
    };
  } catch (err: any) {
    return { valid: false, error: err?.message || "Failed to parse QR payload" };
  }
}

/**
 * Generates a base64 Data URL (data:image/png;base64,...) of the QR code.
 *
 * Uses Error Correction Level 'H' (30% recovery) to ensure badges scan reliably
 * even in low-light cyber venue environments or with minor surface scratches.
 */
export async function generateTicketQRCodeDataURL(
  payload: string,
  options?: {
    darkColor?: string;
    lightColor?: string;
    width?: number;
  }
): Promise<string> {
  const {
    darkColor = "#08090D", // Obsidian
    lightColor = "#FFFFFF", // High-contrast white for physical badge scanners
    width = 300,
  } = options || {};

  return await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "H",
    margin: 2,
    width,
    color: {
      dark: darkColor,
      light: lightColor,
    },
  });
}

/**
 * Generates an SVG vector string of the QR code for high-resolution print badges.
 */
export async function generateTicketQRCodeSVG(
  payload: string,
  options?: {
    darkColor?: string;
    lightColor?: string;
  }
): Promise<string> {
  const { darkColor = "#000000", lightColor = "#FFFFFF" } = options || {};

  return await QRCode.toString(payload, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 2,
    color: {
      dark: darkColor,
      light: lightColor,
    },
  });
}

/**
 * Helper to construct a complete, ready-to-insert TicketRecord from registration details.
 */
export async function buildTicketRecord({
  tierId,
  attendee,
  orderId,
  paymentId,
  amountPaid,
}: {
  tierId: TicketTierId;
  attendee: AttendeeInput;
  orderId: string;
  paymentId: string;
  amountPaid: number;
}): Promise<TicketRecord> {
  const tier = TICKET_TIERS[tierId];
  const ticketNumber = generateTicketNumber(tierId);
  const issuedAt = Date.now();

  const qrPayload = createSignedTicketPayload({
    ticketNumber,
    tierId,
    attendeeName: attendee.fullName,
    attendeeEmail: attendee.email,
    orderId,
    issuedAt,
  });

  const qrDataUrl = await generateTicketQRCodeDataURL(qrPayload);

  const nowIso = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    ticket_number: ticketNumber,
    user_id: null,
    tier_id: tierId,
    tier_name: tier?.name || tierId,
    attendee_name: attendee.fullName,
    attendee_email: attendee.email,
    attendee_phone: attendee.phone,
    organization: attendee.organization || null,
    designation: attendee.designation || null,
    tshirt_size: attendee.tshirtSize,
    dietary_preference: attendee.dietaryPreference,
    order_id: orderId,
    payment_id: paymentId,
    amount_paid: amountPaid,
    currency: "INR",
    qr_payload: qrPayload,
    qr_data_url: qrDataUrl,
    status: "confirmed" as TicketStatus,
    checked_in_at: null,
    checked_in_by: null,
    created_at: nowIso,
    updated_at: nowIso,
  };
}
