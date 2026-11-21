import crypto from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

/**
 * Neo-Delhi 3D Cybersecurity Conference (BSides Delhi 2027)
 * Server-Side Signal ARG & Journey Chapter Verification Engine
 *
 * Design Tokens:
 * - obsidian: #08090D (bg)
 * - surface: #111319
 * - gunmetal: #252831
 * - crimson: #9D071A (glow only)
 * - signal: #D62E42 (buttons/headings/accent)
 * - silver: #E5E1DF (text)
 * - muted: #99949A
 */

const JWT_SECRET = new TextEncoder().encode(
  process.env.SIGNAL_JWT_SECRET ||
    "neo_delhi_arg_signals_super_secret_jwt_key_2027_production"
);

/**
 * Real-world scale architectural specifications for 3D Greybox environments
 */
export interface GreyboxSpec {
  realWorldDimensionsMeters: {
    width: number;
    height: number;
    depth: number;
  };
  primaryGeometry: string;
  neonLightingConfig: {
    crimsonGlowHex: "#9D071A";
    signalNeonHex: "#D62E42";
    accentIntensity: number;
    lightType: "point" | "rectArea" | "spot" | "directional";
    lightPlacement: string;
  };
  architecturalComponents: string[];
}

export interface JourneyChapter {
  id: string;
  chapterNumber: number;
  name: string;
  title: string;
  progressRange: [number, number]; // [min, max] between 0.00 and 1.00
  coordinates: { x: number; y: number; z: number };
  lore: string;
  radioFrequencyMhz: number;
  signalId: string;
  points: number;
  greybox: GreyboxSpec;
}

/**
 * The 6 Journey Chapters of Neo-Delhi with exact progress ranges,
 * real-world scale greybox references, and red neon accent lighting.
 */
