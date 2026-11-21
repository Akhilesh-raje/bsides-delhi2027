import { useEffect, useState } from 'react';
import { getGPUTier, type TierResult } from 'detect-gpu';
import {
  useExperienceStore,
  type GPUTier,
  type QualitySettings,
  DEFAULT_QUALITY_TIERS,
} from './store';

export interface DeviceTierInfo {
  tier: GPUTier;
  isMobile: boolean;
  gpu?: string;
  fps?: number;
  quality: QualitySettings;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
}

let cachedTierInfo: DeviceTierInfo | null = null;
let detectionPromise: Promise<DeviceTierInfo> | null = null;

/**
 * Detects device GPU capability and returns optimal rendering parameters.
 * Caches the result after first execution.
 */
export async function detectDeviceTier(): Promise<DeviceTierInfo> {
  if (cachedTierInfo) {
    return cachedTierInfo;
  }

  if (detectionPromise) {
    return detectionPromise;
  }

  detectionPromise = (async () => {
    // Server-side rendering fallback
    if (typeof window === 'undefined') {
      const ssrInfo: DeviceTierInfo = {
        tier: 2,
        isMobile: false,
        quality: DEFAULT_QUALITY_TIERS[2],
        deviceType: 'desktop',
      };
      return ssrInfo;
    }

    try {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

      // Query detect-gpu for hardware capabilities
      const report: TierResult = await getGPUTier();

      // Clamp tier to valid 0-3 range
      const rawTier = report.tier ?? 1;
      let finalTier: GPUTier = 1;

      if (rawTier <= 0) {
        finalTier = 0;
      } else if (rawTier === 1) {
        finalTier = 1;
      } else if (rawTier === 2) {
        finalTier = 2;
      } else {
        finalTier = 3;
      }

      // Check for battery saving or reduced motion preferences
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion && finalTier > 1) {
        finalTier = 1;
      }

      // Detect hardware concurrency and memory constraints
      const cores = navigator.hardwareConcurrency || 4;
      if (cores <= 2 && finalTier > 1) {
        finalTier = 1;
      }

      const quality: QualitySettings = {
        ...DEFAULT_QUALITY_TIERS[finalTier],
      };

      // Tune settings for mobile viewports
      if (isMobileDevice) {
        quality.dpr = [1, Math.min(quality.dpr[1], 1.5)];
        quality.particleCount = Math.floor(quality.particleCount * 0.6);
        if (finalTier >= 2) {
          quality.enableShadows = false; // Disable heavy dynamic shadows on mobile
        }
      }

      const tierInfo: DeviceTierInfo = {
        tier: finalTier,
        isMobile: isMobileDevice,
        gpu: report.gpu,
        fps: report.fps,
        quality,
        deviceType: report.isMobile ? 'mobile' : 'desktop',
      };

      cachedTierInfo = tierInfo;
      return tierInfo;
    } catch (err) {
      console.warn('[Experience] GPU detection failed, falling back to Tier 1 default:', err);

      const fallbackInfo: DeviceTierInfo = {
        tier: 1,
        isMobile: false,
        quality: DEFAULT_QUALITY_TIERS[1],
        deviceType: 'desktop',
      };

      cachedTierInfo = fallbackInfo;
      return fallbackInfo;
    }
  })();

  return detectionPromise;
}

/**
 * React hook to automatically initialize GPU detection and sync with Experience store
 */
export function useDeviceTier(): {
  tierInfo: DeviceTierInfo | null;
  isReady: boolean;
} {
  const [tierInfo, setTierInfo] = useState<DeviceTierInfo | null>(cachedTierInfo);
  const [isReady, setIsReady] = useState<boolean>(!!cachedTierInfo);

  const setGPUTier = useExperienceStore((state) => state.setGPUTier);
  const setIsMobile = useExperienceStore((state) => state.setIsMobile);

  useEffect(() => {
    let mounted = true;

    detectDeviceTier().then((info) => {
      if (!mounted) return;
      setTierInfo(info);
      setIsReady(true);
      setGPUTier(info.tier, info.quality);
      setIsMobile(info.isMobile);
    });

    return () => {
      mounted = false;
    };
  }, [setGPUTier, setIsMobile]);

  return { tierInfo, isReady };
}
