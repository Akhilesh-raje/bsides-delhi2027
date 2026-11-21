/**
 * Neo-Delhi 3D Cybersecurity Conference (BSides Delhi 2027)
 * Ticket System Types & Pricing Constants
 *
 * Design Tokens Reference:
 * - obsidian: #08090D (bg)
 * - surface: #111319
 * - gunmetal: #252831
 * - crimson: #9D071A (glow only)
 * - signal: #D62E42 (buttons/headings)
 * - silver: #E5E1DF (text)
 * - muted: #99949A
 */

export type TicketTierId =
  | "student"
  | "individual"
  | "corporate"
  | "workshop"
  | "vip";

export type TicketCategory = "conference" | "workshop" | "all-access";

export type TShirtSize = "XS" | "S" | "M" | "L" | "XL" | "2XL" | "3XL";

export type DietaryPreference =
  | "vegetarian"
  | "non-vegetarian"
  | "vegan"
  | "jain"
  | "no-preference";

export type TicketStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "refunded"
  | "checked_in";

/**
 * Feature breakdown per ticket tier
 */
export interface TicketFeatures {
  conferencePass: boolean;
  workshopAccess: boolean;
  electronicPcbBadge: boolean;
  ctfAccess: boolean;
  networkingDinner: boolean;
  corporateLounge: boolean;
  gstInvoice: boolean;
  lunchAndCatering: boolean;
  certificateOfAttendance: boolean;
  swagTier: "standard" | "deluxe" | "cyberpunk-elite";
}

/**
 * Full definition for a conference ticket tier
 */
export interface TicketTier {
  id: TicketTierId;
  name: string;
  tagline: string;
  badge?: string;
  description: string;
  price: number; // in INR
  priceInPaise: number; // For Razorpay (price * 100)
  originalPrice?: number; // Strike-through display price
  currency: "INR";
  category: TicketCategory;
  featuresList: string[];
  perks: TicketFeatures;
  available: boolean;
  soldOut: boolean;
  limit?: number;
  highlighted?: boolean;
}

/**
 * Single attendee registration input payload
 */
export interface AttendeeInput {
  fullName: string;
  email: string;
  phone: string;
  organization?: string;
  designation?: string;
  githubHandle?: string;
  discordHandle?: string;
  tshirtSize: TShirtSize;
  dietaryPreference: DietaryPreference;
  studentId?: string; // Required if tier === 'student'
  collegeName?: string; // Required if tier === 'student'
  gstNumber?: string; // Optional for corporate tax invoice
  companyAddress?: string;
}

/**
 * Registration form submission state
 */
export interface RegistrationFormData {
  tierId: TicketTierId;
  quantity: number;
  attendees: AttendeeInput[];
  agreeToCodeOfConduct: boolean;
  referralCode?: string;
  signalDiscountCode?: string;
}

/**
 * Database record schema for issued tickets (Supabase `tickets` table)
 */
export interface TicketRecord {
  id: string; // UUID primary key
  ticket_number: string; // e.g. "ND27-IND-89F1-2A"
  user_id?: string | null;
  tier_id: TicketTierId;
  tier_name: string;
  attendee_name: string;
  attendee_email: string;
  attendee_phone: string;
  organization?: string | null;
  designation?: string | null;
  tshirt_size: TShirtSize;
  dietary_preference: DietaryPreference;
  order_id: string; // Razorpay order id
  payment_id: string; // Razorpay payment id
  amount_paid: number; // In INR
  currency: string;
  qr_payload: string; // Cryptographic verification payload
  qr_data_url?: string | null;
  status: TicketStatus;
  checked_in_at?: string | null;
  checked_in_by?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Razorpay order creation response sent back to client
 */
export interface RazorpayOrderPayload {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  receipt: string;
  tier: TicketTier;
  customer: {
    name: string;
    email: string;
    contact: string;
  };
}

/**
 * Client-to-server Razorpay payment verification payload
 */
export interface PaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  registrationData: RegistrationFormData;
}

/**
 * Payment verification outcome
 */
export interface PaymentVerificationResult {
  success: boolean;
  ticketNumbers?: string[];
  tickets?: TicketRecord[];
  orderId?: string;
  message?: string;
  error?: string;
}

/**
 * All official ticket tiers for BSides Delhi 2027 (Neo-Delhi)
 */
