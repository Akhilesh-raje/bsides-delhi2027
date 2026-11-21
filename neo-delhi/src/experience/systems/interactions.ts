/**
 * Neo-Delhi 3D Cybersecurity Conference Experience
 * Interaction Registry & Store
 *
 * Central registry and reactive store for interactive 3D objects across
 * the 6 journey chapters:
 * 1. India Gate (0.00 - 0.10)
 * 2. Kartavya Path (0.10 - 0.28)
 * 3. Central Secretariat Metro (0.28 - 0.45)
 * 4. Train Ride on Yellow Line (0.45 - 0.62)
 * 5. Rajiv Chowk / Connaught Place (0.62 - 0.80)
 * 6. Skyline (0.80 - 1.00)
 */

import { create } from "zustand";

export type InteractionType =
  | "inspect"      // Pops an in-world inspection panel / specs
  | "modal"        // Opens full-screen overlay modal (speakers, agenda, sponsors)
  | "route"        // Navigates to a 2D page (/register, /cfp, /speakers, /ctf)
  | "signal"       // Triggers an ARG / CTF signal capture
  | "audio"        // Plays localized audio narrative or transmission
  | "action";      // Triggers in-world physical animation (e.g., train emergency lever)

export interface InteractionSpec {
  label: string;
  value: string;
}

export interface InteractionItem {
  id: string;
  title: string;
  subtitle: string;
  chapterIndex: 1 | 2 | 3 | 4 | 5 | 6;
  chapterName: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  radius: number;
  type: InteractionType;
  icon: string;
  accentColor: string; // design token e.g. #D62E42 (signal) or #9D071A (crimson)
  description: string;
  promptText: string;
  details?: {
    specs?: InteractionSpec[];
    actionLabel?: string;
    actionUrl?: string;
    signalId?: string;
    audioUrl?: string;
  };
}

