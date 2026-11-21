"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame, type ThreeElements } from "@react-three/fiber";

/**
 * CentralSecretariat Props
 * Supports standard Three.js group props plus scroll progress and active state.
 */
export type CentralSecretariatProps = ThreeElements["group"] & {
  /** Scroll progress through journey (Central Secretariat chapter: 0.28 - 0.45) */
  progress?: number;
  /** Whether this chapter is active */
  active?: boolean;
};

/**
 * Central Secretariat Metro Station (Greybox Architecture)
 * Subterranean interchange bunker on the Delhi Metro Yellow Line network.
 * Real dimensions: ~24m width, ~8.5m cavern height, ~52m length (Z: -26m to +26m).
 * Features upper concourse mezzanine with AFC smart turnstiles, escalators, platform screen gates,
 * track pit with third-rail power conduit, and brutalist ribbed concrete ceiling.
 *
 * Design Tokens:
 * - obsidian: #08090D (track trenches, cavern shadows)
 * - surface: #111319 (platform deck pavers, escalator chassis)
 * - gunmetal: #252831 (ribbed ceiling beams, structural columns, steel rails)
 * - crimson: #9D071A (third-rail glow, mood lighting, tactile borders)
 * - signal: #D62E42 (AFC gate barriers, PIDS displays, platform edge warning neon)
 * - silver: #E5E1DF (brushed stainless handrails, overhead signboards)
 * - muted: #99949A (cable ladders, utility conduit runs)
 */
