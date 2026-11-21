"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame, type ThreeElements } from "@react-three/fiber";

/**
 * Skyline Props
 * Supports standard Three.js group props plus scroll progress and active state.
 */
export type SkylineProps = ThreeElements["group"] & {
  /** Scroll progress through journey (Skyline chapter: 0.80 - 1.00) */
  progress?: number;
  /** Whether this chapter is active */
  active?: boolean;
};

/**
 * Neo-Delhi City Skyline (Greybox Architecture)
 * High-altitude panoramic metropolis vista overlooking futuristic Neo-Delhi at night.
 * Features the monumental BSides Central Citadel (Height ~140m), 26 distinct skyscraper towers
 * with illuminated window matrices, elevated hyperloop maglev viaduct, inter-tower laser grid,
 * and pulsating rooftop aviation warning beacons.
 *
 * Design Tokens:
 * - obsidian: #08090D (ground terrain, night smog base, deep shadows)
 * - surface: #111319 (secondary tower masses, podiums)
 * - gunmetal: #252831 (primary skyscraper chassis, concrete monoliths)
 * - crimson: #9D071A (city light pollution floor glow, low-altitude fog)
 * - signal: #D62E42 (citadel apex beacon, laser relays, maglev train, aviation warning lights)
 * - silver: #E5E1DF (window illumination matrices, spire lattice)
 * - muted: #99949A (skybridges, communication arrays)
 */