/** Complete catalog of interactive points of interest */
export const INTERACTIONS_REGISTRY: Record<string, InteractionItem> = {
  // ==========================================
  // CHAPTER 1: INDIA GATE (0.00 - 0.10)
  // ==========================================
  "india-gate-arch": {
    id: "india-gate-arch",
    title: "India Gate Grand Arch",
    subtitle: "Ceremonial Monolith of the Fallen Cyberspace Pioneers",
    chapterIndex: 1,
    chapterName: "India Gate",
    position: [0, 14, 0],
    radius: 8,
    type: "inspect",
    icon: "monument",
    accentColor: "#D62E42",
    promptText: "Click or Tap to inspect monument telemetry",
    description:
      "A 42-meter high triumphal cyber-arch constructed from crimson basalt and integrated nano-optics. Inscribed upon its inner sandstone ribs are the pseudonyms of pioneer security researchers, white-hat hackers, and cryptanalysts who defended the subcontinent's digital frontiers.",
    details: {
      specs: [
        { label: "Height", value: "42.0 meters" },
        { label: "Material", value: "Basalt & Nano-diffractive glass" },
        { label: "Encryption", value: "Lattice-based Post-Quantum Ledger" },
        { label: "Node Type", value: "Public Telemetry Gateway" },
      ],
      actionLabel: "View Conference About",
      actionUrl: "/about",
    },
  },

  "amar-jawan-jyoti": {
    id: "amar-jawan-jyoti",
    title: "Amar Jawan Jyoti (Flame of the Immortals)",
    subtitle: "Holographic Eternal Flame & Telemetry Beacon",
    chapterIndex: 1,
    chapterName: "India Gate",
    position: [0, 1.2, 5],
    radius: 3,
    type: "signal",
    icon: "flame",
    accentColor: "#D62E42",
    promptText: "Intercept low-frequency cryptographic pulse",
    description:
      "An everlasting plasma flame pulsing with cryptographic entropy. Emits an ultra-low frequency RF pulse across the 142.850 MHz spectrum carrying encrypted telemetry from the conference founding node.",
    details: {
      specs: [
        { label: "Carrier Frequency", value: "142.850 MHz FM" },
        { label: "Modulation", value: "BPSK / CW Telemetry" },
        { label: "Signal Status", value: "BROADCASTING" },
      ],
      signalId: "signal-01",
      actionLabel: "Submit Signal Decryption",
      actionUrl: "/ctf",
    },
  },

  "kiosk-schedule": {
    id: "kiosk-schedule",
    title: "Kartavya Information Kiosk",
    subtitle: "Real-time Conference Track Directory",
    chapterIndex: 1,
    chapterName: "India Gate",
    position: [12, 1, 8],
    radius: 4,
    type: "modal",
    icon: "calendar",
    accentColor: "#D62E42",
    promptText: "Access BSides Delhi 2027 Schedule",
    description:
      "Dual-sided holographic kiosk projecting the real-time schedule, stage allocations, and live updates across Hall Ashoka, Hall Chanakya, and the CTF Underground Bunker.",
    details: {
      actionLabel: "Open Full Agenda",
      actionUrl: "/agenda",
    },
  },

  // ==========================================
  // CHAPTER 2: KARTAVYA PATH (0.10 - 0.28)
  // ==========================================
  "kartavya-speaker-monolith": {
    id: "kartavya-speaker-monolith",
    title: "Keynote Speaker Obelisk",
    subtitle: "Offensive Research & Exploitation Showcase",
    chapterIndex: 2,
    chapterName: "Kartavya Path",
    position: [-10, 3, -40],
    radius: 5,
    type: "modal",
    icon: "user",
    accentColor: "#D62E42",
    promptText: "View Keynote Speakers",
    description:
      "An eight-meter monolith situated along the grand boulevard projecting biometric profiles and talk abstracts of world-renowned offensive security researchers and zero-day discoverers.",
    details: {
      actionLabel: "View All Speakers",
      actionUrl: "/speakers",
    },
  },

  "smart-lamp-telemetry": {
    id: "smart-lamp-telemetry",
    title: "IoT Smart Lamppost #KP-404",
    subtitle: "DMRC Municipal Mesh Network Node",
    chapterIndex: 2,
    chapterName: "Kartavya Path",
    position: [9, 4, -80],
    radius: 4,
    type: "signal",
    icon: "wifi",
    accentColor: "#9D071A",
    promptText: "Sniff 802.15.4 Zigbee Traffic",
    description:
      "A municipal surveillance and ambient atmospheric node along Kartavya Path. An unsecured debug port is leaking fragmented packet captures over a rogue Wi-Fi Direct SSID.",
    details: {
      specs: [
        { label: "Firmware", value: "NeoDelhi-IoT v4.2.1-debug" },
        { label: "Vulnerability", value: "Unauthenticated UART bridge" },
        { label: "Signal ID", value: "SIGNAL #2" },
      ],
      signalId: "signal-02",
      actionLabel: "Analyze Packet Dump",
      actionUrl: "/ctf",
    },
  },

  "patrol-drone-waypoint": {
    id: "patrol-drone-waypoint",
    title: "Autonomous Sentry Drone #ND-07",
    subtitle: "Airspace Surveillance & RF Triangulation",
    chapterIndex: 2,
    chapterName: "Kartavya Path",
    position: [0, 16, -120],
    radius: 6,
    type: "inspect",
    icon: "drone",
    accentColor: "#D62E42",
    promptText: "Scan Drone Telemetry HUD",
    description:
      "A hexacopter drone running active LiDAR scanning of the boulevard. Displays current airspace threat assessment and live attendee density metrics.",
    details: {
      specs: [
        { label: "Model", value: "AeroShield Garuda Mk-IV" },
        { label: "Optical Sensor", value: "Thermal + Quantum LiDAR" },
        { label: "Flight Status", value: "Geofenced Patrol" },
      ],
    },
  },

  // ==========================================
  // CHAPTER 3: CENTRAL SECRETARIAT METRO (0.28 - 0.45)
  // ==========================================
  "metro-turnstile-gate": {
    id: "metro-turnstile-gate",
    title: "Automatic Fare Collection (AFC) Gate",
    subtitle: "NFC Conference Badge Authenticator",
    chapterIndex: 3,
    chapterName: "Central Secretariat",
    position: [0, 1.2, -180],
    radius: 3,
    type: "action",
    icon: "credit-card",
    accentColor: "#D62E42",
    promptText: "Tap RFID Conference Badge to Enter",
    description:
      "DMRC optical flap barrier turnstiles retrofitted with custom RFID scanners. Tapping your registration ticket or NFC badge emits a dual verification tone and grants platform clearance.",
    details: {
      actionLabel: "Get Registration Pass",
      actionUrl: "/register",
    },
  },

  "token-vending-machine": {
    id: "token-vending-machine",
    title: "DMRC Cyber Token Dispenser",
    subtitle: "Hardware Security Module (HSM) Demo",
    chapterIndex: 3,
    chapterName: "Central Secretariat",
    position: [-8, 2, -175],
    radius: 3,
    type: "inspect",
    icon: "cpu",
    accentColor: "#9D071A",
    promptText: "Inspect Contactless Token Hardware",
    description:
      "Dispenses round contactless smart tokens powered by MIFARE DESFire chips. An interactive display details the cryptanalysis history of transport ticketing systems in South Asia.",
    details: {
      specs: [
        { label: "Chip Family", value: "DESFire EV3 / AES-128" },
        { label: "Interface", value: "ISO/IEC 14443 Type A" },
        { label: "Challenge", value: "Side-Channel Attack Demo" },
      ],
      actionLabel: "View Hardware Tracks",
      actionUrl: "/workshops",
    },
  },

  // ==========================================
  // CHAPTER 4: TRAIN RIDE ON YELLOW LINE (0.45 - 0.62)
  // ==========================================
  "train-emergency-lever": {
    id: "train-emergency-lever",
    title: "Pneumatic Emergency Brake & Signal Intercept",
    subtitle: "TCMS Diagnostics & CAN-Bus Injection Port",
    chapterIndex: 4,
    chapterName: "Yellow Line Transit",
    position: [1.8, 2.2, -220],
    radius: 2.5,
    type: "action",
    icon: "alert-triangle",
    accentColor: "#D62E42",
    promptText: "Pull Emergency Lever to Trigger Cyber Anomaly",
    description:
      "A sealed emergency valve with an illicit RJ-45 test tap hanging from the diagnostic harness. Pulling the handle injects a malformed CAN frame into the train's speed governors, causing carriage neon flickering and broadcasting CTF Signal #3.",
    details: {
      signalId: "signal-03",
      actionLabel: "Trigger Anomaly",
    },
  },

  "train-route-display": {
    id: "train-route-display",
    title: "Dynamic Electronic Route Map",
    subtitle: "DMRC Yellow Line Track Topology",
    chapterIndex: 4,
    chapterName: "Yellow Line Transit",
    position: [0, 2.4, -215],
    radius: 3,
    type: "inspect",
    icon: "map",
    accentColor: "#D62E42",
    promptText: "View Yellow Line Station Map",
    description:
      "Interactive 37-station illuminated line map stretching from Samaypur Badli to Millennium City Centre Gurugram. Highlights transfer hubs at Rajiv Chowk (Blue Line) and Kashmere Gate (Violet/Red Lines).",
    details: {
      specs: [
        { label: "Line", value: "Line 2 (Yellow)" },
        { label: "Track Gauge", value: "1,676 mm Broad Gauge" },
        { label: "Signaling", value: "CBTC (Communications-Based Train Control)" },
      ],
      actionLabel: "View Venue & Metro Directions",
      actionUrl: "/venue",
    },
  },

  // ==========================================
  // CHAPTER 5: RAJIV CHOWK / CONNAUGHT PLACE (0.62 - 0.80)
  // ==========================================
  "cp-inner-circle-billboard": {
    id: "cp-inner-circle-billboard",
    title: "Neo-Colonnade Giant Holographic Display",
    subtitle: "Diamond & Platinum Sponsor Pavilion",
    chapterIndex: 5,
    chapterName: "Rajiv Chowk",
    position: [0, 18, -320],
    radius: 12,
    type: "modal",
    icon: "shield",
    accentColor: "#D62E42",
    promptText: "View Conference Partners & Sponsors",
    description:
      "A 360-degree cylindrical LED mesh crowning the classic Georgian architecture of Connaught Place. Features enterprise security leaders, red-team consultancies, and open-source tooling sponsors powering BSides Delhi.",
    details: {
      actionLabel: "Explore All Sponsors",
      actionUrl: "/sponsors",
    },
  },

  "palika-bazaar-terminal": {
    id: "palika-bazaar-terminal",
    title: "Palika Underground Hardware Village",
    subtitle: "Soldering, Badgelife & SDR Sub-level Entrance",
    chapterIndex: 5,
    chapterName: "Rajiv Chowk",
    position: [-14, 1.5, -305],
    radius: 4,
    type: "route",
    icon: "terminal",
    accentColor: "#9D071A",
    promptText: "Enter Underground Hardware Village",
    description:
      "The subterranean market of Palika transformed into a high-octane hardware hacking village. Oscilloscopes, spectrum analyzers, badgelife modding benches, and lock-picking villages await below.",
    details: {
      actionLabel: "Explore Villages & CTF",
      actionUrl: "/ctf",
    },
  },

  // ==========================================
  // CHAPTER 6: SKYLINE (0.80 - 1.00)
  // ==========================================
  "orbital-uplink-dish": {
    id: "orbital-uplink-dish",
    title: "LEO Satellite Orbital Ground Station",
    subtitle: "Final CTF Flag Uplink & Global Telemetry",
    chapterIndex: 6,
    chapterName: "Skyline",
    position: [8, 48, -420],
    radius: 6,
    type: "signal",
    icon: "radio",
    accentColor: "#D62E42",
    promptText: "Establish Orbital Uplink Handshake",
    description:
      "A phased-array satellite dish mounted high on the Connaught Place skyline communicating with a low-earth-orbit cubesat constellation. Receives the master cryptographic flag for the conference ARG challenge.",
    details: {
      specs: [
        { label: "Target Orbit", value: "LEO 550km / 53° Inclination" },
        { label: "Downlink Frequency", value: "10.450 GHz X-Band" },
        { label: "Signal ID", value: "SIGNAL #6 (FINAL)" },
      ],
      signalId: "signal-06",
      actionLabel: "Submit Final Flag",
      actionUrl: "/ctf",
    },
  },

  "rooftop-amphitheater": {
    id: "rooftop-amphitheater",
    title: "Neo-Delhi Main Keynote Amphitheater",
    subtitle: "Open-Air Cyber Arena under the Delhi Sky",
    chapterIndex: 6,
    chapterName: "Skyline",
    position: [0, 42, -450],
    radius: 10,
    type: "route",
    icon: "award",
    accentColor: "#D62E42",
    promptText: "View Conference Registration",
    description:
      "A breathtaking rooftop summit arena overlooking the neon-bathed skyline of New Delhi, blending Lutyens geometry with cyberpunk brutalism. The crowning venue for opening keynotes and awards ceremony.",
    details: {
      actionLabel: "Register for Pass",
      actionUrl: "/register",
    },
  },
};

