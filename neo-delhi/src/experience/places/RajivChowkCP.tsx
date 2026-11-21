"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame, type ThreeElements } from "@react-three/fiber";

/**
 * RajivChowkCP Props
 * Supports standard Three.js group props plus scroll progress and active state.
 */
export type RajivChowkCPProps = ThreeElements["group"] & {
  /** Scroll progress through journey (Rajiv Chowk / CP chapter: 0.62 - 0.80) */
  progress?: number;
  /** Whether this chapter is active */
  active?: boolean;
};

/**
 * Rajiv Chowk / Connaught Place (Greybox Architecture)
 * Iconic concentric Georgian colonnade transformed into the Neo-Delhi Cyber Bazaar & Hacker Exchange.
 * Features a grand sweeping circular colonnade facade (Radius ~45m, Height ~13m),
 * curved rooftop cyber-billboards, sunken Central Park amphitheater, radial street portals,
 * and central 30m cybernetic broadcast transmission spire.
 *
 * Design Tokens:
 * - obsidian: #08090D (sunken central park amphitheater, deep alley recesses)
 * - surface: #111319 (colonnade floor decks, inner arcade walls)
 * - gunmetal: #252831 (brutalist classical Tuscan pillars, entablature, facade)
 * - crimson: #9D071A (billboard ambient glow, loggia interior recesses)
 * - signal: #D62E42 (holographic billboards, spire laser beams, plaza ring neon)
 * - silver: #E5E1DF (colonnade cornices, balustrades, mast lattice)
 * - muted: #99949A (subway canopies, structural louvers)
 */
