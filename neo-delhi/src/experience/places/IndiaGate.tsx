"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeElements } from "@react-three/fiber";

/**
 * IndiaGate Props
 * Supports standard Three.js group props plus scroll progress and active state.
 */
export type IndiaGateProps = ThreeElements["group"] & {
  /** Scroll progress through journey (India Gate chapter: 0.00 - 0.10) */
  progress?: number;
  /** Whether this chapter is active */
  active?: boolean;
};

/**
 * India Gate (Greybox Architecture)
 * Real-world scale war memorial monument transformed into the Neo-Delhi Cyber Citadel Gateway.
 * Real dimensions: ~42m height, ~21m width, ~10m depth.
 * Central archway: ~9m clear span, ~13.5m height to spring line.
 *
 * Design Tokens:
 * - obsidian: #08090D (plaza base / darkest shadows)
 * - surface: #111319 (secondary podium slabs)
 * - gunmetal: #252831 (brutalist structural pylons & attic)
 * - crimson: #9D071A (atmospheric ambient glow & uplights)
 * - signal: #D62E42 (neon conduits, Amar Jawan eternal cyber-flame, laser trims)
 * - silver: #E5E1DF (structural highlights & inscription plates)
 * - muted: #99949A (metal grating & reinforcement ties)
 */
export function IndiaGate({
  progress = 0,
  active = true,
  ...groupProps
}: IndiaGateProps) {
  // Animation refs for pulsing cybernetic elements
  const flameLightRef = useRef<THREE.PointLight>(null);
  const flameMeshRef = useRef<THREE.Mesh>(null);
  const innerRingsRef = useRef<THREE.Group>(null);
  const beaconGroupRef = useRef<THREE.Group>(null);

  // Animate the Amar Jawan Jyoti eternal cyber-flame and atmospheric security beacons
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    // Pulsing eternal cyber-flame under the central arch
    if (flameLightRef.current) {
      const flicker = Math.sin(time * 5.0) * 0.15 + Math.cos(time * 11.0) * 0.1;
      flameLightRef.current.intensity = 3.5 + flicker;
    }

    if (flameMeshRef.current) {
      const scaleY = 1.0 + Math.sin(time * 8.0) * 0.18;
      flameMeshRef.current.scale.set(1.0, scaleY, 1.0);
      flameMeshRef.current.rotation.y = time * 0.8;
    }

    // Rotating holographic containment rings above the cenotaph
    if (innerRingsRef.current) {
      innerRingsRef.current.rotation.y = time * 0.5;
      innerRingsRef.current.rotation.z = Math.sin(time * 0.7) * 0.1;
    }

    // Subtle beacon flash on the corner observation nodes
    if (beaconGroupRef.current) {
      const pulse = (Math.sin(time * 3.0) + 1) * 0.5;
      beaconGroupRef.current.children.forEach((child) => {
        if ((child as THREE.Mesh).material) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (mat.emissiveIntensity !== undefined) {
            mat.emissiveIntensity = 1.5 + pulse * 1.5;
          }
        }
      });
    }
  });

  return (
    <group {...groupProps} name="IndiaGate-Chapter">
      {/* ==================================================================== */}
      {/* 1. CEREMONIAL PLAZA & STEPPED PODIUM                                  */}
      {/* Real-world scale stepped plinth lifting the monument above plaza level */}
      {/* ==================================================================== */}
      <group name="Plaza-Podium">
        {/* Tier 1 - Bottom plaza apron (38m x 28m x 0.8m) */}
        <mesh position={[0, 0.4, 0]} receiveShadow>
          <boxGeometry args={[38, 0.8, 28]} />
          <meshStandardMaterial color="#08090D" roughness={0.9} metalness={0.2} />
        </mesh>

        {/* Tier 2 - Mid stepped terrace (32m x 22m x 0.8m) */}
        <mesh position={[0, 1.2, 0]} receiveShadow>
          <boxGeometry args={[32, 0.8, 22]} />
          <meshStandardMaterial color="#111319" roughness={0.85} metalness={0.25} />
        </mesh>

        {/* Tier 3 - Upper monument platform (26m x 16m x 0.8m) */}
        <mesh position={[0, 2.0, 0]} receiveShadow>
          <boxGeometry args={[26, 0.8, 16]} />
          <meshStandardMaterial color="#252831" roughness={0.8} metalness={0.3} />
        </mesh>

        {/* Perimeter Red Laser Trim along Tier 3 edge */}
        <mesh position={[0, 2.42, 8.01]}>
          <boxGeometry args={[26.05, 0.06, 0.06]} />
          <meshStandardMaterial
            color="#D62E42"
            emissive="#D62E42"
            emissiveIntensity={2.5}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, 2.42, -8.01]}>
          <boxGeometry args={[26.05, 0.06, 0.06]} />
          <meshStandardMaterial
            color="#D62E42"
            emissive="#D62E42"
            emissiveIntensity={2.5}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[13.01, 2.42, 0]}>
          <boxGeometry args={[0.06, 0.06, 16.05]} />
          <meshStandardMaterial
            color="#D62E42"
            emissive="#D62E42"
            emissiveIntensity={2.5}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[-13.01, 2.42, 0]}>
          <boxGeometry args={[0.06, 0.06, 16.05]} />
          <meshStandardMaterial
            color="#D62E42"
            emissive="#D62E42"
            emissiveIntensity={2.5}
            toneMapped={false}
          />
        </mesh>

        {/* Perimeter Cyber Bollards with Red Beacon Diodes */}
        {[-16, -11, -5, 5, 11, 16].map((x, i) => (
          <React.Fragment key={`bollard-z-${i}`}>
            {/* Front bollard row */}
            <mesh position={[x, 1.9, 12]} castShadow>
              <cylinderGeometry args={[0.2, 0.25, 1.2, 8]} />
              <meshStandardMaterial color="#252831" roughness={0.6} metalness={0.5} />
            </mesh>
            <mesh position={[x, 2.55, 12]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial
                color="#D62E42"
                emissive="#D62E42"
                emissiveIntensity={2.0}
                toneMapped={false}
              />
            </mesh>
            {/* Rear bollard row */}
            <mesh position={[x, 1.9, -12]} castShadow>
              <cylinderGeometry args={[0.2, 0.25, 1.2, 8]} />
              <meshStandardMaterial color="#252831" roughness={0.6} metalness={0.5} />
            </mesh>
            <mesh position={[x, 2.55, -12]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial
                color="#D62E42"
                emissive="#D62E42"
                emissiveIntensity={2.0}
                toneMapped={false}
              />
            </mesh>
          </React.Fragment>
        ))}
      </group>

      {/* ==================================================================== */}
      {/* 2. TWIN MONUMENTAL PYLONS (PILLARS)                                  */}
      {/* Left and right massive structural piers forming the central arch     */}
      {/* Real scale: each pylon is ~6.2m wide, ~10m deep, ~18.5m high         */}
      {/* ==================================================================== */}
      <group name="Monument-Pylons">
        {/* LEFT PYLON (West Face, X = -7.7m) */}
        <group position={[-7.7, 11.65, 0]}>
          {/* Main lower pylon block */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[6.2, 18.5, 10.2]} />
            <meshStandardMaterial color="#252831" roughness={0.75} metalness={0.3} />
          </mesh>
          {/* Front vertical cyber-channel recess */}
          <mesh position={[0, 0, 5.12]}>
            <boxGeometry args={[1.2, 16.0, 0.1]} />
            <meshStandardMaterial color="#111319" roughness={0.9} />
          </mesh>
          {/* Vertical Signal Neon Conduit inside recess */}
          <mesh position={[0, 0, 5.18]}>
            <boxGeometry args={[0.12, 15.0, 0.05]} />
            <meshStandardMaterial
              color="#D62E42"
              emissive="#D62E42"
              emissiveIntensity={3.0}
              toneMapped={false}
            />
          </mesh>
          {/* Rear vertical cyber-channel recess & neon strip */}
          <mesh position={[0, 0, -5.12]}>
            <boxGeometry args={[1.2, 16.0, 0.1]} />
            <meshStandardMaterial color="#111319" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0, -5.18]}>
            <boxGeometry args={[0.12, 15.0, 0.05]} />
            <meshStandardMaterial
              color="#D62E42"
              emissive="#D62E42"
              emissiveIntensity={3.0}
              toneMapped={false}
            />
          </mesh>
          {/* Transverse Side Arch Cutout (Side portal typical of India Gate) */}
          <mesh position={[-0.5, -4.5, 0]}>
            <boxGeometry args={[5.3, 7.5, 3.8]} />
            <meshStandardMaterial color="#111319" roughness={0.9} />
          </mesh>
        </group>

        {/* RIGHT PYLON (East Face, X = +7.7m) */}
        <group position={[7.7, 11.65, 0]}>
          {/* Main lower pylon block */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[6.2, 18.5, 10.2]} />
            <meshStandardMaterial color="#252831" roughness={0.75} metalness={0.3} />
          </mesh>
          {/* Front vertical cyber-channel recess */}
          <mesh position={[0, 0, 5.12]}>
            <boxGeometry args={[1.2, 16.0, 0.1]} />
            <meshStandardMaterial color="#111319" roughness={0.9} />
          </mesh>
          {/* Vertical Signal Neon Conduit inside recess */}
          <mesh position={[0, 0, 5.18]}>
            <boxGeometry args={[0.12, 15.0, 0.05]} />
            <meshStandardMaterial
              color="#D62E42"
              emissive="#D62E42"
              emissiveIntensity={3.0}
              toneMapped={false}
            />
          </mesh>
          {/* Rear vertical cyber-channel recess & neon strip */}
          <mesh position={[0, 0, -5.12]}>
            <boxGeometry args={[1.2, 16.0, 0.1]} />
            <meshStandardMaterial color="#111319" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0, -5.18]}>
            <boxGeometry args={[0.12, 15.0, 0.05]} />
            <meshStandardMaterial
              color="#D62E42"
              emissive="#D62E42"
              emissiveIntensity={3.0}
              toneMapped={false}
            />
          </mesh>
          {/* Transverse Side Arch Cutout */}
          <mesh position={[0.5, -4.5, 0]}>
            <boxGeometry args={[5.3, 7.5, 3.8]} />
            <meshStandardMaterial color="#111319" roughness={0.9} />
          </mesh>
        </group>
      </group>

      {/* ==================================================================== */}
      {/* 3. CENTRAL ARCHWAY & VAULTED SPRINGLINE                              */}
      {/* Clear span: 9.2m wide, apex at ~16.5m height                         */}
      {/* ==================================================================== */}
      <group name="Central-Archway">
        {/* Arch Intrados Barrel Ceiling (half cylinder at top of vault) */}
        <mesh position={[0, 15.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[4.6, 4.6, 10.2, 24, 1, false, 0, Math.PI]} />
          <meshStandardMaterial
            color="#1a1d26"
            roughness={0.7}
            metalness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Arch Impost Springline Moldings (horizontal ledges at Y = 13.5m) */}
        <mesh position={[-4.5, 13.5, 0]}>
          <boxGeometry args={[0.6, 0.4, 10.3]} />
          <meshStandardMaterial color="#E5E1DF" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[4.5, 13.5, 0]}>
          <boxGeometry args={[0.6, 0.4, 10.3]} />
          <meshStandardMaterial color="#E5E1DF" metalness={0.5} roughness={0.3} />
        </mesh>

        {/* Arch Ring Facade Bezel (Front Face neon accent arc) */}
        <mesh position={[0, 15.5, 5.15]}>
          <ringGeometry args={[4.55, 4.75, 32, 1, 0, Math.PI]} />
          <meshStandardMaterial
            color="#D62E42"
            emissive="#D62E42"
            emissiveIntensity={3.5}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
        {/* Arch Ring Facade Bezel (Rear Face neon accent arc) */}
        <mesh position={[0, 15.5, -5.15]}>
          <ringGeometry args={[4.55, 4.75, 32, 1, 0, Math.PI]} />
          <meshStandardMaterial
            color="#D62E42"
            emissive="#D62E42"
            emissiveIntensity={3.5}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* ==================================================================== */}
      {/* 4. ENTABLATURE & UPPER STEPPED ATTIC                                 */}
      {/* Rises above the arch to ~42m total height                             */}
      {/* ==================================================================== */}
      <group name="Attic-And-Finial">
        {/* Main Arch Spandrel & Arch Header Block (Y = 18m to 21.5m) */}
        <mesh position={[0, 19.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[21.6, 3.5, 10.2]} />
          <meshStandardMaterial color="#252831" roughness={0.75} metalness={0.3} />
        </mesh>

        {/* Primary Cornice Projecting Band (Y = 21.5m) */}
        <mesh position={[0, 21.5, 0]} castShadow>
          <boxGeometry args={[22.4, 0.6, 10.8]} />
          <meshStandardMaterial color="#111319" roughness={0.6} metalness={0.4} />
        </mesh>
        {/* Cornice Lower Glow Strip */}
        <mesh position={[0, 21.2, 5.42]}>
          <boxGeometry args={[22.4, 0.08, 0.06]} />
          <meshStandardMaterial
            color="#9D071A"
            emissive="#9D071A"
            emissiveIntensity={2.5}
            toneMapped={false}
          />
        </mesh>

        {/* Main Attic Inscription Tier (Y = 22m to 31m, 9m height) */}
        <mesh position={[0, 26.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[19.8, 9.4, 9.4]} />
          <meshStandardMaterial color="#252831" roughness={0.8} metalness={0.25} />
        </mesh>

        {/* Holographic Inscription Plate / Telemetry Display (Front) */}
        <mesh position={[0, 26.5, 4.72]}>
          <planeGeometry args={[16.0, 5.0]} />
          <meshStandardMaterial
            color="#111319"
            emissive="#9D071A"
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        {/* Holographic Inscription Plate (Rear) */}
        <mesh position={[0, 26.5, -4.72]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[16.0, 5.0]} />
          <meshStandardMaterial
            color="#111319"
            emissive="#9D071A"
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Upper Attic Stepped Cornice (Y = 31.5m to 38.5m) */}
        {/* Stepped Level 1 */}
        <mesh position={[0, 32.0, 0]} castShadow>
          <boxGeometry args={[18.4, 1.2, 8.6]} />
          <meshStandardMaterial color="#1a1d26" roughness={0.7} metalness={0.3} />
        </mesh>
        {/* Stepped Level 2 */}
        <mesh position={[0, 33.4, 0]} castShadow>
          <boxGeometry args={[16.8, 1.4, 7.8]} />
          <meshStandardMaterial color="#252831" roughness={0.7} metalness={0.3} />
        </mesh>
        {/* Stepped Level 3 */}
        <mesh position={[0, 35.0, 0]} castShadow>
          <boxGeometry args={[14.8, 1.6, 6.8]} />
          <meshStandardMaterial color="#1a1d26" roughness={0.7} metalness={0.3} />
        </mesh>
        {/* Stepped Level 4 (Top Pavilion Base) */}
        <mesh position={[0, 36.8, 0]} castShadow>
          <boxGeometry args={[12.6, 1.8, 5.8]} />
          <meshStandardMaterial color="#252831" roughness={0.7} metalness={0.3} />
        </mesh>

        {/* Top Attic Glowing Red Perimeter Accent Lines */}
        <mesh position={[0, 37.72, 2.92]}>
          <boxGeometry args={[12.65, 0.08, 0.05]} />
          <meshStandardMaterial
            color="#D62E42"
            emissive="#D62E42"
            emissiveIntensity={3.0}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, 37.72, -2.92]}>
          <boxGeometry args={[12.65, 0.08, 0.05]} />
          <meshStandardMaterial
            color="#D62E42"
            emissive="#D62E42"
            emissiveIntensity={3.0}
            toneMapped={false}
          />
        </mesh>

        {/* Finial / Apex Saucer Bowl Dome (Real India Gate dome structure at ~42m) */}
        <group position={[0, 38.5, 0]}>
          {/* Cylindrical dome base plinth */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[3.8, 4.2, 0.8, 24]} />
            <meshStandardMaterial color="#111319" roughness={0.5} metalness={0.5} />
          </mesh>
          {/* Shallow hemispherical bowl / cyber saucer */}
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[2.5, 3.8, 0.9, 24]} />
            <meshStandardMaterial color="#252831" roughness={0.6} metalness={0.4} />
          </mesh>
          {/* Cybernetic LIDAR / Communications Beacon Core */}
          <mesh position={[0, 2.1, 0]}>
            <cylinderGeometry args={[0.6, 0.8, 1.0, 16]} />
            <meshStandardMaterial
              color="#D62E42"
              emissive="#D62E42"
              emissiveIntensity={3.5}
              toneMapped={false}
            />
          </mesh>
          {/* Top warning point light */}
          <pointLight position={[0, 3.0, 0]} color="#D62E42" intensity={2.0} distance={40} />
        </group>
      </group>

      {/* ==================================================================== */}
      {/* 5. AMAR JAWAN JYOTI (MEMORIAL ETERNAL CYBER-FLAME)                   */}
      {/* Centered under the arch vault at X=0, Z=0                            */}
      {/* ==================================================================== */}
      <group position={[0, 2.4, 0]} name="Amar-Jawan-Jyoti">
        {/* Black Marble Cenotaph Plinth (3.2m x 3.2m x 1.4m) */}
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 1.4, 3.2]} />
          <meshStandardMaterial color="#08090D" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Cenotaph Polished Top Deck */}
        <mesh position={[0, 1.42, 0]}>
          <boxGeometry args={[3.0, 0.05, 3.0]} />
          <meshStandardMaterial color="#111319" roughness={0.15} metalness={0.9} />
        </mesh>

        {/* Four Corner Urns / Braziers with Crimson Cores */}
        {[
          [-1.2, 1.2],
          [1.2, 1.2],
          [-1.2, -1.2],
          [1.2, -1.2],
        ].map(([cx, cz], idx) => (
          <group key={`urn-${idx}`} position={[cx, 1.55, cz]}>
            <mesh>
              <cylinderGeometry args={[0.22, 0.16, 0.35, 12]} />
              <meshStandardMaterial color="#252831" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.22, 0]}>
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshStandardMaterial
                color="#D62E42"
                emissive="#D62E42"
                emissiveIntensity={3.0}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}

        {/* Central Inverted Cyber-Rifle & Sensor Node Pedestal */}
        <mesh position={[0, 2.0, 0]}>
          <cylinderGeometry args={[0.12, 0.18, 1.1, 8]} />
          <meshStandardMaterial color="#E5E1DF" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* The Eternal Flame (Pulsing Diamond Crystal Prism) */}
        <mesh ref={flameMeshRef} position={[0, 2.9, 0]}>
          <octahedronGeometry args={[0.45, 0]} />
          <meshStandardMaterial
            color="#D62E42"
            emissive="#D62E42"
            emissiveIntensity={4.0}
            toneMapped={false}
            wireframe={false}
          />
        </mesh>

        {/* Outer Holographic Containment Rings */}
        <group ref={innerRingsRef} position={[0, 2.9, 0]}>
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[0.85, 0.02, 16, 32]} />
            <meshStandardMaterial
              color="#9D071A"
              emissive="#9D071A"
              emissiveIntensity={2.5}
              toneMapped={false}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 4, 0, Math.PI / 4]}>
            <torusGeometry args={[1.05, 0.02, 16, 32]} />
            <meshStandardMaterial
              color="#D62E42"
              emissive="#D62E42"
              emissiveIntensity={2.0}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* Dynamic Point Light from Eternal Flame Illuminating the Vault */}
        <pointLight
          ref={flameLightRef}
          position={[0, 3.2, 0]}
          color="#D62E42"
          intensity={4.0}
          distance={28}
          decay={2}
          castShadow
        />
      </group>

      {/* ==================================================================== */}
      {/* 6. CORNER SECURITY OBSERVATION DRONES / SENSOR NODES                */}
      {/* Mounted on four outer corners of the monument attic                   */}
      {/* ==================================================================== */}
      <group ref={beaconGroupRef} name="Attic-Observation-Beacons">
        {[
          [-9.8, 31.8, 4.6],
          [9.8, 31.8, 4.6],
          [-9.8, 31.8, -4.6],
          [9.8, 31.8, -4.6],
        ].map(([bx, by, bz], bIdx) => (
          <group key={`attic-node-${bIdx}`} position={[bx, by, bz]}>
            <mesh>
              <boxGeometry args={[0.8, 0.6, 0.8]} />
              <meshStandardMaterial color="#111319" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.45, 0]}>
              <sphereGeometry args={[0.18, 12, 12]} />
              <meshStandardMaterial
                color="#D62E42"
                emissive="#D62E42"
                emissiveIntensity={2.5}
                toneMapped={false}
              />
            </mesh>
            <pointLight position={[0, 0.6, 0]} color="#9D071A" intensity={1.5} distance={12} />
          </group>
        ))}
      </group>

      {/* ==================================================================== */}
      {/* 7. ARCHITECTURAL RED UPLIGHTS & MOOD LIGHTING                        */}
      {/* ==================================================================== */}
      <group name="Plaza-Uplights">
        {/* Left pylon front uplight */}
        <spotLight
          position={[-7.5, 2.5, 7.5]}
          target-position={[-7.5, 18, 0]}
          color="#9D071A"
          intensity={3.0}
          distance={35}
          angle={0.6}
          penumbra={0.8}
        />
        {/* Right pylon front uplight */}
        <spotLight
          position={[7.5, 2.5, 7.5]}
          target-position={[7.5, 18, 0]}
          color="#9D071A"
          intensity={3.0}
          distance={35}
          angle={0.6}
          penumbra={0.8}
        />
        {/* Left pylon rear uplight */}
        <spotLight
          position={[-7.5, 2.5, -7.5]}
          target-position={[-7.5, 18, 0]}
          color="#9D071A"
          intensity={3.0}
          distance={35}
          angle={0.6}
          penumbra={0.8}
        />
        {/* Right pylon rear uplight */}
        <spotLight
          position={[7.5, 2.5, -7.5]}
          target-position={[7.5, 18, 0]}
          color="#9D071A"
          intensity={3.0}
          distance={35}
          angle={0.6}
          penumbra={0.8}
        />
      </group>
    </group>
  );
}

export default IndiaGate;
