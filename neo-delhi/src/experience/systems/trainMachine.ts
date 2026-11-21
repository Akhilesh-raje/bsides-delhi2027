/**
 * Neo-Delhi 3D Cybersecurity Conference Experience
 * DMRC Yellow Line Metro Train State Machine
 *
 * Handles the state, kinematics, lighting, and audio triggers for the underground
 * train journey between Central Secretariat (progress 0.45) and Rajiv Chowk (progress 0.62).
 *
 * Architecture:
 * - Built on Zustand 5 reactive store
 * - Synced to smooth scroll progress via Lenis / GSAP ScrollTrigger
 * - Drives 3D carriage vibration, wheel rumble, tunnel lighting streaks, and door mechanics
 * - Features cyberpunk TCMS (Train Control & Management System) glitch injection for CTF / ARG signals
 */

import { create } from "zustand";

/** Chapter 4 boundaries in global scroll progress */
export const TRAIN_CHAPTER_BOUNDS = {
  START: 0.45,
  END: 0.62,
  DURATION: 0.17, // 0.62 - 0.45
} as const;

/** Possible states of the metro train journey */
export type TrainStatus =
  | "IDLE"             // Boarded at Central Secretariat, doors open
  | "DOORS_CLOSING"   // Chime ringing, indicator lights pulsing red, doors sliding shut
  | "ACCELERATING"    // Traction inverters whining, leaving station into dark tunnel
  | "CRUISING"        // High-speed transit (~80 km/h) through underground tunnel, red neon streaks
  | "DECELERATING"    // Regenerative braking, approaching Rajiv Chowk platform
  | "DOORS_OPENING"   // Platform aligned, pneumatic doors sliding open
  | "ARRIVED"         // Stopped at Rajiv Chowk, passengers disembarking
  | "GLITCH";         // Cyberpunk emergency / signal intercept anomaly

/** Sound cues triggered by state changes */
export type TrainAudioCue =
  | "chime_doors_closing"
  | "traction_motor_accel"
  | "tunnel_ambient_rumble"
  | "regenerative_braking"
  | "chime_doors_opening"
  | "station_announcement_cs"
  | "station_announcement_rc"
  | "tcms_glitch_alarm"
  | null;

/** Train physics and rendering parameters */
export interface TrainTelemetry {
  /** Local progress within Chapter 4 (0.0 to 1.0) */
  localProgress: number;
  /** Global page scroll progress (0.0 to 1.0) */
  globalProgress: number;
  /** Train operational state */
  status: TrainStatus;
  /** Speed in km/h (0 - 80) */
  speed: number;
  /** Door opening factor: 0.0 (fully closed) to 1.0 (fully open) */
  doorProgress: number;
  /** Camera & carriage rumble shake amplitude (0.0 to 1.0) */
  rumbleIntensity: number;
  /** Vibration frequency in Hz for shader / vertex displacement */
  rumbleFrequency: number;
  /** Interior cabin light color (hex) */
  interiorLightColor: string;
  /** Interior cabin light intensity multiplier */
  interiorLightIntensity: number;
  /** Tunnel light streak offset for endless tunnel illusion */
  tunnelLightOffset: number;
  /** Active audio cue to be consumed by audio listener */
  audioCue: TrainAudioCue;
  /** Station display HUD text (Hindi + English with cybersecurity flavor) */
  announcementText: string;
  /** TCMS cyber anomaly active flag */
  isGlitching: boolean;
  /** Glitch severity (0.0 to 1.0) */
  glitchIntensity: number;
  /** Current station name */
  currentStation: string;
  /** Next station name */
  nextStation: string;
  /** Distance to next station in meters */
  distanceRemaining: number;
}

export interface TrainActions {
  /** Updates all train telemetry from the master scroll progress */
  updateFromScroll: (globalProgress: number) => void;
  /** Force a manual state for testing or interactive triggers */
  setStatus: (status: TrainStatus) => void;
  /** Injects a TCMS cyber anomaly / glitch (used by CTF Signal #3) */
  triggerGlitch: (intensity?: number) => void;
  /** Resolves the cyber anomaly and restores normal telemetry */
  clearGlitch: () => void;
  /** Clear audio cue once played by audio manager */
  clearAudioCue: () => void;
  /** Reset train to initial Central Secretariat state */
  reset: () => void;
}

