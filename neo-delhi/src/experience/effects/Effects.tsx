'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
  ToneMapping,
} from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import { useExperienceStore } from '../store';

interface EffectsProps {
  /**
   * Override post-processing bloom intensity
   */
  bloomIntensity?: number;
  /**
   * Dynamic response multiplier to scroll velocity
   */
  velocityFactor?: number;
}

/**
 * Effects
 * Post-processing pipeline for the Neo-Delhi cyberpunk aesthetic.
 * Accentuates the deep obsidian (#08090D) shadows with brilliant crimson (#9D071A)
 * and signal red (#D62E42) neon illumination, chromatic lens distortion, and film grain.
 * Scales dynamically based on detected GPU tier.
 */
export function Effects({ bloomIntensity, velocityFactor = 0.004 }: EffectsProps) {
  const gpuTier = useExperienceStore((state) => state.gpuTier);
  const quality = useExperienceStore((state) => state.quality);
  const velocity = useExperienceStore((state) => state.velocity);

  // Dynamic chromatic aberration offset based on scroll velocity
  const aberrationOffset = useMemo(() => {
    const baseOffset = 0.0008;
    const speedBoost = Math.min(Math.abs(velocity) * velocityFactor, 0.0035);
    return new THREE.Vector2(baseOffset + speedBoost, baseOffset + speedBoost);
  }, [velocity, velocityFactor]);

  // Gracefully skip post-processing on tier 0 hardware (integrated/low-end mobile)
  if (gpuTier === 0 || !quality.enablePostProcessing) {
    return null;
  }

  const effectiveBloomIntensity = bloomIntensity ?? quality.bloomIntensity;

  return (
    <EffectComposer
      multisampling={gpuTier >= 3 ? 4 : gpuTier === 2 ? 2 : 0}
      enableNormalPass={false}
    >
      {/* 1. Neon Glow: Accentuates red lasers, flame pedestals, HUD displays */}
      {quality.enableBloom && (
        <Bloom
          luminanceThreshold={0.18}
          luminanceSmoothing={0.85}
          intensity={effectiveBloomIntensity}
          radius={0.7}
          mipmapBlur
        />
      )}

      {/* 2. Cyber Lens Aberration: Reacts to high-speed scroll */}
      {quality.enableChromaticAberration && (
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={aberrationOffset}
          radialModulation={false}
          modulationOffset={0.15}
        />
      )}

      {/* 3. Subtle Cyber Film Grain */}
      {quality.enableNoise && (
        <Noise
          blendFunction={BlendFunction.OVERLAY}
          opacity={0.035}
          premultiply
        />
      )}

      {/* 4. Obsidian Vignette: Focuses viewer attention to central roadway */}
      {quality.enableVignette && (
        <Vignette
          eskil={false}
          offset={0.25}
          darkness={0.7}
          blendFunction={BlendFunction.NORMAL}
        />
      )}

      {/* 5. ACES Filmic Tone Mapping */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}

export default Effects;