export const JOURNEY_CHAPTERS: JourneyChapter[] = [
  {
    id: "india-gate",
    chapterNumber: 1,
    name: "India Gate",
    title: "Chapter 01: The Memorial Beacon",
    progressRange: [0.00, 0.10],
    coordinates: { x: 0, y: 0, z: 0 },
    lore: "The iconic 42-meter triumphal arch stands re-engineered as a cybernetic transmission node. Deep crimson light floods the ceremonial vault, carrying encrypted military beacon signals.",
    radioFrequencyMhz: 142.85,
    signalId: "SIG_INDIA_GATE",
    points: 100,
    greybox: {
      realWorldDimensionsMeters: { width: 9.1, height: 42.0, depth: 9.1 },
      primaryGeometry: "Extruded triumphal arch with central arched barrel vault (height 25m, width 9m) and surrounding stepped stone plinths.",
      neonLightingConfig: {
        crimsonGlowHex: "#9D071A",
        signalNeonHex: "#D62E42",
        accentIntensity: 4.5,
        lightType: "point",
        lightPlacement: "Center arch ground-plane eternal flame node and cornice perimeter neon tubes.",
      },
      architecturalComponents: [
        "Base plinth: 3-tier stepped sandstone podium (30m x 20m x 3m)",
        "Twin pylons: Left & right structural columns (9.1m x 9.1m x 42m)",
        "Triumphal cornice: Top attic stage with laser-etched memorial calligraphy",
        "Amar Jawan Cyber-Flame: Central pulsating point light emitting crimson glow",
      ],
    },
  },
  {
    id: "kartavya-path",
    chapterNumber: 2,
    name: "Kartavya Path",
    title: "Chapter 02: The Optical Boulevard",
    progressRange: [0.10, 0.28],
    coordinates: { x: 0, y: 0, z: -150 },
    lore: "A 3-kilometer ceremonial boulevard retrofitted with high-throughput optical fiber conduits, classified government data taps, and red surveillance sensor arrays.",
    radioFrequencyMhz: 218.40,
    signalId: "SIG_KARTAVYA_PATH",
    points: 150,
    greybox: {
      realWorldDimensionsMeters: { width: 40.0, height: 8.0, depth: 300.0 },
      primaryGeometry: "Elongated asphalt roadway flanked by dual stepped water canals, low concrete bollards, and repeating cybernetic lampposts spaced at 25-meter intervals.",
      neonLightingConfig: {
        crimsonGlowHex: "#9D071A",
        signalNeonHex: "#D62E42",
        accentIntensity: 3.2,
        lightType: "rectArea",
        lightPlacement: "Continuous recessed ground-plane neon strips bordering the water channels and overhead smart lamppost rings.",
      },
      architecturalComponents: [
        "Roadway slab: 40m wide asphalt and gunmetal runway with center lane LED markers",
        "Reflecting Canals: Twin 12m wide linear water channels with specular obsidian reflection",
        "Bollard array: 50 cylindrical concrete bollards (0.4m diameter x 0.9m height) with glowing crimson rings",
        "Data tap junction boxes: Weatherproof brushed metal cabinets with blinking status LEDs",
      ],
    },
  },
  {
    id: "central-secretariat",
    chapterNumber: 3,
    name: "Central Secretariat Metro",
    title: "Chapter 03: The Brutalist Subterranean Grid",
    progressRange: [0.28, 0.45],
    coordinates: { x: -20, y: -25, z: -350 },
    lore: "Subterranean brutalist transit nexus connecting ministerial mainframe backbones. Automated turnstiles emit sharp warning beeps as RFID data streams route through concrete tunnels.",
    radioFrequencyMhz: 384.15,
    signalId: "SIG_CENTRAL_SEC",
    points: 200,
    greybox: {
      realWorldDimensionsMeters: { width: 24.0, height: 7.5, depth: 140.0 },
      primaryGeometry: "Cast-in-place reinforced concrete subterranean hall with modular rectangular support columns (1.2m x 1.2m), suspended mechanical conduits, and dual escalators.",
      neonLightingConfig: {
        crimsonGlowHex: "#9D071A",
        signalNeonHex: "#D62E42",
        accentIntensity: 5.0,
        lightType: "spot",
        lightPlacement: "Downward spotlights over fare gates and horizontal ceiling cable-tray illumination.",
      },
      architecturalComponents: [
        "Concourse Hall: 140m length x 24m width subterranean cavern with exposed board-formed concrete",
        "Fare Gates: Array of 12 automated glass-and-steel turnstiles with signal red gate barriers",
        "Station Platform Edge: Yellow tactile warning tiles coupled with red embedded laser tripwires",
        "Suspended signage: Dual-sided LED transit departure matrix showing encrypted packet routes",
      ],
    },
  },
  {
    id: "yellow-line-train",
    chapterNumber: 4,
    name: "Train Ride on Yellow Line",
    title: "Chapter 04: The Velocity Conduit",
    progressRange: [0.45, 0.62],
    coordinates: { x: 0, y: -30, z: -600 },
    lore: "Inside an 8-car stainless steel commuter rake hurtling at 80 km/h through dark tunnels. Fluorescent reflections flicker off steel grab poles as train telemetry transmits across track switches.",
    radioFrequencyMhz: 452.90,
    signalId: "SIG_YELLOW_LINE",
    points: 250,
    greybox: {
      realWorldDimensionsMeters: { width: 3.2, height: 3.8, depth: 22.0 }, // Single coach dimension
      primaryGeometry: "Stainless steel monocoque train carriage interior with barrel-vaulted ceiling, longitudinal bench seating, central stanchion poles, and wide panoramic windows.",
      neonLightingConfig: {
        crimsonGlowHex: "#9D071A",
        signalNeonHex: "#D62E42",
        accentIntensity: 3.8,
        lightType: "rectArea",
        lightPlacement: "Overhead door indicator LEDs and recessed emergency lighting strip running along the train ceiling center line.",
      },
      architecturalComponents: [
        "Carriage Shell: 22m length x 3.2m width x 3.8m height stainless steel passenger coach",
        "Subway Tunnel: Circular tube tunnel (5.8m inner diameter) with passing utility pipes and strobe lights",
        "Grab Poles: Brushed aluminum stanchions (0.04m diameter) with red rubber grips",
        "Route map display: Dynamic LED route diagram above doors showing progressing blinking node",
      ],
    },
  },
  {
    id: "rajiv-chowk",
    chapterNumber: 5,
    name: "Rajiv Chowk / Connaught Place",
    title: "Chapter 05: The Concentric Hive",
    progressRange: [0.62, 0.80],
    coordinates: { x: 0, y: 0, z: -900 },
    lore: "The massive Georgian-cyber double rotunda of Connaught Place. Neon corporate holograms illuminate 330-meter circular white colonnades while rogue mesh networks battle over radial frequency bands.",
    radioFrequencyMhz: 580.00,
    signalId: "SIG_RAJIV_CHOWK",
    points: 300,
    greybox: {
      realWorldDimensionsMeters: { width: 330.0, height: 18.0, depth: 330.0 },
      primaryGeometry: "Concentric circular colonnaded rings with two-story Palladian colonnades, 8 radial arterial avenue cuts, and central sunken park garden.",
      neonLightingConfig: {
        crimsonGlowHex: "#9D071A",
        signalNeonHex: "#D62E42",
        accentIntensity: 6.0,
        lightType: "spot",
        lightPlacement: "Pillar uplights along outer circular arcade and towering red cyber advertising billboards.",
      },
      architecturalComponents: [
        "Inner Circle Ring: 330m diameter circular 2-story arcade with classical Doric columns (0.8m diameter)",
        "Radial Avenues: 8 roadway thoroughfares breaking outward like spokes on a cybernetic wheel",
        "Rooftop Hologram Billboards: Giant neon advertising meshes displaying glitches and BSides branding",
        "Sunken Central Park: Center circular lawn with subterranean glass skylights peering down into metro level",
      ],
    },
  },
  {
    id: "skyline",
    chapterNumber: 6,
    name: "Skyline",
    title: "Chapter 06: The Troposphere Uplink",
    progressRange: [0.80, 1.00],
    coordinates: { x: 0, y: 180, z: -1200 },
    lore: "Perched 200 meters above the metropolis. Smog-piercing red aircraft beacons pulse atop telecom skyscraper spires as orbital transponders beam down the final encrypted summit transmission.",
    radioFrequencyMhz: 890.50,
    signalId: "SIG_SKYLINE",
    points: 400,
    greybox: {
      realWorldDimensionsMeters: { width: 500.0, height: 250.0, depth: 500.0 },
      primaryGeometry: "Dense cluster of monolithic glass-and-steel skyscrapers (ranging from 120m to 240m in height) topped with lattice microwave communication spires and satellite parabolic dishes.",
      neonLightingConfig: {
        crimsonGlowHex: "#9D071A",
        signalNeonHex: "#D62E42",
        accentIntensity: 8.0,
        lightType: "spot",
        lightPlacement: "Pulsing red obstruction beacons (FL 40/min) and vertical red neon corner edge trims running up building spines.",
      },
      architecturalComponents: [
        "Telecommunications Skyscraper: 240m tapered glass tower with observation roof helipad",
        "Microwave Lattice Tower: 45m steel truss mast carrying 8 parabolic dish antennas",
        "Obstruction Warning Beacons: High-candela synchronized signal-red strobes on highest spires",
        "Atmospheric Laser Array: Horizontal red collimated laser beam network linking rooftop data relays",
      ],
    },
  },
];

