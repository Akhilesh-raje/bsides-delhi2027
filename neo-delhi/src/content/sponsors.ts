/**
 * Neo-Delhi 3D Cybersecurity Conference
 * Sponsors & Industry Partners Directory
 *
 * Tier definitions, company profiles, booth coordinates, and recruitment links
 * for organizations powering BSides Delhi 2027.
 */

export type SponsorTierId = "tera" | "giga" | "mega" | "kilo" | "community";

export interface SponsorTier {
  id: SponsorTierId;
  name: string;
  badge: string;
  color: string;
  glowColor: string;
  borderStyle: string;
  order: number;
  perks: string[];
}

export interface Sponsor {
  id: string;
  name: string;
  tier: SponsorTierId;
  logo: string;
  website: string;
  tagline: string;
  description: string;
  booth: string;
  hiring: boolean;
  careersUrl?: string;
  perks?: string[];
}

export const SPONSOR_TIERS: Record<SponsorTierId, SponsorTier> = {
  tera: {
    id: "tera",
    name: "TERA (Title / Diamond)",
    badge: "TERA TIER",
    color: "#D62E42", // Signal red
    glowColor: "rgba(214, 46, 66, 0.4)",
    borderStyle: "border-signal/60 shadow-[0_0_25px_rgba(214,46,66,0.3)]",
    order: 1,
    perks: [
      "Keynote Stage Naming Rights",
      "Full Concourse 360° Holographic Display at Rajiv Chowk",
      "Dedicated 20x20 Premium Expo Pavilion",
      "15 VIP All-Access Passes & Speaker Dinner",
      "Resume Drop & Private Interview Suites",
    ],
  },
  giga: {
    id: "giga",
    name: "GIGA (Platinum)",
    badge: "GIGA TIER",
    color: "#00E5FF", // Cyan
    glowColor: "rgba(0, 229, 255, 0.3)",
    borderStyle: "border-cyan-500/50 shadow-[0_0_20px_rgba(0,229,255,0.2)]",
    order: 2,
    perks: [
      "Technical Track Sponsorship (Hall Ashoka or Chanakya)",
      "10x10 Expo Island Booth",
      "8 All-Access Conference Passes",
      "CTF Challenge Co-design & Flag Branding",
      "Recruiting Portal Access",
    ],
  },
  mega: {
    id: "mega",
    name: "MEGA (Gold)",
    badge: "MEGA TIER",
    color: "#FFB300", // Amber
    glowColor: "rgba(255, 179, 0, 0.25)",
    borderStyle: "border-amber-500/40 shadow-[0_0_15px_rgba(255,179,0,0.15)]",
    order: 3,
    perks: [
      "Workshop Room Co-branding",
      "Standard 8x8 Expo Booth",
      "5 Conference Passes",
      "Logo on Official Conference T-Shirts & Badges",
    ],
  },
  kilo: {
    id: "kilo",
    name: "KILO (Silver)",
    badge: "KILO TIER",
    color: "#E5E1DF", // Silver
    glowColor: "rgba(229, 225, 223, 0.15)",
    borderStyle: "border-gunmetal shadow-[0_0_10px_rgba(255,255,255,0.05)]",
    order: 4,
    perks: [
      "Community Table Booth",
      "2 Conference Passes",
      "Logo on Website and Physical Banners",
    ],
  },
  community: {
    id: "community",
    name: "COMMUNITY & ACADEMIC",
    badge: "COMMUNITY",
    color: "#99949A", // Muted
    glowColor: "transparent",
    borderStyle: "border-gunmetal/40",
    order: 5,
    perks: [
      "Community Village Pod in Palika Subterranean Hub",
      "Volunteer & Student Ticket Grants",
      "Collaborative CTF Track Hosting",
    ],
  },
};