export function Skyline({
  progress = 0.90,
  active = true,
  ...groupProps
}: SkylineProps) {
  // Animation refs
  const citadelRingsRef = useRef<THREE.Group>(null);
  const aviationBeaconsRef = useRef<THREE.Group>(null);
  const maglevTrainRef = useRef<THREE.Group>(null);
  const laserBeamsRef = useRef<THREE.Group>(null);

  // Procedurally generate a dense cluster of 26 skyscraper towers across depth
  const skyscrapers = useMemo(() => {
    const towers = [
      // FOREGROUND CLUSTER (Z: -60m to -110m, Height: 45m - 75m)
      { x: -55, z: -80, width: 18, depth: 16, height: 62, type: "stepped" },
      { x: -32, z: -70, width: 14, depth: 14, height: 52, type: "slab" },
      { x: 34, z: -75, width: 16, depth: 15, height: 58, type: "chamfered" },
      { x: 58, z: -85, width: 20, depth: 18, height: 68, type: "stepped" },
      { x: -18, z: -95, width: 12, depth: 12, height: 48, type: "slab" },
      { x: 20, z: -92, width: 14, depth: 14, height: 55, type: "spire" },

      // MIDGROUND TOWERS & TWIN ARCOLOGIES (Z: -120m to -180m, Height: 70m - 105m)
      { x: -75, z: -140, width: 22, depth: 20, height: 86, type: "stepped" },
      { x: -48, z: -130, width: 16, depth: 16, height: 78, type: "spire" },
      { x: -28, z: -150, width: 15, depth: 15, height: 92, type: "slab" },
      { x: 26, z: -145, width: 16, depth: 16, height: 88, type: "spire" },
      { x: 52, z: -135, width: 18, depth: 18, height: 82, type: "chamfered" },
      { x: 80, z: -150, width: 24, depth: 22, height: 95, type: "stepped" },
      { x: -95, z: -170, width: 26, depth: 24, height: 102, type: "slab" },
      { x: 92, z: -175, width: 25, depth: 25, height: 98, type: "stepped" },

      // DEEP BACKGROUND MONOLITHS (Z: -190m to -280m, Height: 90m - 125m)
      { x: -65, z: -210, width: 24, depth: 24, height: 112, type: "slab" },
      { x: -38, z: -230, width: 20, depth: 20, height: 108, type: "spire" },
      { x: -15, z: -220, width: 18, depth: 18, height: 118, type: "stepped" },
      { x: 18, z: -225, width: 18, depth: 18, height: 115, type: "stepped" },
      { x: 42, z: -215, width: 22, depth: 22, height: 110, type: "spire" },
      { x: 70, z: -230, width: 26, depth: 26, height: 122, type: "slab" },
      { x: -110, z: -250, width: 30, depth: 28, height: 118, type: "slab" },
      { x: 105, z: -245, width: 28, depth: 30, height: 124, type: "stepped" },
      { x: -50, z: -275, width: 26, depth: 26, height: 128, type: "spire" },
      { x: 50, z: -270, width: 28, depth: 26, height: 125, type: "slab" },
      { x: -85, z: -290, width: 32, depth: 30, height: 130, type: "slab" },
      { x: 85, z: -285, width: 30, depth: 32, height: 132, type: "stepped" },
    ];
    return towers;
  }, []);

  // Frame animation loop: Beacons, data rings, maglev train, laser pulses
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    // Rotating holographic data rings around Citadel apex
    if (citadelRingsRef.current) {
      citadelRingsRef.current.rotation.y = time * 0.45;
      citadelRingsRef.current.rotation.x = Math.sin(time * 0.3) * 0.15;
    }

    // Synchronized aviation warning beacon strobe (Blinks twice then pauses)
    if (aviationBeaconsRef.current) {
      const strobe = Math.sin(time * 6.0) > 0.4 ? 1.0 : 0.15;
      aviationBeaconsRef.current.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = strobe * 4.0;
        }
      });
    }

    // High-speed maglev train gliding along the skybridge viaduct
    if (maglevTrainRef.current) {
      // Moves along X axis across the city
      const trainX = ((time * 30.0) % 240.0) - 120.0;
      maglevTrainRef.current.position.x = trainX;
    }

    // Pulsing inter-tower data lasers
    if (laserBeamsRef.current) {
      const pulse = 1.0 + Math.sin(time * 8.0) * 0.3;
      laserBeamsRef.current.children.forEach((beam) => {
        const mesh = beam as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = 2.5 * pulse;
        }
      });
    }
  });

  return (
    <group {...groupProps} name="Skyline-Chapter">
      {/* ==================================================================== */}
      {/* 1. TERRAIN BASE & GROUND AMBIENT LIGHT POLLUTION                     */}
      {/* City floor plane covered in cybernetic street grid glow              */}
      {/* ==================================================================== */}
      <group name="City-Floor-And-Smog">
        {/* City Base Ground Slabs */}
        <mesh position={[0, -0.5, -170]} receiveShadow>
          <boxGeometry args={[320, 1.0, 320]} />
          <meshStandardMaterial color="#08090D" roughness={0.95} />
        </mesh>

        {/* Dense Ground-Level Crimson Light Spill (City Street Glow) */}
        <mesh position={[0, 1.0, -170]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[300, 300]} />
          <meshStandardMaterial
            color="#08090D"
            emissive="#9D071A"
            emissiveIntensity={0.8}
            roughness={0.9}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* Ambient Underglow Lights illuminating tower bases */}
        <pointLight position={[0, 15, -100]} color="#9D071A" intensity={3.0} distance={120} />
        <pointLight position={[-70, 15, -180]} color="#9D071A" intensity={2.5} distance={100} />
        <pointLight position={[70, 15, -180]} color="#9D071A" intensity={2.5} distance={100} />
      </group>

      {/* ==================================================================== */}
      {/* 2. CENTRAL BSIDES CYBER CITADEL (MEGA-SKYSCRAPER)                     */}
      {/* The towering architectural centerpiece of Neo-Delhi (142m height)    */}
      {/* ==================================================================== */}
      <group position={[0, 0, -165]} name="BSides-Cyber-Citadel">
        {/* Foundation Podium (42m x 42m x 12m) */}
        <mesh position={[0, 6, 0]} castShadow receiveShadow>
          <boxGeometry args={[42, 12, 42]} />
          <meshStandardMaterial color="#111319" roughness={0.7} metalness={0.4} />
        </mesh>

        {/* Tier 1 Lower Body (32m x 32m, Y = 12m to 52m, Height 40m) */}
        <mesh position={[0, 32, 0]} castShadow receiveShadow>
          <boxGeometry args={[32, 40, 32]} />
          <meshStandardMaterial color="#252831" roughness={0.6} metalness={0.5} />
        </mesh>
        {/* Tier 1 Window Accent Matrix Panels */}
        <mesh position={[0, 32, 16.1]}>
          <planeGeometry args={[26, 34]} />
          <meshStandardMaterial
            color="#111319"
            emissive="#E5E1DF"
            emissiveIntensity={0.35}
            roughness={0.3}
          />
        </mesh>

        {/* Tier 2 Mid Tower (24m x 24m, Y = 52m to 92m, Height 40m) */}
        <mesh position={[0, 72, 0]} castShadow receiveShadow>
          <boxGeometry args={[24, 40, 24]} />
          <meshStandardMaterial color="#1a1d26" roughness={0.5} metalness={0.6} />
        </mesh>
        {/* Tier 2 Window Accent Matrix Panels */}
        <mesh position={[0, 72, 12.1]}>
          <planeGeometry args={[18, 34]} />
          <meshStandardMaterial
            color="#111319"
            emissive="#E5E1DF"
            emissiveIntensity={0.4}
            roughness={0.3}
          />
        </mesh>

        {/* Tier 3 Upper Crown (16m x 16m, Y = 92m to 122m, Height 30m) */}
        <mesh position={[0, 107, 0]} castShadow>
          <boxGeometry args={[16, 30, 16]} />
          <meshStandardMaterial color="#252831" roughness={0.4} metalness={0.7} />
        </mesh>

        {/* Vertical Central Red Laser Conduit Core running up the Citadel */}
        <mesh position={[0, 68, 12.15]}>
          <boxGeometry args={[0.8, 110, 0.2]} />
          <meshStandardMaterial
            color="#D62E42"
            emissive="#D62E42"
            emissiveIntensity={3.5}
            toneMapped={false}
          />
        </mesh>

        {/* Citadel Apex Pinnacle Spire (Y = 122m to 142m, Height 20m) */}
        <mesh position={[0, 132, 0]} castShadow>
          <cylinderGeometry args={[0.3, 2.5, 20, 16]} />
          <meshStandardMaterial color="#E5E1DF" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Orbiting Holographic Data Rings at Apex (Y = 130m) */}
        <group ref={citadelRingsRef} position={[0, 130, 0]}>
          <mesh rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[8.5, 0.12, 16, 48]} />
            <meshStandardMaterial
              color="#D62E42"
              emissive="#D62E42"
              emissiveIntensity={3.5}
              toneMapped={false}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 3, Math.PI / 4, 0]}>
            <torusGeometry args={[11.0, 0.08, 16, 48]} />
            <meshStandardMaterial
              color="#9D071A"
              emissive="#9D071A"
              emissiveIntensity={3.0}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* Apex Super-Beacon (High-intensity signal light) */}
        <mesh position={[0, 142.2, 0]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial
            color="#D62E42"
            emissive="#D62E42"
            emissiveIntensity={5.0}
            toneMapped={false}
          />
        </mesh>
        <pointLight position={[0, 143, 0]} color="#D62E42" intensity={6.0} distance={160} />
      </group>

      {/* ==================================================================== */}
      {/* 3. DENSE LAYERED SKYSCRAPER FOREST (26 UNIQUE TOWERS)                */}
      {/* Varied architectural typologies: stepped, slab, chamfered, and spire */}
      {/* ==================================================================== */}
      <group name="Skyscraper-Forest">
        {skyscrapers.map((tower, idx) => {
          const halfH = tower.height / 2;
          return (
            <group key={`tower-${idx}`} position={[tower.x, 0, tower.z]}>
              {/* Main Tower Body Monolith */}
              <mesh position={[0, halfH, 0]} castShadow receiveShadow>
                <boxGeometry args={[tower.width, tower.height, tower.depth]} />
                <meshStandardMaterial color="#252831" roughness={0.7} metalness={0.4} />
              </mesh>

              {/* Glowing High-Rise Window Matrix Face (Front) */}
              <mesh position={[0, halfH, tower.depth / 2 + 0.05]}>
                <planeGeometry args={[tower.width * 0.85, tower.height * 0.88]} />
                <meshStandardMaterial
                  color="#111319"
                  emissive="#E5E1DF"
                  emissiveIntensity={0.25 + ((idx * 7) % 5) * 0.08}
                  roughness={0.3}
                />
              </mesh>

              {/* Stepped Crown / Architectural Feature */}
              {tower.type === "stepped" && (
                <mesh position={[0, tower.height + 4, 0]} castShadow>
                  <boxGeometry args={[tower.width * 0.65, 8, tower.depth * 0.65]} />
                  <meshStandardMaterial color="#111319" roughness={0.6} metalness={0.5} />
                </mesh>
              )}

              {/* Rooftop Spire Mast */}
              {tower.type === "spire" && (
                <mesh position={[0, tower.height + 8, 0]} castShadow>
                  <cylinderGeometry args={[0.15, 0.8, 16, 8]} />
                  <meshStandardMaterial color="#E5E1DF" metalness={0.9} roughness={0.2} />
                </mesh>
              )}

              {/* Rooftop Red Trim Neon Edge */}
              <mesh position={[0, tower.height + 0.05, 0]}>
                <boxGeometry args={[tower.width + 0.1, 0.1, tower.depth + 0.1]} />
                <meshStandardMaterial
                  color="#9D071A"
                  emissive="#9D071A"
                  emissiveIntensity={2.0}
                  toneMapped={false}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* ==================================================================== */}
      {/* 4. ROOFTOP AVIATION WARNING BEACONS                                  */}
      {/* Synchronized signal red flashing points on every skyscraper crown    */}
      {/* ==================================================================== */}
      <group ref={aviationBeaconsRef} name="Aviation-Warning-Beacons">
        {skyscrapers.map((tower, idx) => {
          const beaconY =
            tower.type === "spire"
              ? tower.height + 16.2
              : tower.type === "stepped"
              ? tower.height + 8.2
              : tower.height + 0.8;

          return (
            <mesh key={`beacon-${idx}`} position={[tower.x, beaconY, tower.z]}>
              <sphereGeometry args={[0.4, 8, 8]} />
              <meshStandardMaterial
                color="#D62E42"
                emissive="#D62E42"
                emissiveIntensity={3.5}
                toneMapped={false}
              />
            </mesh>
          );
        })}
      </group>

      {/* ==================================================================== */}
      {/* 5. ELEVATED HYPERLOOP / SKY-METRO TRANSIT VIADUCT                    */}
      {/* High-level skybridge track threading across the cityscape at Y = 24m */}
      {/* ==================================================================== */}
      <group position={[0, 24, -100]} name="Hyperloop-Viaduct">
        {/* Continuous Track Beam (Spanning 240m across X axis) */}
        <mesh receiveShadow>
          <boxGeometry args={[260, 1.4, 3.8]} />
          <meshStandardMaterial color="#111319" roughness={0.7} metalness={0.6} />
        </mesh>

        {/* Twin Magnetic Rails */}
        <mesh position={[0, 0.85, -1.0]}>
          <boxGeometry args={[260, 0.2, 0.3]} />
          <meshStandardMaterial color="#E5E1DF" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.85, 1.0]}>
          <boxGeometry args={[260, 0.2, 0.3]} />
          <meshStandardMaterial color="#E5E1DF" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Continuous Red Glowing Under-Rail Power Channel */}
        <mesh position={[0, -0.65, 0]}>
          <boxGeometry args={[260, 0.1, 0.4]} />
          <meshStandardMaterial
            color="#D62E42"
            emissive="#D62E42"
            emissiveIntensity={3.0}
            toneMapped={false}
          />
        </mesh>

        {/* Massive Elevated Support Piers (Pylons grounded into city) */}
        {[-100, -50, 0, 50, 100].map((px, idx) => (
          <mesh key={`viaduct-pier-${idx}`} position={[px, -12, 0]} castShadow>
            <cylinderGeometry args={[1.6, 2.2, 24, 12]} />
            <meshStandardMaterial color="#252831" roughness={0.8} />
          </mesh>
        ))}

        {/* Dynamic High-Speed Maglev Sky-Train Car */}
        <group ref={maglevTrainRef} position={[0, 1.5, 0]} name="Maglev-Train">
          {/* Streamlined Train Fuselage */}
          <mesh castShadow>
            <boxGeometry args={[16.0, 1.8, 2.8]} />
            <meshStandardMaterial color="#252831" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Glowing Red Lateral Headlight Strips */}
          <mesh position={[8.02, 0, 0]}>
            <boxGeometry args={[0.06, 0.4, 2.4]} />
            <meshStandardMaterial
              color="#D62E42"
              emissive="#D62E42"
              emissiveIntensity={4.5}
              toneMapped={false}
            />
          </mesh>
          {/* Train Cabin Window Strip */}
          <mesh position={[0, 0.2, 1.42]}>
            <planeGeometry args={[14.0, 0.6]} />
            <meshStandardMaterial
              color="#111319"
              emissive="#D62E42"
              emissiveIntensity={2.0}
            />
          </mesh>
        </group>
      </group>

      {/* ==================================================================== */}
      {/* 6. INTER-TOWER TELECOMMUNICATIONS LASER MATRIX                       */}
      {/* Red laser data beams linking skyscraper communication dishes        */}
      {/* ==================================================================== */}
      <group ref={laserBeamsRef} name="Laser-Communication-Grid">
        {/* Beam 1: Left tower to Citadel */}
        <mesh position={[-38, 95, -155]} rotation={[0, 0.2, 0.35]}>
          <cylinderGeometry args={[0.04, 0.04, 82, 8]} />
          <meshStandardMaterial
            color="#D62E42"
            emissive="#D62E42"
            emissiveIntensity={3.5}
            transparent
            opacity={0.8}
            toneMapped={false}
          />
        </mesh>

        {/* Beam 2: Right tower to Citadel */}
        <mesh position={[40, 92, -155]} rotation={[0, -0.25, -0.38]}>
          <cylinderGeometry args={[0.04, 0.04, 86, 8]} />
          <meshStandardMaterial
            color="#D62E42"
            emissive="#D62E42"
            emissiveIntensity={3.5}
            transparent
            opacity={0.8}
            toneMapped={false}
          />
        </mesh>

        {/* Beam 3: Midground cross-link */}
        <mesh position={[0, 78, -135]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 90, 8]} />
          <meshStandardMaterial
            color="#9D071A"
            emissive="#9D071A"
            emissiveIntensity={3.0}
            transparent
            opacity={0.7}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

export default Skyline;
