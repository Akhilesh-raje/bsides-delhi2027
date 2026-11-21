/**
 * Neo-Delhi 3D Places Barrel Export & Journey Chapter Metadata
 *
 * This module exports all 6 scroll-driven journey chapters for the
 * Neo-Delhi 3D cybersecurity conference website experience:
 *
 * 1. India Gate             (progress 0.00 - 0.10)
 * 2. Kartavya Path          (progress 0.10 - 0.28)
 * 3. Central Secretariat    (progress 0.28 - 0.45)
 * 4. Train Ride             (progress 0.45 - 0.62)
 * 5. Rajiv Chowk / CP       (progress 0.62 - 0.80)
 * 6. Skyline                (progress 0.80 - 1.00)
 */

import type React from "react";
import type { ThreeElements } from "@react-three/fiber";

// Re-export individual place components and their specific props
export { IndiaGate, type IndiaGateProps } from "./IndiaGate";
export { KartavyaPath, type KartavyaPathProps } from "./KartavyaPath";
export { CentralSecretariat, type CentralSecretariatProps } from "./CentralSecretariat";
export { TrainRide, type TrainRideProps } from "./TrainRide";
export { RajivChowkCP, type RajivChowkCPProps } from "./RajivChowkCP";
export { Skyline, type SkylineProps } from "./Skyline";

// Component aliases for flexible naming across views
export { TrainRide as YellowLineTrain } from "./TrainRide";
export { RajivChowkCP as RajivChowk } from "./RajivChowkCP";

// Environment components
export { CyberGrid } from "./CyberGrid";
export { AtmosphericParticles } from "./AtmosphericParticles";

/**
 * Common base props interface for all 3D Place chapters.
 */
export type PlaceProps = ThreeElements["group"] & {
  /** Normalized scroll journey progress (0.00 to 1.00) */
  progress?: number;
  /** Whether this chapter is actively in the camera viewport */
  active?: boolean;
};

/**
 * Journey Chapter definition containing spatial metadata, camera coordinates,
 * and display information for the scroll-driven narrative.
 */
export interface JourneyChapter {
  /** Unique chapter key */
  id: string;
  /** Numerical order (1 through 6) */
  index: number;
  /** Primary display title */
  title: string;
  /** Hindi / localized or contextual subtitle */
  subtitle: string;
  /** Narrative description of the location */
  description: string;
  /** Normalized scroll range start */
  progressStart: number;
  /** Normalized scroll range end */
  progressEnd: number;
  /** Default camera position [x, y, z] for this chapter */
  cameraPosition: [number, number, number];
  /** Default camera look-at target [x, y, z] */
  cameraTarget: [number, number, number];
  /** Recommended field of view */
  fov?: number;
}

/**
 * Master configuration table for the 6 scroll-driven chapters of Neo-Delhi.
 */
export const JOURNEY_CHAPTERS: readonly JourneyChapter[] = [
  {
    id: "india-gate",
    index: 1,
    title: "India Gate",
    subtitle: "Gateway of the Fallen Protocols",
    description:
      "A monumental sandstone arch reimagined as a fortified cyber-citadel gateway. The Amar Jawan Jyoti burns with a crimson eternal holographic flame honoring digital sovereignty.",
    progressStart: 0.0,
    progressEnd: 0.1,
    cameraPosition: [0, 14, 42],
    cameraTarget: [0, 16, 0],
    fov: 45,
  },
  {
    id: "kartavya-path",
    index: 2,
    title: "Kartavya Path",
    subtitle: "Ceremonial Data Highway",
    description:
      "The ceremonial spine connecting ancient power to modern cryptography. Flanked by symmetrical cyber-canals reflecting neon perimeter beacons, angular brutalist pylons, and intrusion detection gantries.",
    progressStart: 0.1,
    progressEnd: 0.28,
    cameraPosition: [0, 6, -15],
    cameraTarget: [0, 4, -80],
    fov: 50,
  },
  {
    id: "central-secretariat",
    index: 3,
    title: "Central Secretariat",
    subtitle: "Interchange Node 02 // Subterranean Bunker",
    description:
      "A subterranean brutalist metro bunker with ribbed concrete ceilings, smart AFC security turnstiles, high-voltage third-rails, and live passenger telemetry screens.",
    progressStart: 0.28,
    progressEnd: 0.45,
    cameraPosition: [0, 3.8, 12],
    cameraTarget: [0, 2.0, -10],
    fov: 55,
  },
  {
    id: "train-ride",
    index: 4,
    title: "Train Ride",
    subtitle: "Yellow Line Transit // Sub-Baud Speed",
    description:
      "Inside a speeding cyber-metro carriage hurtling at 120 km/h through subterranean data conduits. Stainless steel stanchions, glowing crimson route maps, and streaks of light slicing past tinted windows.",
    progressStart: 0.45,
    progressEnd: 0.62,
    cameraPosition: [0, 1.4, 4.5],
    cameraTarget: [0, 1.3, -4.5],
    fov: 60,
  },
  {
    id: "rajiv-chowk-cp",
    index: 5,
    title: "Rajiv Chowk / Connaught Place",
    subtitle: "Sector Zero // The Cyber Bazaar",
    description:
      "The sweeping Georgian circular colonnade retrofitted into a hacker bazaar. Rooftop curved holographic billboards, radial street portals, and a 32m transmission spire beaming lasers into the night.",
    progressStart: 0.62,
    progressEnd: 0.8,
    cameraPosition: [0, 8, 38],
    cameraTarget: [0, 14, -20],
    fov: 52,
  },
  {
    id: "skyline",
    index: 6,
    title: "Skyline",
    subtitle: "Neo-Delhi Megacity // Zenith",
    description:
      "High-altitude panoramic climax overlooking the sprawling cybernetic metropolis. Over two dozen monolithic towers crowned with blinking aviation beacons, an elevated maglev viaduct, and the massive BSides Cyber Citadel.",
    progressStart: 0.8,
    progressEnd: 1.0,
    cameraPosition: [0, 65, 80],
    cameraTarget: [0, 70, -165],
    fov: 48,
  },
] as const;

/**
 * Returns the active journey chapter corresponding to a given normalized progress value (0.0 to 1.0).
 */
export function getChapterByProgress(progress: number): JourneyChapter {
  const clamped = Math.max(0, Math.min(1, progress));
  for (const chapter of JOURNEY_CHAPTERS) {
    if (clamped >= chapter.progressStart && clamped <= chapter.progressEnd) {
      return chapter;
    }
  }
  return JOURNEY_CHAPTERS[JOURNEY_CHAPTERS.length - 1];
}

/**
 * Checks whether a given chapter is active for a specific progress value,
 * with an optional margin of error / blend threshold.
 */
export function isChapterActive(
  chapter: JourneyChapter,
  progress: number,
  margin = 0.02
): boolean {
  return (
    progress >= chapter.progressStart - margin &&
    progress <= chapter.progressEnd + margin
  );
}
