/**
 * Neo-Delhi 3D Cybersecurity Conference
 * Frequently Asked Questions (FAQ)
 *
 * Comprehensive Q&A covering event logistics, ticketing, 3D WebGL experience,
 * CFP, CTF rules, venue access via Delhi Metro Yellow Line, and Code of Conduct.
 */

export type FAQCategoryId =
  | "general"
  | "tickets"
  | "journey"
  | "cfp"
  | "ctf"
  | "venue"
  | "conduct";

export interface FAQCategory {
  id: FAQCategoryId;
  label: string;
  icon: string;
  description: string;
}

export interface FAQItem {
  id: string;
  category: FAQCategoryId;
  question: string;
  answer: string;
  featured: boolean;
  tags: string[];
}

export const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: "general",
    label: "General & Concept",
    icon: "info",
    description: "About BSides Delhi 2027 and the Neo-Delhi vision.",
  },
  {
    id: "tickets",
    label: "Registration & Passes",
    icon: "ticket",
    description: "Ticket pricing, Razorpay/UPI payments, student discounts, and invoices.",
  },
  {
    id: "journey",
    label: "3D Neo-Delhi Experience",
    icon: "box",
    description: "Browser requirements, GPU performance, and 2D fallback mode.",
  },
  {
    id: "cfp",
    label: "CFP & Presentations",
    icon: "mic",
    description: "Call for Presentations, review criteria, and speaker perks.",
  },
  {
    id: "ctf",
    label: "24-Hour CTF & Signals",
    icon: "flag",
    description: "Capture the Flag rules, ARG puzzles, and hardware signals.",
  },
  {
    id: "venue",
    label: "Venue & Travel",
    icon: "map-pin",
    description: "Delhi Metro navigation, hotels, and physical access.",
  },
  {
    id: "conduct",
    label: "Code of Conduct",
    icon: "shield",
    description: "Harassment policy, responsible disclosure, and safety.",
  },
];