/**
 * Hash map of secret signals for validation.
 * Uses SHA-256 hashes of solutions to avoid exposing plaintext answers in repository code.
 */
interface SignalSecretEntry {
  chapterId: string;
  signalId: string;
  expectedHash: string; // SHA-256 lowercase hex
  points: number;
  hint: string;
}

/**
 * SHA-256 helper
 */
function hashString(input: string): string {
  return crypto.createHash("sha256").update(input.trim().toUpperCase()).digest("hex");
}

/**
 * Registry of valid signal codes for the 6 chapters + 1 interactive Console Easter Egg
 */
const SIGNAL_REGISTRY: Record<string, SignalSecretEntry> = {
  // Chapter 1: India Gate
  SIG_INDIA_GATE: {
    chapterId: "india-gate",
    signalId: "SIG_INDIA_GATE",
    expectedHash: hashString("AMAR_JAWAN_1971"),
    points: 100,
    hint: "Check the memorial vault frequency 142.85 MHz at progress 0.00-0.10",
  },
  // Chapter 2: Kartavya Path
  SIG_KARTAVYA_PATH: {
    chapterId: "kartavya-path",
    signalId: "SIG_KARTAVYA_PATH",
    expectedHash: hashString("OPTICAL_CONDUIT_NORTH"),
    points: 150,
    hint: "Inspect the reflective canal data tap at frequency 218.40 MHz",
  },
  // Chapter 3: Central Secretariat
  SIG_CENTRAL_SEC: {
    chapterId: "central-secretariat",
    signalId: "SIG_CENTRAL_SEC",
    expectedHash: hashString("GATE_03_RFID_OVERRIDE"),
    points: 200,
    hint: "Decode the brutalist fare turnstile RFID string at frequency 384.15 MHz",
  },
  // Chapter 4: Yellow Line Train
  SIG_YELLOW_LINE: {
    chapterId: "yellow-line-train",
    signalId: "SIG_YELLOW_LINE",
    expectedHash: hashString("RAKE_COACH_4_TELEMETRY"),
    points: 250,
    hint: "Intercept train carriage velocity telemetry at frequency 452.90 MHz",
  },
  // Chapter 5: Rajiv Chowk / CP
  SIG_RAJIV_CHOWK: {
    chapterId: "rajiv-chowk",
    signalId: "SIG_RAJIV_CHOWK",
    expectedHash: hashString("RADIAL_NODE_INNER_CIRCLE"),
    points: 300,
    hint: "Follow radial avenue A through the Georgian colonnade at 580.00 MHz",
  },
  // Chapter 6: Skyline
  SIG_SKYLINE: {
    chapterId: "skyline",
    signalId: "SIG_SKYLINE",
    expectedHash: hashString("TROPOSPHERE_890_UPLINK"),
    points: 400,
    hint: "Align with the 240m tower microwave array at frequency 890.50 MHz",
  },
  // Easter Egg Console Signal (Interactive DevTools Terminal)
  SIG_CONSOLE_EASTER_EGG: {
    chapterId: "console",
    signalId: "SIG_CONSOLE_EASTER_EGG",
    expectedHash: hashString("NEO_DELHI_ROOT_OVERRIDE"),
    points: 500,
    hint: "Inspect browser developer tools console and trigger window.neoDelhi.grantSignal()",
  },
};

