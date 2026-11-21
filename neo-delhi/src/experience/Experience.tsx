'use client';

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { DESIGN_TOKENS, useExperienceStore } from './store';
import { useDeviceTier } from './tiers';
import { CameraRig } from './CameraRig';
import { Effects } from './effects/Effects';
import {
  IndiaGate,
  KartavyaPath,
  CentralSecretariat,
  YellowLineTrain,
  RajivChowk,
  Skyline,
  CyberGrid,
  AtmosphericParticles,
} from './places';

interface ExperienceProps {
  className?: string;
  enablePostProcessing?: boolean;
}

/**
 * CyberLoadingFallback Component
 * Displayed while Three.js assets and shaders are being compiled.
 */
function CyberLoadingFallback() {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-obsidian text-silver pointer-events-none select-none">
      <div className="flex flex-col items-center gap-4">
        {/* Pulsing Signal Red Scanner */}
        <div className="relative w-48 h-1 bg-surface overflow-hidden rounded">
          <div className="absolute top-0 bottom-0 left-0 w-24 bg-signal animate-pulse" />
        </div>
        <div className="font-mono text-xs tracking-widest text-muted uppercase">
          INIT_NEO_DELHI_SPATIAL_MATRIX...
        </div>
      </div>
    </div>
  );
}

/**
 * SceneContent Component
 * Renders the full 6-chapter journey inside the WebGL Canvas.
 */
function SceneContent() {
  const setIsLoaded = useExperienceStore((state) => state.setIsLoaded);

  useEffect(() => {
    setIsLoaded(true);
    return () => setIsLoaded(false);
  }, [setIsLoaded]);

  return (
    <>
      {/* 1. Cyberpunk Atmospheric Fog (Obsidian #08090D) */}
      <fog attach="fog" args={[DESIGN_TOKENS.obsidian, 18, 260]} />

      {/* 2. Global Cyber Ambient & Directional Lighting */}
      {/* Deep Surface / Gunmetal Ambient Floor Wash */}
      <ambientLight color={DESIGN_TOKENS.surface} intensity={0.5} />

      {/* Cool Rim Directional Moonlight */}
      <directionalLight
        position={[25, 60, 20]}
        color={DESIGN_TOKENS.silver}
        intensity={0.35}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />

      {/* Key Crimson Volumetric Fill Light */}
      <directionalLight
        position={[-30, 40, -100]}
        color={DESIGN_TOKENS.crimson}
        intensity={0.4}
      />

      {/* 3. Global Cyber Terrain Grid */}
      <CyberGrid />

      {/* 4. Ambient Telemetry Data Dust / Particles */}
      <AtmosphericParticles />

      {/* 5. The 6 Journey Chapters (Greybox at Real-World Scale) */}
      {/* Chapter 1: India Gate (Progress 0.00 - 0.10) */}
      <IndiaGate />

      {/* Chapter 2: Kartavya Path (Progress 0.10 - 0.28) */}
      <KartavyaPath />

      {/* Chapter 3: Central Secretariat Metro (Progress 0.28 - 0.45) */}
      <CentralSecretariat />

      {/* Chapter 4: Train Ride on Yellow Line (Progress 0.45 - 0.62) */}
      <YellowLineTrain />

      {/* Chapter 5: Rajiv Chowk / Connaught Place (Progress 0.62 - 0.80) */}
      <RajivChowk />

      {/* Chapter 6: Neo-Delhi Skyline (Progress 0.80 - 1.00) */}
      <Skyline />

      {/* 6. Dynamic Camera Rig */}
      <CameraRig />

      {/* 7. Post-Processing Pipeline */}
      <Effects />
    </>
  );
}

/**
 * Experience Component
 * The master 3D interactive WebGL Canvas for the Neo-Delhi cybersecurity conference.
 */
export function Experience({ className = '', enablePostProcessing = true }: ExperienceProps) {
  const { tierInfo, isReady } = useDeviceTier();
  const quality = useExperienceStore((state) => state.quality);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <CyberLoadingFallback />;
  }

  return (
    <div className={`relative w-full h-full overflow-hidden bg-obsidian ${className}`}>
      <Suspense fallback={<CyberLoadingFallback />}>
        <Canvas
          shadows={quality.enableShadows}
          dpr={quality.dpr}
          camera={{
            fov: 52,
            near: 0.1,
            far: 1000,
            position: [0, 5, 50],
          }}
          gl={{
            antialias: quality.antialias,
            powerPreference: 'high-performance',
            alpha: false,
            stencil: false,
            depth: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.05,
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'auto',
          }}
        >
          <SceneContent />
        </Canvas>
      </Suspense>
    </div>
  );
}

export default Experience;