export const FAQS: FAQItem[] = [
  // ================= GENERAL =================
  {
    id: "what-is-bsides-delhi",
    category: "general",
    question: "What is BSides Delhi 2027?",
    answer:
      "BSides Delhi is an independent, community-driven cybersecurity conference organized by security practitioners, researchers, and students. Unlike traditional commercial vendor expos, BSides Delhi provides an intimate atmosphere for open dialogue, zero-day disclosures, hands-on villages, and peer networking. The 2027 edition embraces the 'Neo-Delhi' aesthetic—fusing historical Delhi landmarks with high-tech cyberpunk realities.",
    featured: true,
    tags: ["about", "concept", "community", "mission"],
  },
  {
    id: "when-and-where",
    category: "general",
    question: "When and where does the conference take place?",
    answer:
      "BSides Delhi 2027 takes place across two days on Saturday, February 13, and Sunday, February 14, 2027. The main venue is located in central New Delhi near Rajiv Chowk and Central Secretariat, with keynotes in Hall Ashoka, villages at the Palika Subterranean Hub, and evening sessions on the Rooftop Amphitheater.",
    featured: true,
    tags: ["dates", "location", "venue", "schedule"],
  },
  {
    id: "who-should-attend",
    category: "general",
    question: "Who should attend BSides Delhi?",
    answer:
      "Security engineers, penetration testers, red/blue/purple teamers, reverse engineers, cryptographic developers, cloud architects, policy makers, students, and hobbyist makers. Whether you are hunting kernel zero-days or flashing custom microcontroller badges for the first time, there is a track and village designed for you.",
    featured: false,
    tags: ["audience", "students", "professionals"],
  },

  // ================= TICKETS & REGISTRATION =================
  {
    id: "ticket-tiers",
    category: "tickets",
    question: "What ticket tiers are available and what is included?",
    answer:
      "We offer three primary passes: 1) Individual Hacker Pass (₹2,499) for students and independent researchers; 2) Professional / Corporate Pass (₹6,999) for enterprise attendees requiring GST tax invoices; and 3) VIP Neo-Delhi Patron Pass (₹14,999) which includes an exclusive custom milled hardware electronic badge, speaker dinner invitation, and VIP lounge access. All passes include lunch, refreshments, conference swag, and access to all villages and CTF.",
    featured: true,
    tags: ["pricing", "tickets", "student", "passes", "gst"],
  },
  {
    id: "payment-methods",
    category: "tickets",
    question: "Which payment methods are accepted?",
    answer:
      "Payments are securely processed via Razorpay. We support UPI (Google Pay, PhonePe, Paytm, BHIM), Indian NetBanking across all major banks, Domestic and International Debit/Credit Cards (Visa, Mastercard, RuPay, Amex), and corporate bank transfers for group orders (5+ passes).",
    featured: false,
    tags: ["razorpay", "upi", "cards", "payment"],
  },
  {
    id: "cancellation-refund",
    category: "tickets",
    question: "Can I transfer or cancel my ticket?",
    answer:
      "Tickets can be transferred to another person up to 7 days before the event (until February 6, 2027) free of charge through your attendee portal. Cancellations requested before January 20, 2027 are eligible for a 75% refund (minus payment processing fees). No refunds are granted after January 20 due to venue catering and badge manufacturing commitments.",
    featured: false,
    tags: ["refund", "cancellation", "transfer"],
  },

  // ================= 3D EXPERIENCE & ACCESSIBILITY =================
  {
    id: "3d-system-requirements",
    category: "journey",
    question: "What are the hardware and browser requirements for the 3D WebGL website?",
    answer:
      "The Neo-Delhi 3D experience is optimized with React Three Fiber and Three.js using modern WebGL 2.0. It runs smoothly on modern desktop and mobile browsers (Chrome, Edge, Firefox, Safari). We utilize dynamic GPU tier detection (via detect-gpu) to scale shadows, post-processing bloom, and geometry detail to ensure 60 FPS on integrated graphics and mobile chips.",
    featured: true,
    tags: ["webgl", "threejs", "gpu", "requirements"],
  },
  {
    id: "2d-fallback-mode",
    category: "journey",
    question: "Can I view the website without the 3D scene (Reduced Motion / Low Power)?",
    answer:
      "Yes! If your device has WebGL disabled, low battery power, or your operating system has 'prefers-reduced-motion' enabled, the site automatically provides a lightweight, accessible 2D interface. You can also toggle the '2D Mode' switch in the top navigation bar at any moment.",
    featured: false,
    tags: ["accessibility", "fallback", "performance", "reduced-motion"],
  },

  // ================= CFP & SPEAKERS =================
  {
    id: "cfp-submission",
    category: "cfp",
    question: "When does the Call for Papers (CFP) open and close?",
    answer:
      "CFP opens on August 1, 2026 and closes on November 15, 2026 at 23:59 IST. Review notifications are dispatched in two rounds, with final speaker confirmations by December 15, 2026. We welcome 45-minute technical deep dives and 20-minute turbo talks.",
    featured: true,
    tags: ["cfp", "papers", "speaker", "submission", "dates"],
  },
  {
    id: "speaker-travel-grants",
    category: "cfp",
    question: "Are speaker travel and accommodation costs covered?",
    answer:
      "As a community non-profit, BSides Delhi provides full hotel accommodation (3 nights) for all selected primary speakers. International and domestic travel stipends are awarded based on corporate sponsorship backing, with priority given to independent researchers and student authors who lack institutional funding.",
    featured: false,
    tags: ["speakers", "travel", "grants", "hotel"],
  },

  // ================= CTF & SIGNALS =================
  {
    id: "ctf-format-rules",
    category: "ctf",
    question: "How does the BSides Delhi 24-Hour CTF work?",
    answer:
      "The CTF begins on Saturday, Feb 13 at 12:00 PM IST and runs non-stop for 24 hours until Sunday, Feb 14 at 12:00 PM IST. Teams can consist of 1 to 4 members. Categories include Web Exploitation, Binary Exploitation (Pwn), Reverse Engineering, Cryptography, Cloud/Kubernetes, and Physical Hardware/RF.",
    featured: true,
    tags: ["ctf", "competition", "teams", "prizes", "rules"],
  },
  {
    id: "what-are-signals",
    category: "ctf",
    question: "What are the in-world 'Signals' hidden across the 3D journey?",
    answer:
      "Embedded throughout the 6 journey chapters of our 3D site (from India Gate to the Skyline) are 6 hidden cryptographic signals. Interacting with these objects in 3D reveals RF frequencies, steganographic coordinates, and CAN-bus packet dumps that can be decrypted to claim bonus points on the CTF scoreboard and unlock the exclusive Neo-Delhi ARG Badge.",
    featured: true,
    tags: ["signals", "arg", "easter-eggs", "ctf"],
  },

  // ================= VENUE & TRAVEL =================
  {
    id: "metro-navigation",
    category: "venue",
    question: "How do I reach the conference venue via Delhi Metro?",
    answer:
      "The venue is directly accessible via the Delhi Metro Yellow Line. The two primary stations are Central Secretariat (Interchange with Violet Line) and Rajiv Chowk (Interchange with Blue Line). Both stations feature direct subway exits leading into the conference concourse and Palika Subterranean Village.",
    featured: true,
    tags: ["metro", "yellow-line", "dmrc", "directions", "transit"],
  },
  {
    id: "parking-hotels",
    category: "venue",
    question: "Is vehicle parking available, and what are nearby hotel options?",
    answer:
      "Multi-level automated parking is available at Connaught Place Shivaji Stadium and Palika Kendra. However, given Central Delhi traffic, we strongly recommend using the Delhi Metro. We have negotiated discounted conference rates with nearby hotels in Connaught Place, Janpath, and Ashoka Road. Details are emailed upon ticket confirmation.",
    featured: false,
    tags: ["parking", "hotels", "travel", "accommodation"],
  },

  // ================= CODE OF CONDUCT =================
  {
    id: "code-of-conduct",
    category: "conduct",
    question: "What is the BSides Delhi Code of Conduct?",
    answer:
      "BSides Delhi is dedicated to providing a harassment-free conference experience for everyone, regardless of gender, sexual orientation, disability, physical appearance, race, ethnicity, or technical skill level. Harassment, unauthorized audio/video recording in private zones, and unapproved attacks against the venue's operational network infrastructure or attendee personal devices are strictly prohibited and will result in immediate badge revocation without refund.",
    featured: false,
    tags: ["conduct", "rules", "safety", "policy", "harassment"],
  },
  {
    id: "wifi-rf-rules",
    category: "conduct",
    question: "Can I run Wi-Fi deauth or cellular jamming experiments on-site?",
    answer:
      "No. Hostile RF jamming, deauthentication attacks against conference production Wi-Fi, or rogue base stations targeting non-participating attendee devices are illegal under Indian Telecommunications Law and strictly forbidden. All active wireless exploitation experiments must be conducted exclusively inside the Faraday cages in the Palika Hardware Village.",
    featured: false,
    tags: ["wifi", "rf", "jamming", "faraday", "legal"],
  },
];

/** Retrieve all FAQ items */
export function getAllFaqs(): FAQItem[] {
  return FAQS;
}

/** Retrieve FAQ items by category */
export function getFaqsByCategory(category: FAQCategoryId): FAQItem[] {
  return FAQS.filter((faq) => faq.category === category);
}

/** Retrieve featured FAQs for home page display */
export function getFeaturedFaqs(): FAQItem[] {
  return FAQS.filter((faq) => faq.featured);
}

/** Full-text search across questions, answers, and tags */
export function searchFaqs(query: string): FAQItem[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return FAQS;

  return FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(clean) ||
      faq.answer.toLowerCase().includes(clean) ||
      faq.tags.some((tag) => tag.toLowerCase().includes(clean))
  );
}