export type TrainStore = TrainTelemetry & TrainActions;

/** Initial default telemetry */
const INITIAL_STATE: TrainTelemetry = {
  localProgress: 0.0,
  globalProgress: TRAIN_CHAPTER_BOUNDS.START,
  status: "IDLE",
  speed: 0,
  doorProgress: 1.0,
  rumbleIntensity: 0.0,
  rumbleFrequency: 12.0,
  interiorLightColor: "#E5E1DF", // silver
  interiorLightIntensity: 1.0,
  tunnelLightOffset: 0,
  audioCue: "station_announcement_cs",
  announcementText: "केंद्रीय सचिवालय | Central Secretariat — Yellow Line to Rajiv Chowk",
  isGlitching: false,
  glitchIntensity: 0.0,
  currentStation: "Central Secretariat",
  nextStation: "Rajiv Chowk",
  distanceRemaining: 2400, // 2.4 km between CS and Rajiv Chowk
};

/**
 * Zustand reactive store for the DMRC Yellow Line cyber train
 */
export const useTrainMachine = create<TrainStore>()((set, get) => ({
  ...INITIAL_STATE,

  updateFromScroll: (globalProgress: number) => {
    const { START, END, DURATION } = TRAIN_CHAPTER_BOUNDS;

    // Clamp local progress between 0 and 1
    const clampedProgress = Math.max(0, Math.min(1, (globalProgress - START) / DURATION));
    const previousStatus = get().status;
    const isCurrentlyGlitching = get().isGlitching;

    let newStatus: TrainStatus = "IDLE";
    let speed = 0;
    let doorProgress = 0;
    let rumbleIntensity = 0;
    let interiorLightColor = "#E5E1DF"; // default silver
    let interiorLightIntensity = 1.0;
    let announcementText = "";
    let audioCue: TrainAudioCue = null;
    const distanceRemaining = Math.max(0, Math.round((1 - clampedProgress) * 2400));

    // Calculate tunnel light streaming offset based on accumulated progress
    const tunnelLightOffset = (clampedProgress * 150) % 50;

    if (isCurrentlyGlitching) {
      newStatus = "GLITCH";
      speed = get().speed * 0.85; // emergency decelerate
      doorProgress = 0;
      rumbleIntensity = 0.85;
      interiorLightColor = "#9D071A"; // emergency crimson glow
      interiorLightIntensity = 0.3 + Math.random() * 1.5; // flicker
      announcementText = "⚠ CRITICAL: TCMS SIGNAL CORRUPTED // PACKET INJECTION DETECTED";
    } else if (clampedProgress <= 0.08) {
      // 0.00 - 0.08: Station Boarding at Central Secretariat
      newStatus = "IDLE";
      speed = 0;
      doorProgress = 1.0;
      rumbleIntensity = 0.02;
      interiorLightColor = "#E5E1DF";
      interiorLightIntensity = 1.0;
      announcementText = "केंद्रीय सचिवालय | Central Secretariat — Welcome to BSides Delhi Express";
      if (previousStatus !== "IDLE") {
        audioCue = "station_announcement_cs";
      }
    } else if (clampedProgress <= 0.18) {
      // 0.08 - 0.18: Doors Closing
      newStatus = "DOORS_CLOSING";
      speed = 0;
      // Linear door close from 1.0 down to 0.0
      const doorCloseFactor = (clampedProgress - 0.08) / 0.10;
      doorProgress = Math.max(0, 1.0 - doorCloseFactor);
      rumbleIntensity = 0.05;
      interiorLightColor = "#D62E42"; // Signal warning red tint
      interiorLightIntensity = 1.1;
      announcementText = "सावधान! दरवाजे बंद हो रहे हैं | Please mind the closing doors";
      if (previousStatus !== "DOORS_CLOSING") {
        audioCue = "chime_doors_closing";
      }
    } else if (clampedProgress <= 0.40) {
      // 0.18 - 0.40: Accelerating out into the dark tunnel
      newStatus = "ACCELERATING";
      const accelFactor = (clampedProgress - 0.18) / 0.22;
      speed = Math.round(accelFactor * 78);
      doorProgress = 0.0;
      rumbleIntensity = 0.1 + accelFactor * 0.45;
      interiorLightColor = "#E5E1DF";
      interiorLightIntensity = 0.95;
      announcementText = `गति: ${speed} km/h | Tunnel Transit Sector 07-CS`;
      if (previousStatus !== "ACCELERATING") {
        audioCue = "traction_motor_accel";
      }
    } else if (clampedProgress <= 0.72) {
      // 0.40 - 0.72: Cruising at peak speed through underground tunnel
      newStatus = "CRUISING";
      speed = 78 + Math.sin(clampedProgress * 40) * 2; // subtle speed variance
      doorProgress = 0.0;
      rumbleIntensity = 0.45 + Math.sin(clampedProgress * 80) * 0.1;
      interiorLightColor = "#E5E1DF";
      interiorLightIntensity = 0.85 + Math.sin(clampedProgress * 15) * 0.15; // occasional tunnel flicker
      announcementText = "अगला स्टेशन: राजीव चौक | Next Station: Rajiv Chowk / Connaught Place";
      if (previousStatus !== "CRUISING") {
        audioCue = "tunnel_ambient_rumble";
      }
    } else if (clampedProgress <= 0.88) {
      // 0.72 - 0.88: Decelerating & Braking towards Rajiv Chowk platform
      newStatus = "DECELERATING";
      const decelFactor = (clampedProgress - 0.72) / 0.16;
      speed = Math.max(5, Math.round((1 - decelFactor) * 78));
      doorProgress = 0.0;
      rumbleIntensity = 0.5 * (1 - decelFactor * 0.6);
      interiorLightColor = "#E5E1DF";
      interiorLightIntensity = 1.0;
      announcementText = "राजीव चौक पर आपका स्वागत है | Approaching Rajiv Chowk Concourse";
      if (previousStatus !== "DECELERATING") {
        audioCue = "regenerative_braking";
      }
    } else if (clampedProgress <= 0.96) {
      // 0.88 - 0.96: Doors opening at Rajiv Chowk
      newStatus = "DOORS_OPENING";
      speed = 0;
      const doorOpenFactor = (clampedProgress - 0.88) / 0.08;
      doorProgress = Math.min(1.0, doorOpenFactor);
      rumbleIntensity = 0.04;
      interiorLightColor = "#D62E42"; // signal red alert on opening
      interiorLightIntensity = 1.2;
      announcementText = "दरवाजे बाईं तरफ खुलेंगे | Doors will open on the left";
      if (previousStatus !== "DOORS_OPENING") {
        audioCue = "chime_doors_opening";
      }
    } else {
      // 0.96 - 1.00: Arrived at Rajiv Chowk
      newStatus = "ARRIVED";
      speed = 0;
      doorProgress = 1.0;
      rumbleIntensity = 0.01;
      interiorLightColor = "#E5E1DF";
      interiorLightIntensity = 1.0;
      announcementText = "राजीव चौक | Rajiv Chowk — Exit for BSides Delhi Main Arena";
      if (previousStatus !== "ARRIVED") {
        audioCue = "station_announcement_rc";
      }
    }

    set({
      localProgress: clampedProgress,
      globalProgress,
      status: newStatus,
      speed: Math.round(speed),
      doorProgress,
      rumbleIntensity,
      tunnelLightOffset,
      interiorLightColor,
      interiorLightIntensity,
      announcementText,
      distanceRemaining,
      ...(audioCue ? { audioCue } : {}),
    });
  },

  setStatus: (status: TrainStatus) => {
    set({ status });
  },

  triggerGlitch: (intensity = 1.0) => {
    set({
      isGlitching: true,
      glitchIntensity: intensity,
      status: "GLITCH",
      interiorLightColor: "#9D071A", // crimson
      interiorLightIntensity: 1.8,
      audioCue: "tcms_glitch_alarm",
      announcementText: "⚠ ALERT: EXPLOIT INJECTION DETECTED // FREQ: 915MHz // SIGNAL #3 UNLOCKED",
    });
  },

  clearGlitch: () => {
    set({
      isGlitching: false,
      glitchIntensity: 0.0,
      interiorLightColor: "#E5E1DF",
      interiorLightIntensity: 1.0,
    });
  },

  clearAudioCue: () => {
    set({ audioCue: null });
  },

  reset: () => {
    set({ ...INITIAL_STATE });
  },
}));