export interface InteractionsState {
  hoveredId: string | null;
  selectedId: string | null;
  inspectModalOpen: boolean;
  inspectedHistory: string[];
  unlockedSignals: string[];

  // Actions
  setHovered: (id: string | null) => void;
  selectInteraction: (id: string | null) => void;
  closeInspectModal: () => void;
  unlockSignal: (signalId: string) => void;
  isSignalUnlocked: (signalId: string) => boolean;
}

export const useInteractionsStore = create<InteractionsState>()((set, get) => ({
  hoveredId: null,
  selectedId: null,
  inspectModalOpen: false,
  inspectedHistory: [],
  unlockedSignals: [],

  setHovered: (id: string | null) => {
    if (get().hoveredId !== id) {
      set({ hoveredId: id });
    }
  },

  selectInteraction: (id: string | null) => {
    if (!id) {
      set({ selectedId: null, inspectModalOpen: false });
      return;
    }

    const item = INTERACTIONS_REGISTRY[id];
    if (!item) return;

    const history = get().inspectedHistory;
    const nextHistory = history.includes(id) ? history : [...history, id];

    set({
      selectedId: id,
      inspectModalOpen: item.type === "inspect" || item.type === "modal" || item.type === "signal",
      inspectedHistory: nextHistory,
    });
  },

  closeInspectModal: () => {
    set({ inspectModalOpen: false, selectedId: null });
  },

  unlockSignal: (signalId: string) => {
    const unlocked = get().unlockedSignals;
    if (!unlocked.includes(signalId)) {
      set({ unlockedSignals: [...unlocked, signalId] });
    }
  },

  isSignalUnlocked: (signalId: string) => {
    return get().unlockedSignals.includes(signalId);
  },
}));

/** Helper to retrieve all interactions belonging to a specific journey chapter */
export function getInteractionsByChapter(chapterIndex: 1 | 2 | 3 | 4 | 5 | 6): InteractionItem[] {
  return Object.values(INTERACTIONS_REGISTRY).filter((item) => item.chapterIndex === chapterIndex);
}

/** Helper to get an interaction by ID */
export function getInteractionById(id: string): InteractionItem | undefined {
  return INTERACTIONS_REGISTRY[id];
}