export const SPONSORS: Sponsor[] = [
  // ================= TERA TIER =================
  {
    id: "sentinel-matrix",
    name: "SentinelMatrix Autonomous Defense",
    tier: "tera",
    logo: "/sponsors/sentinel-matrix.svg",
    website: "https://sentinelmatrix.cyber",
    tagline: "Autonomous Agentic Threat Detection at Wire Speed",
    description:
      "SentinelMatrix provides real-time eBPF and neural telemetry sensors guarding national telecommunications, high-frequency financial exchanges, and urban transit operations.",
    booth: "Pavilion T-01, Rajiv Chowk Central Concourse",
    hiring: true,
    careersUrl: "https://sentinelmatrix.cyber/careers",
    perks: ["Title Sponsor", "Main Stage Host", "CTF Diamond Partner"],
  },
  {
    id: "bharat-cyber-shield",
    name: "Bharat Cyber Shield",
    tier: "tera",
    logo: "/sponsors/bharat-cyber-shield.svg",
    website: "https://bharatcybershield.in",
    tagline: "Securing India's Digital Sovereignty & Critical Infrastructure",
    description:
      "A national consortium providing zero-trust architecture, secure silicon verification, and national SOC monitoring across public utilities and payment rails.",
    booth: "Pavilion T-02, Rajiv Chowk Central Concourse",
    hiring: true,
    careersUrl: "https://bharatcybershield.in/join",
    perks: ["Title Sponsor", "Badge Hardware Sponsor"],
  },

  // ================= GIGA TIER =================
  {
    id: "zeroday-labs",
    name: "ZeroDay Labs India",
    tier: "giga",
    logo: "/sponsors/zeroday-labs.svg",
    website: "https://zerodaylabs.io",
    tagline: "Offensive Research & Vulnerability Intelligence",
    description:
      "Elite vulnerability research boutique specializing in browser engines, mobile basebands, hypervisors, and specialized red team simulations.",
    booth: "Booth G-01, Hall Ashoka Promenade",
    hiring: true,
    careersUrl: "https://zerodaylabs.io/careers",
    perks: ["Offensive Track Sponsor", "CTF Flag Author"],
  },
  {
    id: "quantumsec-global",
    name: "QuantumSec Global",
    tier: "giga",
    logo: "/sponsors/quantumsec.svg",
    website: "https://quantumsec.global",
    tagline: "Hardware-Rooted Post-Quantum Cryptography",
    description:
      "Developing silicon-proven ML-KEM and ML-DSA cryptographic accelerators and hardware security modules for aerospace and financial institutions.",
    booth: "Booth G-02, Hall Chanakya Foyer",
    hiring: true,
    careersUrl: "https://quantumsec.global/jobs",
    perks: ["Crypto Track Sponsor"],
  },
  {
    id: "apex-offensive",
    name: "Apex Offensive Sim",
    tier: "giga",
    logo: "/sponsors/apex-offensive.svg",
    website: "https://apexoffensive.com",
    tagline: "Next-Generation Adversary Emulation & C2 Tooling",
    description:
      "Creators of advanced purple-teaming platforms simulating nation-state threat actors across hybrid cloud and on-premise Active Directory environments.",
    booth: "Booth G-03, Hall Ashoka Promenade",
    hiring: false,
    perks: ["Red Team Village Partner"],
  },

  // ================= MEGA TIER =================
  {
    id: "packetshield",
    name: "PacketShield Systems",
    tier: "mega",
    logo: "/sponsors/packetshield.svg",
    website: "https://packetshield.net",
    tagline: "Ultra-Low Latency DDoS Scrubbing & Edge Security",
    description:
      "Global Anycast network providing terabit-scale DDoS mitigation, bot defense, and web application API protection.",
    booth: "Booth M-01, Connaught Colonnade",
    hiring: true,
    careersUrl: "https://packetshield.net/careers",
  },
  {
    id: "kernelguard",
    name: "KernelGuard Labs",
    tier: "mega",
    logo: "/sponsors/kernelguard.svg",
    website: "https://kernelguard.dev",
    tagline: "Modern EDR Bypass Research & Detection Validation",
    description:
      "Automated platform testing behavioral endpoint defenses against unhooking, direct system calls, and reflective code loading.",
    booth: "Booth M-02, Connaught Colonnade",
    hiring: true,
    careersUrl: "https://kernelguard.dev/jobs",
  },
  {
    id: "neurosec-ai",
    name: "NeuroSec AI",
    tier: "mega",
    logo: "/sponsors/neurosec.svg",
    website: "https://neurosec.ai",
    tagline: "Model Context Protocol & LLM Guardrail Enforcement",
    description:
      "Real-time semantic firewalls preventing prompt injection, toxic outputs, and unauthorized agentic tool execution.",
    booth: "Booth M-03, Connaught Colonnade",
    hiring: true,
    careersUrl: "https://neurosec.ai/careers",
  },

  // ================= KILO TIER =================
  {
    id: "bytetrace",
    name: "ByteTrace Forensics",
    tier: "kilo",
    logo: "/sponsors/bytetrace.svg",
    website: "https://bytetrace.in",
    tagline: "Digital Forensics & Incident Response Consulting",
    description:
      "Specialized DFIR investigations, memory forensics, and court-admissible forensic acquisition for law enforcement and legal counsel.",
    booth: "Table K-01, Outer Circle",
    hiring: false,
  },
  {
    id: "airborne-rf",
    name: "Airborne RF Security",
    tier: "kilo",
    logo: "/sponsors/airborne-rf.svg",
    website: "https://airborne-rf.com",
    tagline: "Software Defined Radio & Airspace Surveillance",
    description:
      "Counter-drone RF detection, rogue cell tower locating, and wireless protocol penetration testing hardware.",
    booth: "Table K-02, Outer Circle",
    hiring: false,
  },

  // ================= COMMUNITY =================
  {
    id: "null-community",
    name: "null - The Open Security Community",
    tier: "community",
    logo: "/sponsors/null-community.svg",
    website: "https://null.community",
    tagline: "India's Largest Open Security Community",
    description:
      "Non-profit registered society promoting registered security research, monthly meets, and student mentorship across 18 Indian chapters.",
    booth: "Palika Community Pod 1",
    hiring: false,
  },
  {
    id: "owasp-delhi",
    name: "OWASP Delhi Chapter",
    tier: "community",
    logo: "/sponsors/owasp-delhi.svg",
    website: "https://owasp.org/www-chapter-delhi",
    tagline: "Making Software Security Visible",
    description:
      "Open Web Application Security Project Delhi chapter, hosting developer meetups, student workshops, and project showcases.",
    booth: "Palika Community Pod 2",
    hiring: false,
  },
  {
    id: "dc9111",
    name: "DC9111 (DEF CON Delhi)",
    tier: "community",
    logo: "/sponsors/dc9111.svg",
    website: "https://dc9111.org",
    tagline: "Delhi's DEF CON Group for Hackers & Makers",
    description:
      "Hardware hackers, lockpickers, and badgelife enthusiasts organizing hands-on villages at BSides Delhi.",
    booth: "Palika Hardware Bench Alpha",
    hiring: false,
  },
  {
    id: "cyberpeace-foundation",
    name: "CyberPeace Foundation",
    tier: "community",
    logo: "/sponsors/cyberpeace.svg",
    website: "https://cyberpeace.org",
    tagline: "Advocating for Peaceful and Resilient Cyberspace",
    description:
      "Global think tank of cybersecurity and policy researchers working towards cyber peace, safety, and online human rights.",
    booth: "Palika Community Pod 3",
    hiring: false,
  },
];

/** Retrieve all sponsors */
export function getAllSponsors(): Sponsor[] {
  return SPONSORS;
}

/** Retrieve sponsors grouped by tier */
export function getSponsorsByTier(tier: SponsorTierId): Sponsor[] {
  return SPONSORS.filter((s) => s.tier === tier);
}

/** Retrieve all currently hiring sponsors */
export function getHiringSponsors(): Sponsor[] {
  return SPONSORS.filter((s) => s.hiring);
}

/** Retrieve tier metadata */
export function getTierInfo(tier: SponsorTierId): SponsorTier {
  return SPONSOR_TIERS[tier];
}