export const TICKET_TIERS: Record<TicketTierId, TicketTier> = {
  student: {
    id: "student",
    name: "Student Hacker Pass",
    tagline: "For university students, scholars & emerging vulnerability researchers",
    badge: "STUDENT CONCESSION",
    description:
      "Full access to the 2-day main conference tracks, BSides Delhi 2027 Flagship CTF, and security villages. Valid student ID required at check-in.",
    price: 499,
    priceInPaise: 49900,
    originalPrice: 999,
    currency: "INR",
    category: "conference",
    featuresList: [
      "Full 2-Day Main Stage & Security Village Entry",
      "BSides Delhi 2027 Flagship CTF Participation",
      "Standard BSides Delhi Badge & Swag Bag",
      "Lunch, High Tea & Energy Drinks (Both Days)",
      "Digital Attendance Certificate & Verifiable Credential",
      "Valid Student ID Mandatory at Physical Desk",
    ],
    perks: {
      conferencePass: true,
      workshopAccess: false,
      electronicPcbBadge: false,
      ctfAccess: true,
      networkingDinner: false,
      corporateLounge: false,
      gstInvoice: false,
      lunchAndCatering: true,
      certificateOfAttendance: true,
      swagTier: "standard",
    },
    available: true,
    soldOut: false,
    limit: 200,
  },
  individual: {
    id: "individual",
    name: "Individual Researcher",
    tagline: "For independent security professionals, bug hunters, sysadmins & builders",
    badge: "MOST POPULAR",
    description:
      "The definitive community ticket. Access to all talk tracks, CTF, communities, Villages, and the custom Neo-Delhi Electronic LED PCB Badge.",
    price: 1499,
    priceInPaise: 149900,
    originalPrice: 2499,
    currency: "INR",
    category: "conference",
    highlighted: true,
    featuresList: [
      "Full 2-Day Access to All Conference Stages",
      "Custom Neo-Delhi Hardware LED PCB Badge",
      "Full CTF Eligibility & Bug Bounty Village Access",
      "Community Networking Mixer & Neo-Delhi After-Hours",
      "Gourmet Lunch, High Tea & All-Day Coffee",
      "Full Digital Credential & Swag Pack",
    ],
    perks: {
      conferencePass: true,
      workshopAccess: false,
      electronicPcbBadge: true,
      ctfAccess: true,
      networkingDinner: false,
      corporateLounge: false,
      gstInvoice: true,
      lunchAndCatering: true,
      certificateOfAttendance: true,
      swagTier: "deluxe",
    },
    available: true,
    soldOut: false,
    limit: 600,
  },
  workshop: {
    id: "workshop",
    name: "Technical Masterclass Pass",
    tagline: "Intensive 4-hour hands-on technical training with industry offensive leaders",
    badge: "HANDS-ON LABS",
    description:
      "Includes 1 selected deep-dive workshop pass plus complete 2-day main conference entry, dedicated cloud target ranges, and workshop completion certificate.",
    price: 2999,
    priceInPaise: 299900,
    originalPrice: 4499,
    currency: "INR",
    category: "workshop",
    featuresList: [
      "Access to 1 Selected Deep-Dive Hands-on Masterclass",
      "Full 2-Day Conference Main Track Entry Included",
      "Dedicated High-Performance Cloud Lab Range",
      "Take-Home Lab Materials, Exploit Code & Slides",
      "Official Workshop Completion Certificate",
      "Neo-Delhi Hardware LED PCB Badge & Deluxe Swag",
    ],
    perks: {
      conferencePass: true,
      workshopAccess: true,
      electronicPcbBadge: true,
      ctfAccess: true,
      networkingDinner: false,
      corporateLounge: false,
      gstInvoice: true,
      lunchAndCatering: true,
      certificateOfAttendance: true,
      swagTier: "deluxe",
    },
    available: true,
    soldOut: false,
    limit: 120,
  },
  corporate: {
    id: "corporate",
    name: "Corporate Pro Pass",
    tagline: "For enterprise security engineers, SOC analysts, CISOs & sponsored delegates",
    badge: "CORPORATE DELEGATE",
    description:
      "Streamlined corporate billing with GST invoice, express registration desk, priority seating, and access to the executive networking lounge.",
    price: 4999,
    priceInPaise: 499900,
    originalPrice: 6999,
    currency: "INR",
    category: "conference",
    featuresList: [
      "Complete 2-Day All-Track Conference Access",
      "Express VIP Fast-Track Registration Desk",
      "Corporate Networking Lounge & Executive Mixer",
      "Formal Tax Invoice with GSTIN for Company Reimbursement",
      "Priority Keynote Seating & Early Workshop Booking",
      "Full Deluxe Cyberpunk Swag Box + Hardware Badge",
    ],
    perks: {
      conferencePass: true,
      workshopAccess: true,
      electronicPcbBadge: true,
      ctfAccess: true,
      networkingDinner: false,
      corporateLounge: true,
      gstInvoice: true,
      lunchAndCatering: true,
      certificateOfAttendance: true,
      swagTier: "deluxe",
    },
    available: true,
    soldOut: false,
    limit: 250,
  },
  vip: {
    id: "vip",
    name: "Neo-Delhi VIP / Patron",
    tagline: "Exclusive patron pass funding community diversity & student grants",
    badge: "LIMITED (25 PASSES)",
    description:
      "All-inclusive ultimate pass. Includes the private speaker dinner, numbered collector-edition cyber badge, front-row keynote seats, and private lounge.",
    price: 9999,
    priceInPaise: 999900,
    originalPrice: 12999,
    currency: "INR",
    category: "all-access",
    featuresList: [
      "All-Access (Main Stages + All Workshops + CTF)",
      "Exclusive Speaker & Patron Networking Dinner (Friday Eve)",
      "Custom Laser-Engraved Numbered Neo-Delhi Cyberpunk Badge",
      "Front-Row Keynote Seating & Speaker Lounge Access",
      "Direct 1-on-1 Mentorship Sessions with Keynote Speakers",
      "Collector Edition Merch Box & Limited Cyberpunk Challenge Coin",
    ],
    perks: {
      conferencePass: true,
      workshopAccess: true,
      electronicPcbBadge: true,
      ctfAccess: true,
      networkingDinner: true,
      corporateLounge: true,
      gstInvoice: true,
      lunchAndCatering: true,
      certificateOfAttendance: true,
      swagTier: "cyberpunk-elite",
    },
    available: true,
    soldOut: false,
    limit: 25,
  },
};

/**
 * Array list of ticket tiers in recommended display order
 */
export const TICKET_TIERS_LIST: TicketTier[] = [
  TICKET_TIERS.student,
  TICKET_TIERS.individual,
  TICKET_TIERS.workshop,
  TICKET_TIERS.corporate,
  TICKET_TIERS.vip,
];

/**
 * Safely look up a ticket tier by id
 */
export function getTicketTier(id: string): TicketTier | undefined {
  if (id in TICKET_TIERS) {
    return TICKET_TIERS[id as TicketTierId];
  }
  return undefined;
}

/**
 * Format currency in Indian Rupees (INR)
 */
export function formatPriceINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
