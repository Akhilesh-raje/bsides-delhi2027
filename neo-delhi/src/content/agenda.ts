/**
 * Neo-Delhi 3D Cybersecurity Conference
 * Agenda & Event Schedule
 *
 * Detailed schedule for the 2-day conference:
 * Day 1: Saturday, February 13, 2027
 * Day 2: Sunday, February 14, 2027
 */

export type SessionType =
  | "keynote"
  | "talk"
  | "workshop"
  | "panel"
  | "break"
  | "ctf"
  | "social";

export type SessionLevel = "All" | "Beginner" | "Intermediate" | "Advanced";

export interface AgendaSession {
  id: string;
  day: 1 | 2;
  startTime: string;
  endTime: string;
  timeRange: string;
  title: string;
  description: string;
  stage: string;
  trackId?: "offensive" | "defense" | "ai-security" | "hardware-iot" | "crypto-privacy" | "cloud-devsecops";
  speakerId?: string;
  type: SessionType;
  level: SessionLevel;
  prerequisites?: string[];
}

export interface AgendaDay {
  day: 1 | 2;
  date: string;
  formattedDate: string;
  theme: string;
  headline: string;
  sessions: AgendaSession[];
}

export const AGENDA_DAYS: AgendaDay[] = [
  {
    day: 1,
    date: "2027-02-13",
    formattedDate: "Saturday, Feb 13, 2027",
    theme: "Exploitation Frontiers, Hardware Hacking & The Subterranean Matrix",
    headline: "Breaking Boundaries from Silicon to Kernel",
    sessions: [
      {
        id: "d1-registration",
        day: 1,
        startTime: "08:00 AM",
        endTime: "09:30 AM",
        timeRange: "08:00 - 09:30 AM",
        title: "Badge Collection, Hardware Badge Flashing & Morning Chai",
        description:
          "Pick up your electronic conference badge at the Central Secretariat registration foyer. Flash custom firmware, configure your badgelife mesh network, and grab authentic Delhi ginger tea.",
        stage: "Central Secretariat Concourse",
        type: "break",
        level: "All",
      },
      {
        id: "d1-opening",
        day: 1,
        startTime: "09:30 AM",
        endTime: "10:00 AM",
        timeRange: "09:30 - 10:00 AM",
        title: "Opening Ceremony: The State of Neo-Delhi Cyber Frontiers",
        description:
          "Welcome remarks by the BSides Delhi core organizers, keynote address on defending critical regional infrastructure, and official countdown to the 24-Hour CTF kickoff.",
        stage: "Hall Ashoka (Main Arena)",
        type: "keynote",
        level: "All",
      },
      {
        id: "d1-keynote-1",
        day: 1,
        startTime: "10:00 AM",
        endTime: "11:00 AM",
        timeRange: "10:00 - 11:00 AM",
        title: "Dissecting Zero-Click Remote Code Execution: From Apple Baseband to Kernel Space",
        description:
          "Dr. Arjun Bhardwaj deconstructs contemporary zero-click baseband and iMessage exploit chains, demonstrating bypassing PAC, SPTM, and PPL memory mitigations.",
        stage: "Hall Ashoka (Main Arena)",
        trackId: "offensive",
        speakerId: "arjun-bhardwaj",
        type: "keynote",
        level: "Advanced",
      },
      {
        id: "d1-keynote-2",
        day: 1,
        startTime: "11:15 AM",
        endTime: "12:15 PM",
        timeRange: "11:15 AM - 12:15 PM",
        title: "Faulting the Unfaultable: Laser & Voltage Glitching Secure Elements in Critical Transit",
        description:
          "Elena Rostova demonstrates benchtop hardware fault injection setups, laser decapping, and bypassing cryptographic verification on smart cards and railway tokens.",
        stage: "Hall Ashoka (Main Arena)",
        trackId: "hardware-iot",
        speakerId: "elena-rostova",
        type: "keynote",
        level: "Advanced",
      },
      {
        id: "d1-lunch",
        day: 1,
        startTime: "12:15 PM",
        endTime: "01:30 PM",
        timeRange: "12:15 - 01:30 PM",
        title: "Networking Lunch & Sponsor Exhibition",
        description:
          "Connect with hiring sponsors at the Connaught Place Colonnade, test lock-picking in Palika Village, and explore community project demo pods.",
        stage: "Connaught Place Colonnade & Food Pavilion",
        type: "break",
        level: "All",
      },
      {
        id: "d1-track-crypto",
        day: 1,
        startTime: "01:30 PM",
        endTime: "02:15 PM",
        timeRange: "01:30 - 02:15 PM",
        title: "Surviving the Quantum Horizon: Practical Migration to ML-KEM and ML-DSA at Scale",
        description:
          "Tanya Kapoor outlines practical pathways for swapping legacy RSA/ECC primitives for NIST Post-Quantum standards across large enterprise fleets without latency regressions.",
        stage: "Hall Chanakya (Cryptex)",
        trackId: "crypto-privacy",
        speakerId: "tanya-kapoor",
        type: "talk",
        level: "Intermediate",
      },
      {
        id: "d1-track-redteam",
        day: 1,
        startTime: "02:30 PM",
        endTime: "03:15 PM",
        timeRange: "02:30 - 03:15 PM",
        title: "Crown Jewels in 45 Minutes: Abusing Cross-Tenant Entra ID Trusts and Golden Certificates",
        description:
          "Dev Rathee details red team tradecraft leveraging misconfigured certificate templates (AD CS) to forge Golden Certificates and bridge into Azure Entra ID global admin roles.",
        stage: "Hall Ashoka (Main Arena)",
        trackId: "offensive",
        speakerId: "dev-rathee",
        type: "talk",
        level: "Advanced",
      },
      {
        id: "d1-track-ebpf",
        day: 1,
        startTime: "03:30 PM",
        endTime: "04:15 PM",
        timeRange: "03:30 - 04:15 PM",
        title: "eBPF vs The Ghost in the Ring 0: Detecting Covert Linux Rootkits in Kubernetes",
        description:
          "Maya Nair presents real-world eBPF probe telemetry catching in-memory kernel rootkits and container break-outs before lateral movement occurs.",
        stage: "Hall Chanakya (Blue Chamber)",
        trackId: "defense",
        speakerId: "maya-nair",
        type: "talk",
        level: "Advanced",
      },
      {
        id: "d1-panel-governance",
        day: 1,
        startTime: "04:30 PM",
        endTime: "05:30 PM",
        timeRange: "04:30 - 05:30 PM",
        title: "Executive Panel: The Digital Personal Data Protection Act (DPDPA) & National Cyber Resilience",
        description:
          "CISOs, legal cyber jurists, and policy architects debate compliance, bug bounty safe harbors, and nation-state resilience under India's emerging cybersecurity laws.",
        stage: "Hall Ashoka (Main Arena)",
        type: "panel",
        level: "All",
      },
      {
        id: "d1-evening-mixer",
        day: 1,
        startTime: "06:00 PM",
        endTime: "09:00 PM",
        timeRange: "06:00 - 09:00 PM",
        title: "Underground Neon Mixer & Live Chiptune DJ Set",
        description:
          "Unwind at the Palika Sub-level with live ambient chiptune, craft mocktails, hardware badge modding competitions, and initial CTF scoreboard review.",
        stage: "Palika Subterranean Village",
        type: "social",
        level: "All",
      },
    ],
  },
  {
    day: 2,
    date: "2027-02-14",
    formattedDate: "Sunday, Feb 14, 2027",
    theme: "Autonomous Systems, Cloud Defense & The Skyline Reckoning",
    headline: "Securing the Autonomous & Distributed Future",
    sessions: [
      {
        id: "d2-breakfast",
        day: 2,
        startTime: "08:30 AM",
        endTime: "09:30 AM",
        timeRange: "08:30 - 09:30 AM",
        title: "Breakfast & Lightning Talks",
        description:
          "Grab breakfast while early-career researchers and students deliver 5-minute lightning talks on novel tooling and open-source forensics utilities.",
        stage: "Central Secretariat Concourse",
        type: "break",
        level: "All",
      },
      {
        id: "d2-keynote-ai",
        day: 2,
        startTime: "09:30 AM",
        endTime: "10:30 AM",
        timeRange: "09:30 - 10:30 AM",
        title: "Hijacking the Agentic Mind: Indirect Prompt Injections in Multi-Modal Autonomous Workflows",
        description:
          "Sameer Sharma dissects how multi-modal prompt injections trick autonomous coding and infrastructure agents into executing unintended shell code.",
        stage: "Hall Ashoka (Main Arena)",
        trackId: "ai-security",
        speakerId: "sameer-sharma",
        type: "keynote",
        level: "Intermediate",
      },
      {
        id: "d2-track-scada",
        day: 2,
        startTime: "11:00 AM",
        endTime: "11:45 AM",
        timeRange: "11:00 - 11:45 AM",
        title: "Subverting Communications-Based Train Control (CBTC): Anatomy of an Urban Metro Incident",
        description:
          "Vikramaditya Sen explores RF protocol security, ATP/ATO interlocks, and telemetry spoofing in urban metro networks like Delhi Metro.",
        stage: "Hall Aryabhata & Palika Sub-level",
        trackId: "hardware-iot",
        speakerId: "vikramaditya-sen",
        type: "talk",
        level: "Advanced",
      },
      {
        id: "d2-track-cloud",
        day: 2,
        startTime: "12:00 PM",
        endTime: "12:45 PM",
        timeRange: "12:00 - 12:45 PM",
        title: "Escaping the Sandbox: Novel Linux Namespaces & cgroups v2 Breakouts in Kubernetes",
        description:
          "Aarti Choudhary demonstrates escaping unprivileged Kubernetes pods through user namespace interactions and cgroup v2 race conditions.",
        stage: "Hall Aryabhata (DevSec Hub)",
        trackId: "cloud-devsecops",
        speakerId: "aarti-choudhary",
        type: "talk",
        level: "Advanced",
      },
      {
        id: "d2-lunch",
        day: 2,
        startTime: "12:45 PM",
        endTime: "02:00 PM",
        timeRange: "12:45 - 02:00 PM",
        title: "Lunch & CTF Final Sprint",
        description:
          "Teams gear up for the final two hours of the 24-Hour BSides Delhi CTF. Final challenge unlocks in the RF & Reverse Engineering categories.",
        stage: "Connaught Place Colonnade",
        type: "break",
        level: "All",
      },
      {
        id: "d2-track-dfir",
        day: 2,
        startTime: "02:00 PM",
        endTime: "02:45 PM",
        timeRange: "02:00 - 02:45 PM",
        title: "Ghost in the Pagefile: Advanced Volatile Memory Reconstruction in Ransomware Campaigns",
        description:
          "Karan Verma showcases volatile physical memory reconstruction and extracting ransomware decryption keys using Volatility 3.",
        stage: "Hall Chanakya (Blue Chamber)",
        trackId: "defense",
        speakerId: "karan-verma",
        type: "talk",
        level: "Intermediate",
      },
      {
        id: "d2-track-zk",
        day: 2,
        startTime: "03:00 PM",
        endTime: "03:45 PM",
        timeRange: "03:00 - 03:45 PM",
        title: "Zero-Knowledge Identity Verification: Authenticating Without Exposing PII",
        description:
          "Simran Kaur demonstrates Groth16 and PLONK cryptographic systems for proving credential authorization while protecting individual privacy.",
        stage: "Hall Chanakya (Cryptex)",
        trackId: "crypto-privacy",
        speakerId: "simran-kaur",
        type: "talk",
        level: "Intermediate",
      },
      {
        id: "d2-ctf-showdown",
        day: 2,
        startTime: "04:00 PM",
        endTime: "04:45 PM",
        timeRange: "04:00 - 04:45 PM",
        title: "CTF Showdown: Live Walkthrough of the Hardest Exploits & Signal Decryptions",
        description:
          "The challenge authors and top 3 winning CTF teams take the stage to reveal the solutions to the most diabolical reverse-engineering challenges and the 6 secret in-world signals.",
        stage: "Hall Ashoka (Main Arena)",
        type: "ctf",
        level: "All",
      },
      {
        id: "d2-closing",
        day: 2,
        startTime: "05:00 PM",
        endTime: "06:30 PM",
        timeRange: "05:00 - 06:30 PM",
        title: "Closing Ceremony, CTF Trophy Presentation & BSides Delhi 2028 Teaser",
        description:
          "Awarding the custom-milled hardware trophies to the CTF champions, sponsor gratitude, community volunteer appreciation, and the grand reveal of next year's edition.",
        stage: "Neo-Delhi Rooftop Amphitheater",
        type: "keynote",
        level: "All",
      },
    ],
  },
];

/** Retrieve all sessions across both days */
export function getAllSessions(): AgendaSession[] {
  return AGENDA_DAYS.flatMap((day) => day.sessions);
}

/** Retrieve schedule for a specific conference day (1 or 2) */
export function getSessionsByDay(day: 1 | 2): AgendaSession[] {
  const match = AGENDA_DAYS.find((d) => d.day === day);
  return match ? match.sessions : [];
}

/** Retrieve session by ID */
export function getSessionById(id: string): AgendaSession | undefined {
  return getAllSessions().find((s) => s.id === id);
}

/** Retrieve sessions matching a specific track */
export function getSessionsByTrack(trackId: string): AgendaSession[] {
  return getAllSessions().filter((s) => s.trackId === trackId);
}