export interface SignalSubmissionInput {
  signalId: string;
  submittedCode: string;
  currentProgress?: number; // Scroll progress (0.00 - 1.00)
  userIdentifier: string; // Anonymous session ID or email
  existingSolvedSignals?: string[];
}

export interface SignalVerificationResult {
  success: boolean;
  signalId: string;
  chapterTitle?: string;
  pointsEarned: number;
  totalPoints: number;
  unlockedSignals: string[];
  clearanceToken?: string;
  discountUnlocked?: boolean;
  discountCode?: string;
  message: string;
  error?: string;
}

/**
 * Returns the corresponding journey chapter based on scroll progress (0.00 - 1.00)
 */
export function getJourneyChapterByProgress(progress: number): JourneyChapter {
  const clamped = Math.max(0, Math.min(1, progress));
  for (const chapter of JOURNEY_CHAPTERS) {
    if (clamped >= chapter.progressRange[0] && clamped <= chapter.progressRange[1]) {
      return chapter;
    }
  }
  // Default fallback to last chapter if 1.00
  return JOURNEY_CHAPTERS[JOURNEY_CHAPTERS.length - 1];
}

/**
 * Issues a cryptographically signed JWT token proving an attendee's ARG clearance level.
 */
export async function issueSignalClearanceToken(
  userIdentifier: string,
  solvedSignals: string[],
  totalPoints: number
): Promise<string> {
  const isGrandMaster = solvedSignals.length >= 6;

  return await new SignJWT({
    sub: userIdentifier,
    solvedSignals,
    totalPoints,
    isGrandMaster,
    discountEligible: isGrandMaster,
    discountCode: isGrandMaster ? "NEODELHI_1337_CYBER_20" : null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("neo-delhi-signals")
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

/**
 * Verifies a client-provided Signal Clearance Token
 */
export async function verifySignalClearanceToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: "neo-delhi-signals",
    });
    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Verifies an attendee's signal submission against the encrypted registry.
 */
export async function verifySignalSubmission({
  signalId,
  submittedCode,
  currentProgress,
  userIdentifier,
  existingSolvedSignals = [],
}: SignalSubmissionInput): Promise<SignalVerificationResult> {
  const signalMeta = SIGNAL_REGISTRY[signalId];

  if (!signalMeta) {
    return {
      success: false,
      signalId,
      pointsEarned: 0,
      totalPoints: 0,
      unlockedSignals: existingSolvedSignals,
      message: "Unknown transmission frequency ID.",
      error: "SIGNAL_NOT_FOUND",
    };
  }

  // Check if already unlocked
  if (existingSolvedSignals.includes(signalId)) {
    return {
      success: true,
      signalId,
      pointsEarned: 0,
      totalPoints: existingSolvedSignals.reduce((acc, id) => {
        return acc + (SIGNAL_REGISTRY[id]?.points || 0);
      }, 0),
      unlockedSignals: existingSolvedSignals,
      message: "Signal has already been decrypted and stored in telemetry memory.",
    };
  }

  // Hash submitted code and compare
  const incomingHash = hashString(submittedCode);
  const isMatch = incomingHash === signalMeta.expectedHash;

  if (!isMatch) {
    return {
      success: false,
      signalId,
      pointsEarned: 0,
      totalPoints: existingSolvedSignals.reduce((acc, id) => {
        return acc + (SIGNAL_REGISTRY[id]?.points || 0);
      }, 0),
      unlockedSignals: existingSolvedSignals,
      message: `Invalid decryption code. Hint: ${signalMeta.hint}`,
      error: "INVALID_DECRYPTION_CODE",
    };
  }

  // Successfully decrypted!
  const updatedSignals = Array.from(new Set([...existingSolvedSignals, signalId]));
  const totalPoints = updatedSignals.reduce((acc, id) => {
    return acc + (SIGNAL_REGISTRY[id]?.points || 0);
  }, 0);

  const discountUnlocked = updatedSignals.length >= 6;
  const discountCode = discountUnlocked ? "NEODELHI_1337_CYBER_20" : undefined;

  const clearanceToken = await issueSignalClearanceToken(
    userIdentifier,
    updatedSignals,
    totalPoints
  );

  const matchedChapter = JOURNEY_CHAPTERS.find((c) => c.id === signalMeta.chapterId);

  return {
    success: true,
    signalId,
    chapterTitle: matchedChapter?.title || "Classified Terminal Override",
    pointsEarned: signalMeta.points,
    totalPoints,
    unlockedSignals: updatedSignals,
    clearanceToken,
    discountUnlocked,
    discountCode,
    message: discountUnlocked
      ? "ALL JOURNEY CHAPTER SIGNALS DECRYPTED! Secret 20% registration discount unlocked: NEODELHI_1337_CYBER_20"
      : `Signal decrypted successfully! +${signalMeta.points} points allocated.`,
  };
}
