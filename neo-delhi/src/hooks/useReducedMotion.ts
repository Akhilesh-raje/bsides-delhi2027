"use client";

import { useMediaQuery } from "./useMediaQuery";
import { useCallback, useEffect, useState } from "react";

const REDUCED_MOTION_OVERRIDE_KEY = "neo_delhi_motion_override";

export type MotionMode = "system" | "reduced" | "full";

/**
 * Hook to detect if the user prefers reduced motion based on OS accessibility settings.
 *
 * Essential for the 3D scroll-driven journey chapters:
 * 1. India Gate (0.00-0.10)
 * 2. Kartavya Path (0.10-0.28)
 * 3. Central Secretariat Metro (0.28-0.45)
 * 4. Train Ride on Yellow Line (0.45-0.62)
 * 5. Rajiv Chowk / Connaught Place (0.62-0.80)
 * 6. Skyline (0.80-1.00)
 *
 * When reduced motion is active:
 * - GSAP ScrollTrigger disables continuous camera lerping and snaps cleanly between waypoints
 * - Lenis smooth scroll dampening is lowered or disabled
 * - Heavy Three.js particle simulations and neon bloom oscillations are frozen or simplified
 *
 * @returns boolean `true` if reduced motion is requested
 */
export function useReducedMotion(): boolean {
  const systemPrefersReduced = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
    false
  );

  const [override, setOverride] = useState<MotionMode>("system");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(REDUCED_MOTION_OVERRIDE_KEY);
      if (stored === "reduced" || stored === "full" || stored === "system") {
        setOverride(stored as MotionMode);
      }
    } catch {
      // LocalStorage access may be restricted in private browsing
    }
  }, []);

  if (override === "reduced") return true;
  if (override === "full") return false;
  return systemPrefersReduced;
}

/**
 * Extended hook that provides both the current state and a setter to allow
 * user-configurable accessibility preferences in the Neo-Delhi settings modal.
 */
export function useReducedMotionPreference() {
  const systemPrefersReduced = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
    false
  );

  const [mode, setModeState] = useState<MotionMode>("system");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(REDUCED_MOTION_OVERRIDE_KEY);
      if (stored === "reduced" || stored === "full" || stored === "system") {
        setModeState(stored as MotionMode);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const setMode = useCallback((newMode: MotionMode) => {
    setModeState(newMode);
    try {
      if (newMode === "system") {
        localStorage.removeItem(REDUCED_MOTION_OVERRIDE_KEY);
      } else {
        localStorage.setItem(REDUCED_MOTION_OVERRIDE_KEY, newMode);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const isReduced =
    mode === "reduced" ? true : mode === "full" ? false : systemPrefersReduced;

  return {
    isReducedMotion: isReduced,
    systemPrefersReduced,
    mode,
    setMode,
  };
}
