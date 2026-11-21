'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DESIGN_TOKENS } from '../store';

/**
 * RajivChowk Component
 *
 * Real-world scale representation (1 unit = 1 meter):
 * - Real Connaught Place (CP) / Rajiv Chowk: Iconic concentric circular Palladian colonnade.
 * - Inner Circle Radius: 65m (130m diameter ring).
 * - Central Park Plaza: 45m radius park featuring the central underground metro glass dome.
 *
 * Greybox Architectural Representation:
 * 1. Central Park Disk: Circular plaza turf with radial cyber-walkways
 * 2. Metro Interchange Dome: Geodesic glass/metal dome at park center (diameter: 18m)
 * 3. Concentric Colonnaded Blocks: 6 curved segmental blocks (Blocks A-F) around the ring:
 *    - Double-story Georgian arcade (Height: 14m, Depth: 16m)
 *    - Ground-level classical arched colonnade walkway
 *    - Roof balustrade parapet
 * 4. Radial Arterial Avenues: 6 wide street openings cutting through the concentric ring
 *
 * Cyberpunk Accents:
 * - Floating crimson holographic BSides Delhi cyber-shield emblem at y=20m above park
 * - Red neon rooftop billboard displays illuminating the Georgian facades
 * - 6 Radial laser beams shooting outward from the central hub along the avenues
 * - Colonnade pillar ground-wash uplights in signal red (#D62E42)
 */