export function CentralSecretariat({
  progress = 0.35,
  active = true,
  ...groupProps
}: CentralSecretariatProps) {
  // Animation refs for flickering telemetry and escalator indicator lights
  const pidsLightRef = useRef<THREE.PointLight>(null);
  const pidsScreenRef = useRef<THREE.Mesh>(null);
  const afcLightsRef = useRef<THREE.Group>(null);
  const thirdRailRef = useRef<THREE.Mesh>(null);

  // Ribbed ceiling beam positions (spaced every 6m)
  const ceilingRibs = useMemo(() => [-24, -18, -12, -6, 0, 6, 12, 18, 24], []);

  // Support column positions (2 rows of 4 columns along the platform)
  const columnPositions = useMemo(() => {
    const cols: [number, number][] = [];
    [-18, -6, 6, 18].forEach((z) => {
      cols.push([-3.8, z]);
      cols.push([3.8, z]);
    });
    return cols;
  }, []);

  // Track sleeper positions (spaced every 1.8m along 50m track)
  const trackSleepers = useMemo(() => {
    const sleepers: number[] = [];
    for (let z = -25; z <= 25; z += 1.8) {
      sleepers.push(z);
    }
    return sleepers;
  }, []);

  // Frame animation for dynamic subway ambience
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    // Flickering PIDS departure board display
    if (pidsScreenRef.current) {
      const mat = pidsScreenRef.current.material as THREE.MeshStandardMaterial;
      if (mat.emissiveIntensity !== undefined) {
        mat.emissiveIntensity = 1.8 + Math.sin(time * 6.0) * 0.3 + (Math.random() > 0.96 ? -0.4 : 0);
      }
    }

    // Dynamic third-rail high voltage pulse
    if (thirdRailRef.current) {
      const mat = thirdRailRef.current.material as THREE.MeshStandardMaterial;
      if (mat.emissiveIntensity !== undefined) {
        mat.emissiveIntensity = 2.2 + Math.sin(time * 4.0) * 0.4;
      }
    }

    // AFC gate scanner pulse
    if (afcLightsRef.current) {
      const pulse = (Math.sin(time * 5.0) + 1) * 0.5;
      afcLightsRef.current.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = 2.0 + pulse * 1.5;
        }
      });
    }
  });

  return (
    <group {...groupProps} name="CentralSecretariat-Chapter">
      {/* ==================================================================== */}
      {/* 1. SUBTERRANEAN CAVERN SHELL & RIBBED CONCRETE CEILING               */}
      {/* 24m wide x 8.5m high cavern enclosure                                */}
      {/* ==================================================================== */}
      <group name="Cavern-Shell">
        {/* Cavern Roof Slab (Y = 8.5m) */}
        <mesh position={[0, 8.5, 0]}>
          <boxGeometry args={[26, 0.6, 54]} />
          <meshStandardMaterial color="#08090D" roughness={0.9} />
        </mesh>

        {/* Outer Cavern Concrete Side Walls (Left X = -12.5m, Right X = +12.5m) */}
        <mesh position={[-12.5, 4, 0]}>
          <boxGeometry args={[0.8, 9, 54]} />
          <meshStandardMaterial color="#111319" roughness={0.85} metalness={0.2} />
        </mesh>
        <mesh position={[12.5, 4, 0]}>
          <boxGeometry args={[0.8, 9, 54]} />
          <meshStandardMaterial color="#111319" roughness={0.85} metalness={0.2} />
        </mesh>

        {/* Brutalist Transverse Ceiling Ribs & Industrial Beams */}
        {ceilingRibs.map((z, idx) => (
          <group key={`rib-${idx}`} position={[0, 7.8, z]}>
            {/* Main Rib Beam (24m span across cavern) */}
            <mesh castShadow>
              <boxGeometry args={[24.2, 0.9, 0.8]} />
              <meshStandardMaterial color="#252831" roughness={0.7} metalness={0.4} />
            </mesh>
            {/* Red Linear Neon Strip mounted underside each beam */}
            <mesh position={[0, -0.48, 0]}>
              <boxGeometry args={[22.0, 0.06, 0.08]} />
              <meshStandardMaterial
                color="#D62E42"
                emissive="#D62E42"
                emissiveIntensity={2.5}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}

        {/* Longitudinal Overhead Cable Trays & Power Conduits */}
        {[-7, -2, 2, 7].map((x, cIdx) => (
          <mesh key={`tray-${cIdx}`} position={[x, 7.2, 0]}>
            <boxGeometry args={[0.5, 0.15, 52]} />
            <meshStandardMaterial color="#99949A" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* ==================================================================== */}
      {/* 2. MAIN PASSENGER PLATFORM                                           */}
      {/* Central Island Platform: 12m wide x 52m long at Y = 0.0m             */}
      {/* ==================================================================== */}
      <group name="Passenger-Platform">
        {/* Main Platform Floor Deck */}
        <mesh position={[0, -0.15, 0]} receiveShadow>
          <boxGeometry args={[12.4, 0.3, 52]} />
          <meshStandardMaterial color="#111319" roughness={0.75} metalness={0.3} />
        </mesh>

        {/* Tactile Warning Edge Pavers (Yellow/Red high-visibility border) */}
        {/* West Edge (X = -6.1m) */}
        <mesh position={[-6.1, 0.02, 0]} receiveShadow>
          <boxGeometry args={[0.4, 0.04, 52]} />
          <meshStandardMaterial
            color="#D62E42"
            emissive="#9D071A"
            emissiveIntensity={1.5}
            roughness={0.6}
          />
        </mesh>
        {/* East Edge (X = +6.1m) */}
        <mesh position={[6.1, 0.02, 0]} receiveShadow>
          <boxGeometry args={[0.4, 0.04, 52]} />
          <meshStandardMaterial
            color="#D62E42"
            emissive="#9D071A"
            emissiveIntensity={1.5}
            roughness={0.6}
          />
        </mesh>

        {/* Continuous Neon Edge Warning Glow Strips */}
        <mesh position={[-6.28, 0.04, 0]}>
          <boxGeometry args={[0.04, 0.02, 52]} />
          <meshStandardMaterial
            color="#D62E42"
            emissive="#D62E42"
            emissiveIntensity={3.5}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[6.28, 0.04, 0]}>
          <boxGeometry args={[0.04, 0.02, 52]} />
          <meshStandardMaterial
            color="#D62E42"
            emissive="#D62E42"
            emissiveIntensity={3.5}
            toneMapped={false}
          />
        </mesh>

        {/* Platform Screen Doors (PSD) / Half-Height Safety Gates */}
        {/* West Platform PSD Gates */}
        {[-20, -12, -4, 4, 12, 20].map((pz, idx) => (
          <group key={`psd-w-${idx}`} position={[-6.2, 0.8, pz]}>
            <mesh castShadow>
              <boxGeometry args={[0.12, 1.6, 6.0]} />
              <meshStandardMaterial
                color="#252831"
                metalness={0.7}
                roughness={0.3}
                transparent
                opacity={0.85}
              />
            </mesh>
            {/* Top Red Status LED Bar */}
            <mesh position={[0, 0.82, 0]}>
              <boxGeometry args={[0.14, 0.04, 5.8]} />
              <meshStandardMaterial
                color="#D62E42"
                emissive="#D62E42"
                emissiveIntensity={3.0}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}

        {/* East Platform PSD Gates */}
        {[-20, -12, -4, 4, 12, 20].map((pz, idx) => (
          <group key={`psd-e-${idx}`} position={[6.2, 0.8, pz]}>
            <mesh castShadow>
              <boxGeometry args={[0.12, 1.6, 6.0]} />
              <meshStandardMaterial
                color="#252831"
                metalness={0.7}
                roughness={0.3}
                transparent
                opacity={0.85}
              />
            </mesh>
            {/* Top Red Status LED Bar */}
            <mesh position={[0, 0.82, 0]}>
              <boxGeometry args={[0.14, 0.04, 5.8]} />
              <meshStandardMaterial
                color="#D62E42"
                emissive="#D62E42"
                emissiveIntensity={3.0}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}

        {/* Heavy Concrete Structural Columns with Cyber Interfaces */}
        {columnPositions.map(([cx, cz], cIdx) => (
          <group key={`column-${cIdx}`} position={[cx, 3.6, cz]}>
            {/* Main Column Pillar */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.4, 7.4, 1.4]} />
              <meshStandardMaterial color="#252831" roughness={0.7} metalness={0.3} />
            </mesh>
            {/* Pillar Base Armor Collar */}
            <mesh position={[0, -3.3, 0]}>
              <boxGeometry args={[1.6, 0.8, 1.6]} />
              <meshStandardMaterial color="#111319" roughness={0.6} metalness={0.5} />
            </mesh>
            {/* Embedded Cyber Terminal / Station Info Display Screen */}
            <mesh position={[0, -0.6, 0.72]}>
              <planeGeometry args={[0.8, 1.2]} />
              <meshStandardMaterial
                color="#08090D"
                emissive="#9D071A"
                emissiveIntensity={1.2}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
            {/* Terminal Red Status Light */}
            <mesh position={[0, 0.1, 0.73]}>
              <sphereGeometry args={[0.04, 8, 8]} />
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
      {/* 3. TRACK PITS & THIRD-RAIL TRACTION POWER SYSTEM                     */}
      {/* Sunken track beds at Y = -1.2m on both sides                         */}
      {/* ==================================================================== */}
      <group name="Track-Pits">
        {/* WEST TRACK PIT (X = -9.2m) */}
        <group position={[-9.2, -1.2, 0]}>
          {/* Sunken Track Trench Bed */}
          <mesh position={[0, -0.1, 0]} receiveShadow>
            <boxGeometry args={[4.2, 0.2, 52]} />
            <meshStandardMaterial color="#08090D" roughness={0.95} />
          </mesh>

          {/* Concrete Track Sleepers / Ties */}
          {trackSleepers.map((tz, idx) => (
            <mesh key={`sleeper-w-${idx}`} position={[0, 0.08, tz]}>
              <boxGeometry args={[2.8, 0.16, 0.3]} />
              <meshStandardMaterial color="#252831" roughness={0.8} />
            </mesh>
          ))}

          {/* Steel Rail Bars (Running rails for Yellow Line trains) */}
          <mesh position={[-0.8, 0.22, 0]}>
            <boxGeometry args={[0.1, 0.14, 52]} />
            <meshStandardMaterial color="#E5E1DF" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0.8, 0.22, 0]}>
            <boxGeometry args={[0.1, 0.14, 52]} />
            <meshStandardMaterial color="#E5E1DF" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* High Voltage Third-Rail with Glowing Crimson Protective Shroud */}
          <mesh ref={thirdRailRef} position={[1.7, 0.35, 0]}>
            <boxGeometry args={[0.16, 0.18, 52]} />
            <meshStandardMaterial
              color="#9D071A"
              emissive="#D62E42"
              emissiveIntensity={2.5}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* EAST TRACK PIT (X = +9.2m) */}
        <group position={[9.2, -1.2, 0]}>
          {/* Sunken Track Trench Bed */}
          <mesh position={[0, -0.1, 0]} receiveShadow>
            <boxGeometry args={[4.2, 0.2, 52]} />
            <meshStandardMaterial color="#08090D" roughness={0.95} />
          </mesh>

          {/* Concrete Track Sleepers */}
          {trackSleepers.map((tz, idx) => (
            <mesh key={`sleeper-e-${idx}`} position={[0, 0.08, tz]}>
              <boxGeometry args={[2.8, 0.16, 0.3]} />
              <meshStandardMaterial color="#252831" roughness={0.8} />
            </mesh>
          ))}

          {/* Steel Running Rails */}
          <mesh position={[-0.8, 0.22, 0]}>
            <boxGeometry args={[0.1, 0.14, 52]} />
            <meshStandardMaterial color="#E5E1DF" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0.8, 0.22, 0]}>
            <boxGeometry args={[0.1, 0.14, 52]} />
            <meshStandardMaterial color="#E5E1DF" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Third-Rail Power System */}
          <mesh position={[-1.7, 0.35, 0]}>
            <boxGeometry args={[0.16, 0.18, 52]} />
            <meshStandardMaterial
              color="#9D071A"
              emissive="#D62E42"
              emissiveIntensity={2.5}
              toneMapped={false}
            />
          </mesh>
        </group>
      </group>

      {/* ==================================================================== */}
      {/* 4. UPPER MEZZANINE CONCOURSE & AFC FARE GATES                        */}
      {/* Elevated mezzanine floor at Y = 4.2m with smart security turnstiles  */}
      {/* ==================================================================== */}
      <group position={[0, 4.2, 16]} name="Mezzanine-Concourse">
        {/* Mezzanine Slab (18m wide x 16m deep) */}
        <mesh position={[0, -0.2, 0]} receiveShadow>
          <boxGeometry args={[18, 0.4, 16]} />
          <meshStandardMaterial color="#111319" roughness={0.8} metalness={0.3} />
        </mesh>

        {/* Mezzanine Glass Balustrade & Guardrail overlooking platform */}
        <mesh position={[0, 0.55, -7.9]}>
          <boxGeometry args={[17.8, 1.1, 0.1]} />
          <meshStandardMaterial
            color="#252831"
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={0.6}
          />
        </mesh>
        {/* Balustrade Top Crimson Handrail */}
        <mesh position={[0, 1.12, -7.9]}>
          <boxGeometry args={[17.8, 0.06, 0.12]} />
          <meshStandardMaterial
            color="#D62E42"
            emissive="#D62E42"
            emissiveIntensity={2.5}
            toneMapped={false}
          />
        </mesh>

        {/* Bank of Smart AFC (Automated Fare Collection) Gates */}
        <group position={[0, 0, -2]} name="AFC-Gates">
          {[-5, -3, -1, 1, 3, 5].map((gx, idx) => (
            <group key={`afc-turnstile-${idx}`} position={[gx, 0.5, 0]}>
              {/* Gate Turnstile Pedestal Body */}
              <mesh castShadow>
                <boxGeometry args={[0.28, 1.0, 1.8]} />
                <meshStandardMaterial color="#252831" metalness={0.8} roughness={0.25} />
              </mesh>
              {/* Top Contactless Smart Card Scanner Pad */}
              <mesh position={[0, 0.52, 0.4]}>
                <cylinderGeometry args={[0.1, 0.1, 0.04, 16]} />
                <meshStandardMaterial
                  color="#D62E42"
                  emissive="#D62E42"
                  emissiveIntensity={3.0}
                  toneMapped={false}
                />
              </mesh>
            </group>
          ))}

          {/* Retractable Glowing Crimson Flap Barriers between pedestals */}
          <group ref={afcLightsRef} name="AFC-Flap-Barriers">
            {[-4, -2, 0, 2, 4].map((fx, idx) => (
              <mesh key={`flap-${idx}`} position={[fx, 0.5, 0]}>
                <boxGeometry args={[0.8, 0.4, 0.05]} />
                <meshStandardMaterial
                  color="#D62E42"
                  emissive="#D62E42"
                  emissiveIntensity={2.5}
                  toneMapped={false}
                />
              </mesh>
            ))}
          </group>
        </group>

        {/* Connecting Escalator Truss descending to platform */}
        <group position={[0, -2.1, -12]} rotation={[-0.45, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[3.2, 0.6, 9.5]} />
            <meshStandardMaterial color="#252831" roughness={0.6} metalness={0.5} />
          </mesh>
          {/* Escalator Side Glowing Balustrade */}
          <mesh position={[-1.6, 0.6, 0]}>
            <boxGeometry args={[0.1, 0.8, 9.5]} />
            <meshStandardMaterial
              color="#D62E42"
              emissive="#9D071A"
              emissiveIntensity={1.8}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[1.6, 0.6, 0]}>
            <boxGeometry args={[0.1, 0.8, 9.5]} />
            <meshStandardMaterial
              color="#D62E42"
              emissive="#9D071A"
              emissiveIntensity={1.8}
              toneMapped={false}
            />
          </mesh>
        </group>
      </group>

      {/* ==================================================================== */}
      {/* 5. OVERHEAD DELHI METRO SIGNAGE & PIDS MONITORS                      */}
      {/* ==================================================================== */}
      <group name="Signage-And-PIDS">
        {/* Overhead Central Secretariat Metro Signboard */}
        <group position={[0, 6.2, 0]}>
          {/* Signboard Backing Frame */}
          <mesh castShadow>
            <boxGeometry args={[8.4, 1.2, 0.3]} />
            <meshStandardMaterial color="#08090D" roughness={0.5} metalness={0.7} />
          </mesh>
          {/* Front Yellow/Red Metro Route Indicator Panel */}
          <mesh position={[0, 0, 0.16]}>
            <planeGeometry args={[8.0, 0.9]} />
            <meshStandardMaterial
              color="#111319"
              emissive="#D62E42"
              emissiveIntensity={1.6}
              roughness={0.3}
            />
          </mesh>
          {/* Hanging Steel Suspension Rods */}
          <mesh position={[-3.6, 0.9, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 1.8, 8]} />
            <meshStandardMaterial color="#E5E1DF" metalness={0.9} />
          </mesh>
          <mesh position={[3.6, 0.9, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 1.8, 8]} />
            <meshStandardMaterial color="#E5E1DF" metalness={0.9} />
          </mesh>
        </group>

        {/* Digital PIDS Passenger Information Display (North Facing) */}
        <group position={[0, 5.2, -12]}>
          <mesh castShadow>
            <boxGeometry args={[4.2, 1.0, 0.4]} />
            <meshStandardMaterial color="#111319" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh ref={pidsScreenRef} position={[0, 0, 0.22]}>
            <planeGeometry args={[4.0, 0.8]} />
            <meshStandardMaterial
              color="#08090D"
              emissive="#D62E42"
              emissiveIntensity={2.0}
              toneMapped={false}
            />
          </mesh>
          <pointLight
            ref={pidsLightRef}
            position={[0, -0.5, 1.0]}
            color="#D62E42"
            intensity={1.5}
            distance={10}
          />
        </group>
      </group>
    </group>
  );
}

export default CentralSecretariat;
