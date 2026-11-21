'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DESIGN_TOKENS, useExperienceStore } from '../store';

/**
 * AtmosphericParticles Component
 *
 * Simulates floating ambient cybersecurity telemetry particles / data dust
 * that catch red neon light across the journey chapters.
 * Particle count scales dynamically with the detected GPU tier.
 */
export function AtmosphericParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = useExperienceStore((state) => state.quality.particleCount);

  const [positions, scales] = useMemo(() => {
    const count = particleCount || 800;
    const pos = new Float32Array(count * 3);
    const scl = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Scatter along the journey trajectory (z from 40 to -650, x from -120 to 120, y from -15 to 150)
      pos[i * 3 + 0] = (Math.random() - 0.5) * 240;
      pos[i * 3 + 1] = -12 + Math.random() * 160;
      pos[i * 3 + 2] = 40 - Math.random() * 700;
      scl[i] = 0.5 + Math.random() * 1.5;
    }

    return [pos, scl];
  }, [particleCount]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = time * 0.015;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={DESIGN_TOKENS.signal}
        size={0.65}
        sizeAttenuation
        transparent
        opacity={0.45}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default AtmosphericParticles;