export function RajivChowk() {
  const holoShieldRef = useRef<THREE.Group>(null);
  const centralLightRef = useRef<THREE.PointLight>(null);

  // 6 Radial sectors for Connaught Place colonnade blocks
  const sectors = useMemo(() => {
    return [0, 1, 2, 3, 4, 5].map((i) => {
      const angle = (i * Math.PI) / 3; // 60 degrees per block
      return {
        id: String.fromCharCode(65 + i), // Block A, B, C, D, E, F
        angle,
        x: Math.sin(angle) * 65,
        z: Math.cos(angle) * 65,
      };
    });
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Rotate and bob the holographic cyber shield
    if (holoShieldRef.current) {
      holoShieldRef.current.rotation.y = time * 0.4;
      holoShieldRef.current.position.y = 18 + Math.sin(time * 1.8) * 1.2;
    }

    // Dynamic core pulse
    if (centralLightRef.current) {
      centralLightRef.current.intensity = 3.0 + Math.sin(time * 5) * 0.6;
    }
  });

  return (
    <group position={[0, 0, -500]}>
      {/* ============================================================ */}
      {/* 1. CENTRAL PARK PLAZA & CONCOURSE (Radius: 45m)              */}
      {/* ============================================================ */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[48, 48]} />
        <meshStandardMaterial
          color={DESIGN_TOKENS.obsidian}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Outer Plaza Ring Road (Inner Circle roadway) */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[48, 64, 48]} />
        <meshStandardMaterial
          color={DESIGN_TOKENS.surface}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>

      {/* Concentric Signal Red Neon Boundary Strip */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[47.8, 48.2, 48]} />
        <meshBasicMaterial color={DESIGN_TOKENS.signal} />
      </mesh>

      {/* ============================================================ */}
      {/* 2. RAJIV CHOWK SUBWAY DOME & ESCALATOR WELL (Center)         */}
      {/* ============================================================ */}
      {/* Subway Glass Dome Core */}
      <mesh position={[0, 3.5, 0]}>
        <sphereGeometry args={[9, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={DESIGN_TOKENS.gunmetal}
          roughness={0.2}
          metalness={0.9}
          wireframe
        />
      </mesh>

      {/* Central Red Metro Beacon */}
      <mesh position={[0, 4.0, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 3.5, 16]} />
        <meshBasicMaterial color={DESIGN_TOKENS.signal} transparent opacity={0.6} />
      </mesh>

      <pointLight
        ref={centralLightRef}
        position={[0, 6, 0]}
        color={DESIGN_TOKENS.signal}
        intensity={3.2}
        distance={45}
        decay={2}
      />

      {/* ============================================================ */}
      {/* 3. SIX CONCENTRIC COLONNADE BLOCKS (Blocks A through F)      */}
      {/* ============================================================ */}
      {sectors.map((sec, idx) => {
        return (
          <group key={sec.id} position={[sec.x, 0, sec.z]} rotation={[0, -sec.angle, 0]}>
            {/* Main Double-Story Building Block (Width: 38m, H: 14m, D: 16m) */}
            <mesh position={[0, 7, 0]} castShadow receiveShadow>
              <boxGeometry args={[38, 14, 16]} />
              <meshStandardMaterial
                color={DESIGN_TOKENS.gunmetal}
                roughness={0.6}
                metalness={0.4}
              />
            </mesh>

            {/* Georgian Colonnade Portico Arcade (Ground Floor Covered Veranda) */}
            <mesh position={[0, 3.2, 8.5]} receiveShadow>
              <boxGeometry args={[38, 0.6, 3]} />
              <meshStandardMaterial color={DESIGN_TOKENS.surface} />
            </mesh>

            {/* Arcade Columns (8 classical pillars along the front portico) */}
            {[-16, -11, -6, -2, 2, 6, 11, 16].map((colX, cIdx) => (
              <mesh key={cIdx} position={[colX, 3.2, 9.8]} castShadow>
                <cylinderGeometry args={[0.4, 0.45, 6.4, 10]} />
                <meshStandardMaterial
                  color={DESIGN_TOKENS.silver}
                  roughness={0.4}
                  metalness={0.5}
                />
              </mesh>
            ))}

            {/* Roof Balustrade Parapet */}
            <mesh position={[0, 14.5, 0]}>
              <boxGeometry args={[39, 1.2, 17]} />
              <meshStandardMaterial color={DESIGN_TOKENS.surface} />
            </mesh>

            {/* Cyberpunk Rooftop Billboard / Neon Sign */}
            <mesh position={[0, 16.2, 7.5]}>
              <boxGeometry args={[18, 2.2, 0.3]} />
              <meshStandardMaterial
                color={DESIGN_TOKENS.obsidian}
                roughness={0.3}
                metalness={0.8}
              />
            </mesh>
            {/* Neon Sign Face */}
            <mesh position={[0, 16.2, 7.7]}>
              <boxGeometry args={[17.2, 1.8, 0.05]} />
              <meshBasicMaterial color={DESIGN_TOKENS.signal} />
            </mesh>

            {/* Pillar Ground Uplights */}
            <pointLight
              position={[0, 1.0, 9.5]}
              color={DESIGN_TOKENS.signal}
              intensity={0.9}
              distance={12}
            />
          </group>
        );
      })}

      {/* ============================================================ */}
      {/* 4. HOLOGRAPHIC BSIDES DELHI CYBER-SHIELD (Hovering at y=18m) */}
      {/* ============================================================ */}
      <group ref={holoShieldRef} position={[0, 18, 0]}>
        {/* Outer Hexagonal Shield Ring */}
        <mesh>
          <torusGeometry args={[8.5, 0.25, 8, 6]} />
          <meshBasicMaterial color={DESIGN_TOKENS.signal} wireframe />
        </mesh>
        {/* Inner Concentric Pulse Ring */}
        <mesh rotation={[0, 0, Math.PI / 6]}>
          <torusGeometry args={[5.5, 0.18, 8, 6]} />
          <meshBasicMaterial color={DESIGN_TOKENS.crimson} wireframe />
        </mesh>
        {/* Central Core Emblem */}
        <mesh>
          <octahedronGeometry args={[2.5]} />
          <meshBasicMaterial color={DESIGN_TOKENS.signal} wireframe />
        </mesh>
        {/* Hologram Volumetric Glow */}
        <pointLight
          color={DESIGN_TOKENS.crimson}
          intensity={4.0}
          distance={35}
          decay={2}
        />
      </group>

      {/* ============================================================ */}
      {/* 5. RADIAL LASER SPOKES (6 Avenues radiating outward)         */}
      {/* ============================================================ */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const spokeAngle = (i * Math.PI) / 3 + Math.PI / 6; // Midway between blocks
        return (
          <group key={i} rotation={[0, spokeAngle, 0]}>
            <mesh position={[0, 0.1, 70]}>
              <boxGeometry args={[0.15, 0.05, 55]} />
              <meshBasicMaterial color={DESIGN_TOKENS.signal} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default RajivChowk;