export function RajivChowkCP({
  progress = 0.71,
  active = true,
  ...groupProps
}: RajivChowkCPProps) {
  // Animation refs
  const spireAntennaRef = useRef<THREE.Group>(null);
  const billboardScreenRef = useRef<THREE.Mesh>(null);
  const centralLaserRef = useRef<THREE.Mesh>(null);
  const plazaRingsRef = useRef<THREE.Group>(null);

  // Generate radial colonnade segments along a 140-degree circular arc (Radius = 45m)
  const colonnadePillars = useMemo(() => {
    const pillars: { angle: number; x: number; z: number }[] = [];
    const startAngle = -Math.PI * 0.4;
    const endAngle = Math.PI * 0.4;
    const count = 18;
    const step = (endAngle - startAngle) / count;

    for (let i = 0; i <= count; i++) {
      const angle = startAngle + i * step;
      // Skip angles where radial streets cut through (Janpath & Barakhamba portals)
      if (Math.abs(angle) < 0.12 || Math.abs(angle - 0.6) < 0.12 || Math.abs(angle + 0.6) < 0.12) {
        continue;
      }
      const x = Math.sin(angle) * 45;
      const z = -Math.cos(angle) * 45;
      pillars.push({ angle, x, z });
    }
    return pillars;
  }, []);

  // Generate rooftop billboard arcs
  const billboardAngles = useMemo(() => [-0.85, -0.32, 0.32, 0.85], []);

  // Frame animation for dynamic cyber-bazaar ambiance
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    // Rotating antenna arrays atop the central broadcast spire
    if (spireAntennaRef.current) {
      spireAntennaRef.current.rotation.y = time * 0.75;
    }

    // Dynamic holographic billboard illumination
    if (billboardScreenRef.current) {
      const mat = billboardScreenRef.current.material as THREE.MeshStandardMaterial;
      if (mat.emissiveIntensity !== undefined) {
        mat.emissiveIntensity = 2.0 + Math.sin(time * 4.0) * 0.6 + (Math.random() > 0.97 ? -0.5 : 0);
      }
    }

    // Skyward cyber laser uplink beam pulse
    if (centralLaserRef.current) {
      const scaleXZ = 1.0 + Math.sin(time * 6.0) * 0.2;
      centralLaserRef.current.scale.set(scaleXZ, 1.0, scaleXZ);
    }

    // Concentric radial waves across the plaza floor rings
    if (plazaRingsRef.current) {
      plazaRingsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          const wave = Math.sin(time * 3.0 - i * 1.2);
          mat.emissiveIntensity = 1.2 + Math.max(0, wave) * 2.2;
        }
      });
    }
  });

  return (
    <group {...groupProps} name="RajivChowkCP-Chapter">
      {/* ==================================================================== */}
      {/* 1. CENTRAL PARK PLAZA & SUNKEN AMPHITHEATER                          */}
      {/* Radius 26m concentric circular stepped plaza                         */}
      {/* ==================================================================== */}
      <group name="Central-Park-Plaza">
        {/* Main Sunken Amphitheater Floor (Y = 0m, Radius 26m) */}
        <mesh position={[0, -0.1, 0]} receiveShadow>
          <cylinderGeometry args={[26, 26, 0.2, 48]} />
          <meshStandardMaterial color="#08090D" roughness={0.85} metalness={0.2} />
        </mesh>

        {/* Stepped Concentric Terraces (Outer radial seating steps) */}
        {/* Terrace Tier 1 (Radius 28m) */}
        <mesh position={[0, 0.3, 0]} receiveShadow>
          <cylinderGeometry args={[28, 28, 0.4, 48, 1, true]} />
          <meshStandardMaterial color="#111319" roughness={0.8} metalness={0.3} />
        </mesh>
        {/* Terrace Tier 2 (Radius 30m) */}
        <mesh position={[0, 0.7, 0]} receiveShadow>
          <cylinderGeometry args={[30, 30, 0.4, 48, 1, true]} />
          <meshStandardMaterial color="#252831" roughness={0.75} metalness={0.3} />
        </mesh>

        {/* Concentric Glowing Red Neon Floor Rings */}
        <group ref={plazaRingsRef} name="Plaza-Neon-Rings">
          {[8, 14, 20, 26].map((rad, idx) => (
            <mesh key={`ring-${idx}`} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[rad - 0.08, rad + 0.08, 64]} />
              <meshStandardMaterial
                color="#D62E42"
                emissive="#D62E42"
                emissiveIntensity={2.5}
                side={THREE.DoubleSide}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>

        {/* Subterranean Rajiv Chowk Metro Station Entrances (Gates 1 & 2) */}
        {[-16, 16].map((mx, idx) => (
          <group key={`metro-portal-${idx}`} position={[mx, 0.6, 8]} rotation={[0, idx === 0 ? 0.3 : -0.3, 0]}>
            {/* Canopy Structure */}
            <mesh castShadow>
              <boxGeometry args={[4.2, 2.4, 6.0]} />
              <meshStandardMaterial
                color="#252831"
                metalness={0.8}
                roughness={0.3}
                transparent
                opacity={0.8}
              />
            </mesh>
            {/* Subway Downward Stair Trench */}
            <mesh position={[0, -0.8, 0]}>
              <boxGeometry args={[3.4, 1.2, 5.0]} />
              <meshStandardMaterial color="#08090D" roughness={0.9} />
            </mesh>
            {/* Illuminated Metro Portal Signboard */}
            <mesh position={[0, 1.3, 3.01]}>
              <boxGeometry args={[4.0, 0.4, 0.08]} />
              <meshStandardMaterial
                color="#D62E42"
                emissive="#D62E42"
                emissiveIntensity={3.0}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* ==================================================================== */}
      {/* 2. CENTRAL BROADCAST TRANSMISSION SPIRE                              */}
      {/* 32m tall mast representing the iconic CP central flagpole & antenna  */}
      {/* ==================================================================== */}
      <group position={[0, 0, 0]} name="Central-Broadcast-Spire">
        {/* Massive Octagonal Spire Base Plinth */}
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.8, 3.4, 1.6, 8]} />
          <meshStandardMaterial color="#111319" roughness={0.7} metalness={0.5} />
        </mesh>

        {/* Base Perimeter Red Indicator Band */}
        <mesh position={[0, 1.62, 0]}>
          <cylinderGeometry args={[2.85, 2.85, 0.08, 16]} />
          <meshStandardMaterial
            color="#D62E42"
            emissive="#D62E42"
            emissiveIntensity={3.0}
            toneMapped={false}
          />
        </mesh>

        {/* Tapered Main Lattice Mast Tower (Rises to Y = 28m) */}
        <mesh position={[0, 14.5, 0]} castShadow>
          <cylinderGeometry args={[0.3, 1.6, 26, 12]} />
          <meshStandardMaterial color="#252831" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Antenna Platforms & Relay Dishes (Y = 18m and Y = 24m) */}
        <mesh position={[0, 18, 0]}>
          <cylinderGeometry args={[1.8, 1.8, 0.3, 16]} />
          <meshStandardMaterial color="#111319" metalness={0.8} />
        </mesh>
        <mesh position={[0, 24, 0]}>
          <cylinderGeometry args={[1.2, 1.2, 0.25, 16]} />
          <meshStandardMaterial color="#111319" metalness={0.8} />
        </mesh>

        {/* Rotating High-Gain Antenna Gantry */}
        <group ref={spireAntennaRef} position={[0, 24.5, 0]}>
          {[-1.0, 1.0].map((ax, idx) => (
            <group key={`dish-${idx}`} position={[ax, 0.4, 0]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.4, 0.2, 0.2, 12]} />
                <meshStandardMaterial color="#E5E1DF" metalness={0.9} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0, 0.15]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial
                  color="#D62E42"
                  emissive="#D62E42"
                  emissiveIntensity={3.5}
                  toneMapped={false}
                />
              </mesh>
            </group>
          ))}
        </group>

        {/* Spire Apex Beacon / Transmitter Tip (Y = 28m to 32m) */}
        <mesh position={[0, 29.5, 0]}>
          <cylinderGeometry args={[0.08, 0.15, 5, 8]} />
          <meshStandardMaterial color="#E5E1DF" metalness={0.9} />
        </mesh>

        {/* Central Laser Uplink Beam (Shooting into the night sky) */}
        <mesh ref={centralLaserRef} position={[0, 48, 0]}>
          <cylinderGeometry args={[0.15, 0.25, 36, 16]} />
          <meshStandardMaterial
            color="#D62E42"
            emissive="#D62E42"
            emissiveIntensity={4.5}
            transparent
            opacity={0.7}
            toneMapped={false}
          />
        </mesh>

        {/* Apex Flashing Red Beacon Point Light */}
        <pointLight position={[0, 32, 0]} color="#D62E42" intensity={3.5} distance={50} />
      </group>

      {/* ==================================================================== */}
      {/* 3. CONNAUGHT PLACE INNER CIRCLE CURVED COLONNADE                     */}
      {/* Monumental two-story circular Georgian-cyber facade (Radius = 45m)   */}
      {/* ==================================================================== */}
      <group name="Curved-Colonnade-Facade">
        {/* Continuous Colonnade Floor Deck (Radius 42m to 48m, Y = 0.2m) */}
        <mesh position={[0, 0.15, 0]} receiveShadow>
          <ringGeometry args={[41.5, 48.5, 64, 1, -Math.PI * 0.42, Math.PI * 0.84]} />
          <meshStandardMaterial color="#111319" roughness={0.8} metalness={0.3} />
        </mesh>

        {/* Colonnade Rear Backing Wall (Radius 48m, Height 12m) */}
        <mesh position={[0, 6.0, 0]}>
          <cylinderGeometry
            args={[48, 48, 12, 64, 1, true, -Math.PI * 0.42, Math.PI * 0.84]}
          />
          <meshStandardMaterial color="#1a1d26" roughness={0.8} side={THREE.BackSide} />
        </mesh>

        {/* Mid-Level Cornice / Floor Divider (Y = 5.2m) */}
        <mesh position={[0, 5.2, 0]}>
          <cylinderGeometry
            args={[45.5, 45.5, 0.5, 64, 1, true, -Math.PI * 0.42, Math.PI * 0.84]}
          />
          <meshStandardMaterial color="#252831" roughness={0.6} metalness={0.4} />
        </mesh>

        {/* Continuous Crimson Neon Accent Ribbon under Mid-Level Cornice */}
        <mesh position={[0, 4.9, 0]}>
          <cylinderGeometry
            args={[45.45, 45.45, 0.08, 64, 1, true, -Math.PI * 0.42, Math.PI * 0.84]}
          />
          <meshStandardMaterial
            color="#9D071A"
            emissive="#9D071A"
            emissiveIntensity={2.5}
            toneMapped={false}
          />
        </mesh>

        {/* Massive Roof Entablature & Parapet Header (Y = 11.5m to 13m) */}
        <mesh position={[0, 12.0, 0]} castShadow>
          <cylinderGeometry
            args={[46, 46, 1.8, 64, 1, true, -Math.PI * 0.42, Math.PI * 0.84]}
          />
          <meshStandardMaterial color="#252831" roughness={0.7} metalness={0.4} />
        </mesh>

        {/* Rooftop Continuous Glowing Signal Red Crown Trim */}
        <mesh position={[0, 13.0, 0]}>
          <cylinderGeometry
            args={[46.1, 46.1, 0.08, 64, 1, true, -Math.PI * 0.42, Math.PI * 0.84]}
          />
          <meshStandardMaterial
            color="#D62E42"
            emissive="#D62E42"
            emissiveIntensity={3.0}
            toneMapped={false}
          />
        </mesh>

        {/* Grand Tuscan Classical-Brutalist Pillars along the 45m Radius Arc */}
        <group name="Colonnade-Pillars">
          {colonnadePillars.map(({ angle, x, z }, idx) => (
            <group key={`cp-col-${idx}`} position={[x, 0, z]} rotation={[0, -angle, 0]}>
              {/* Lower Tier Ground Column (Height 5m) */}
              <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.45, 0.5, 5.0, 16]} />
                <meshStandardMaterial color="#E5E1DF" metalness={0.2} roughness={0.6} />
              </mesh>
              {/* Column Square Base Pedestal */}
              <mesh position={[0, 0.3, 0]} castShadow>
                <boxGeometry args={[1.2, 0.6, 1.2]} />
                <meshStandardMaterial color="#252831" roughness={0.8} />
              </mesh>
              {/* Column Capital Molding */}
              <mesh position={[0, 4.85, 0]}>
                <boxGeometry args={[1.1, 0.3, 1.1]} />
                <meshStandardMaterial color="#252831" roughness={0.7} />
              </mesh>

              {/* Upper Tier Loggia Pillar (Y = 5.5m to 10.8m) */}
              <mesh position={[0, 8.2, 0]} castShadow>
                <cylinderGeometry args={[0.38, 0.42, 5.4, 16]} />
                <meshStandardMaterial color="#252831" metalness={0.3} roughness={0.7} />
              </mesh>
              {/* Upper Loggia Arched Bay Opening in Backing Wall */}
              <mesh position={[0, 8.5, -2.8]}>
                <boxGeometry args={[2.8, 3.8, 0.2]} />
                <meshStandardMaterial
                  color="#111319"
                  emissive="#9D071A"
                  emissiveIntensity={0.6}
                />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* ==================================================================== */}
      {/* 4. CURVED ROOFTOP CYBER-BILLBOARDS & HOLOGRAPHIC SCREENS             */}
      {/* High-visibility conference media hoardings mounted atop the parapet  */}
      {/* ==================================================================== */}
      <group name="Rooftop-Billboards">
        {billboardAngles.map((ang, idx) => {
          const bx = Math.sin(ang) * 46.5;
          const bz = -Math.cos(ang) * 46.5;
          return (
            <group key={`billboard-${idx}`} position={[bx, 15.5, bz]} rotation={[0, -ang, 0]}>
              {/* Heavy Steel Truss Backing Support */}
              <mesh castShadow>
                <boxGeometry args={[14.0, 4.2, 0.6]} />
                <meshStandardMaterial color="#111319" metalness={0.8} roughness={0.4} />
              </mesh>
              {/* High-Contrast Neon Conference Display Face */}
              <mesh ref={idx === 1 ? billboardScreenRef : undefined} position={[0, 0, 0.35]}>
                <planeGeometry args={[13.6, 3.8]} />
                <meshStandardMaterial
                  color="#08090D"
                  emissive="#D62E42"
                  emissiveIntensity={2.5}
                  roughness={0.15}
                  metalness={0.9}
                  toneMapped={false}
                />
              </mesh>
              {/* Top Warning Neon Edge Strip */}
              <mesh position={[0, 2.12, 0.36]}>
                <boxGeometry args={[13.8, 0.08, 0.06]} />
                <meshStandardMaterial
                  color="#D62E42"
                  emissive="#D62E42"
                  emissiveIntensity={3.5}
                  toneMapped={false}
                />
              </mesh>
              {/* Billboard Downward Floodlight illuminating colonnade roof */}
              <spotLight
                position={[0, -1.0, 1.5]}
                target-position={[0, -6.0, 0]}
                color="#D62E42"
                intensity={2.0}
                distance={18}
                angle={0.6}
              />
            </group>
          );
        })}
      </group>

      {/* ==================================================================== */}
      {/* 5. RADIAL STREET PORTALS (JANPATH & BARAKHAMBA ROADWAY ENTRIES)      */}
      {/* Grand arterial breach cuts through the colonnade                     */}
      {/* ==================================================================== */}
      <group name="Radial-Road-Portals">
        {/* Center Portal (Radial Road 1 - Janpath Axis, ang = 0) */}
        <group position={[0, 0, -48]}>
          {/* Arterial Road Pavement heading north */}
          <mesh position={[0, 0.05, -12]} receiveShadow>
            <boxGeometry args={[10, 0.1, 24]} />
            <meshStandardMaterial color="#08090D" roughness={0.9} />
          </mesh>
          {/* Portal Flanking Pylon Columns */}
          <mesh position={[-5.8, 6.5, 0]} castShadow>
            <boxGeometry args={[1.8, 13.0, 2.4]} />
            <meshStandardMaterial color="#252831" roughness={0.7} metalness={0.4} />
          </mesh>
          <mesh position={[5.8, 6.5, 0]} castShadow>
            <boxGeometry args={[1.8, 13.0, 2.4]} />
            <meshStandardMaterial color="#252831" roughness={0.7} metalness={0.4} />
          </mesh>
          {/* Portal Overhead Gantry Arch */}
          <mesh position={[0, 12.2, 0]} castShadow>
            <boxGeometry args={[13.4, 1.8, 2.6]} />
            <meshStandardMaterial color="#111319" roughness={0.6} metalness={0.5} />
          </mesh>
          {/* Radial Road Cyber Wayfinding Sign ("JANPATH // RADIAL 01") */}
          <mesh position={[0, 12.2, 1.32]}>
            <planeGeometry args={[9.0, 0.9]} />
            <meshStandardMaterial
              color="#08090D"
              emissive="#D62E42"
              emissiveIntensity={2.5}
              toneMapped={false}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default RajivChowkCP;
