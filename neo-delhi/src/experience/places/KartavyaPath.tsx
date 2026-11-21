"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame, type ThreeElements } from "@react-three/fiber";

/**
 * KartavyaPath Props
 * Supports standard Three.js group props plus scroll progress and active state.
 */
export type KartavyaPathProps = ThreeElements["group"] & {
  /** Scroll progress through journey (Kartavya Path chapter: 0.10 - 0.28) */
  progress?: number;
  /** Whether this chapter is active */
  active?: boolean;
};

/**
 * Kartavya Path (Greybox Architecture)
 * Real-world scale ceremonial boulevard transformed into the Neo-Delhi High Security Data Axis.
 * Real dimensions: ~36m total width, ~180m corridor length (Z: 0 to -180m).
 * Flanked by symmetrical cyber-canals, brutalist lamp posts, and security checkpoint gantries.
 *
 * Design Tokens:
 * - obsidian: #08090D (asphalt base & deep cyber-canals)
 * - surface: #111319 (paving slabs, bioswale planters)
 * - gunmetal: #252831 (brutalist lamp pylons, checkpoint trusses)
 * - crimson: #9D071A (curb edge glow, ambient security fields)
 * - signal: #D62E42 (road centerline markers, gantry status monitors, laser sweeps)
 * - silver: #E5E1DF (conduit covers, metallic fittings)
 * - muted: #99949A (structural bracing, drainage grates)
 */
export function KartavyaPath({
  progress = 0.15,
  active = true,
  ...groupProps
}: KartavyaPathProps) {
  // Animation refs
  const scanLineRef1 = useRef<THREE.Mesh>(null);
  const scanLineRef2 = useRef<THREE.Mesh>(null);
  const dataPacketsRef = useRef<THREE.Group>(null);

  // Generate lamp post coordinates along the 180m corridor (spaced every 20m)
  const lampPositions = useMemo(() => {
    const posts: { x: number; z: number; isLeft: boolean }[] = [];
    for (let z = -10; z >= -170; z -= 20) {
      posts.push({ x: -16.5, z, isLeft: true });
      posts.push({ x: 16.5, z, isLeft: false });
    }
    return posts;
  }, []);

  // Generate cyber bollards lining the pedestrian promenades
  const bollardPositions = useMemo(() => {
    const bollards: [number, number][] = [];
    for (let z = -5; z >= -175; z -= 10) {
      bollards.push([-9.2, z]);
      bollards.push([9.2, z]);
    }
    return bollards;
  }, []);

  // Generate lane dash marks
  const laneDashes = useMemo(() => {
    const dashes: number[] = [];
    for (let z = -2; z >= -178; z -= 6) {
      dashes.push(z);
    }
    return dashes;
  }, []);

  // Dynamic animation loop for security laser sweeps and data flow
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    // Oscillating laser scan sheets beneath the two security gantries
    if (scanLineRef1.current) {
      scanLineRef1.current.position.y = 3.5 + Math.sin(time * 3.0) * 2.8;
    }
    if (scanLineRef2.current) {
      scanLineRef2.current.position.y = 3.5 + Math.cos(time * 2.7) * 2.8;
    }

    // Moving data packet indicators along the highway centerline
    if (dataPacketsRef.current) {
      dataPacketsRef.current.children.forEach((child, i) => {
        const offsetZ = ((time * 25 + i * 15) % 180) * -1;
        child.position.z = offsetZ;
      });
    }
  });

  return (
    <group {...groupProps} name="KartavyaPath-Chapter">
      {/* ==================================================================== */}
      {/* 1. MAIN CARRIAGEWAY & ROAD PAVEMENT                                   */}
      {/* 18m wide central cyber-asphalt road spanning 180m in Z                */}
      {/* ==================================================================== */}
      <group name="Carriageway">
        {/* Main dark asphalt roadbed */}
        <mesh position={[0, -0.05, -90]} receiveShadow>
          <boxGeometry args={[18, 0.2, 180]} />
          <meshStandardMaterial color="#08090D" roughness={0.9} metalness={0.2} />
        </mesh>

        {/* Road Shoulders / Curbs (Left & Right) */}
        <mesh position={[-9.2, 0.15, -90]} receiveShadow>
          <boxGeometry args={[0.5, 0.4, 180]} />
          <meshStandardMaterial color="#252831" roughness={0.7} metalness={0.3} />
        </mesh>
        <mesh position={[9.2, 0.15, -90]} receiveShadow>
          <boxGeometry args={[0.5, 0.4, 180]} />
          <meshStandardMaterial color="#252831" roughness={0.7} metalness={0.3} />
        </mesh>

        {/* Continuous Crimson Neon Curb Strips */}
        <mesh position={[-8.92, 0.36, -90]}>
          <boxGeometry args={[0.06, 0.04, 180]} />
          <meshStandardMaterial
            color="#9D071A"
            emissive="#9D071A"
            emissiveIntensity={2.5}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[8.92, 0.36, -90]}>
          <boxGeometry args={[0.06, 0.04, 180]} />
          <meshStandardMaterial
            color="#9D071A"
            emissive="#9D071A"
            emissiveIntensity={2.5}
            toneMapped={false}
          />
        </mesh>

        {/* Centerline Glowing Red Fiber-Optic Lane Divider Dashes */}
        <group name="Centerline-Dashes">
          {laneDashes.map((z, idx) => (
            <mesh key={`dash-${idx}`} position={[0, 0.06, z]}>
              <planeGeometry args={[0.22, 3.2]} />
              <meshStandardMaterial
                color="#D62E42"
                emissive="#D62E42"
                emissiveIntensity={3.0}
                side={THREE.DoubleSide}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>

        {/* Dual Lane Outer Guide Lines (Left & Right) */}
        <mesh position={[-4.5, 0.06, -90]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.08, 180]} />
          <meshStandardMaterial
            color="#252831"
            emissive="#9D071A"
            emissiveIntensity={1.2}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[4.5, 0.06, -90]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.08, 180]} />
          <meshStandardMaterial
            color="#252831"
            emissive="#9D071A"
            emissiveIntensity={1.2}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Animated Highway Data Packets (Pulsing nodes speeding along road) */}
        <group ref={dataPacketsRef} name="Highway-Data-Packets">
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={`packet-${i}`} position={[0, 0.15, 0]}>
              <boxGeometry args={[0.4, 0.08, 1.2]} />
              <meshStandardMaterial
                color="#D62E42"
                emissive="#D62E42"
                emissiveIntensity={4.0}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
      </group>

      {/* ==================================================================== */}
      {/* 2. SYMMETRICAL REFLECTING CYBER-CANALS & BASINS                       */}
      {/* Iconic Kartavya Path water channels transformed into cyber-fluid     */}
      {/* Real scale: 5m wide trenches, 180m length on both flanks             */}
      {/* ==================================================================== */}
      <group name="Canals">
        {/* WEST CANAL (Left, X = -13m) */}
        <group position={[-13, 0, -90]}>
          {/* Concrete canal retaining basin */}
          <mesh position={[0, -0.4, 0]}>
            <boxGeometry args={[5.2, 0.8, 180]} />
            <meshStandardMaterial color="#111319" roughness={0.9} />
          </mesh>
          {/* Dark reflective cyber-water plane */}
          <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4.8, 178]} />
            <meshStandardMaterial
              color="#08090D"
              roughness={0.05}
              metalness={0.95}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Submerged crimson fiber-optic array */}
          <mesh position={[0, -0.38, 0]}>
            <boxGeometry args={[0.08, 0.04, 176]} />
            <meshStandardMaterial
              color="#9D071A"
              emissive="#9D071A"
              emissiveIntensity={3.0}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* EAST CANAL (Right, X = +13m) */}
        <group position={[13, 0, -90]}>
          {/* Concrete canal retaining basin */}
          <mesh position={[0, -0.4, 0]}>
            <boxGeometry args={[5.2, 0.8, 180]} />
            <meshStandardMaterial color="#111319" roughness={0.9} />
          </mesh>
          {/* Dark reflective cyber-water plane */}
          <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4.8, 178]} />
            <meshStandardMaterial
              color="#08090D"
              roughness={0.05}
              metalness={0.95}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Submerged crimson fiber-optic array */}
          <mesh position={[0, -0.38, 0]}>
            <boxGeometry args={[0.08, 0.04, 176]} />
            <meshStandardMaterial
              color="#9D071A"
              emissive="#9D071A"
              emissiveIntensity={3.0}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* Canal Crosswalk Bridges (Pedestrian links at Z = -45m and Z = -125m) */}
        {[-45, -125].map((bz) => (
          <React.Fragment key={`canal-bridge-${bz}`}>
            {/* Left Bridge */}
            <mesh position={[-13, 0.12, bz]} castShadow receiveShadow>
              <boxGeometry args={[5.6, 0.25, 4.0]} />
              <meshStandardMaterial color="#252831" roughness={0.7} metalness={0.4} />
            </mesh>
            {/* Right Bridge */}
            <mesh position={[13, 0.12, bz]} castShadow receiveShadow>
              <boxGeometry args={[5.6, 0.25, 4.0]} />
              <meshStandardMaterial color="#252831" roughness={0.7} metalness={0.4} />
            </mesh>
          </React.Fragment>
        ))}
      </group>

      {/* ==================================================================== */}
      {/* 3. OUTER PEDESTRIAN PROMENADES & BIOSWALES                           */}
      {/* Paved cyber-sandstone walkways (X: -16 to -22m and +16 to +22m)      */}
      {/* ==================================================================== */}
      <group name="Promenades">
        {/* Left Outer Paved Walkway */}
        <mesh position={[-19, 0.08, -90]} receiveShadow>
          <boxGeometry args={[6.5, 0.2, 180]} />
          <meshStandardMaterial color="#111319" roughness={0.8} metalness={0.25} />
        </mesh>
        {/* Right Outer Paved Walkway */}
        <mesh position={[19, 0.08, -90]} receiveShadow>
          <boxGeometry args={[6.5, 0.2, 180]} />
          <meshStandardMaterial color="#111319" roughness={0.8} metalness={0.25} />
        </mesh>

        {/* Geometric Angular Stone Benches with Red Underglow */}
        {[-30, -60, -90, -120, -150].map((bz) => (
          <React.Fragment key={`bench-${bz}`}>
            {/* Left Bench */}
            <group position={[-20, 0.45, bz]}>
              <mesh castShadow>
                <boxGeometry args={[1.2, 0.55, 3.2]} />
                <meshStandardMaterial color="#252831" roughness={0.6} metalness={0.4} />
              </mesh>
              <mesh position={[0, -0.22, 0]}>
                <boxGeometry args={[1.0, 0.05, 3.0]} />
                <meshStandardMaterial
                  color="#D62E42"
                  emissive="#D62E42"
                  emissiveIntensity={2.5}
                  toneMapped={false}
                />
              </mesh>
            </group>
            {/* Right Bench */}
            <group position={[20, 0.45, bz]}>
              <mesh castShadow>
                <boxGeometry args={[1.2, 0.55, 3.2]} />
                <meshStandardMaterial color="#252831" roughness={0.6} metalness={0.4} />
              </mesh>
              <mesh position={[0, -0.22, 0]}>
                <boxGeometry args={[1.0, 0.05, 3.0]} />
                <meshStandardMaterial
                  color="#D62E42"
                  emissive="#D62E42"
                  emissiveIntensity={2.5}
                  toneMapped={false}
                />
              </mesh>
            </group>
          </React.Fragment>
        ))}

        {/* Roadside Cyber Bollards with Red Glowing Diodes */}
        {bollardPositions.map(([bx, bz], idx) => (
          <group key={`road-bollard-${idx}`} position={[bx, 0.4, bz]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.15, 0.18, 0.6, 8]} />
              <meshStandardMaterial color="#252831" roughness={0.6} metalness={0.5} />
            </mesh>
            <mesh position={[0, 0.32, 0]}>
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshStandardMaterial
                color="#D62E42"
                emissive="#D62E42"
                emissiveIntensity={2.5}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* ==================================================================== */}
      {/* 4. SIGNATURE BRUTALIST STREET LAMPS                                  */}
      {/* Custom angular cyber-pylons lining the boulevard (7.5m height)       */}
      {/* ==================================================================== */}
      <group name="Street-Lamps">
        {lampPositions.map(({ x, z, isLeft }, idx) => {
          const armDir = isLeft ? 1 : -1;
          return (
            <group key={`lamp-${idx}`} position={[x, 0, z]}>
              {/* Foundation Plinth */}
              <mesh position={[0, 0.3, 0]} castShadow>
                <boxGeometry args={[0.8, 0.6, 0.8]} />
                <meshStandardMaterial color="#111319" roughness={0.8} />
              </mesh>

              {/* Main Vertical Pylon Mast (7m tall) */}
              <mesh position={[0, 3.8, 0]} castShadow>
                <boxGeometry args={[0.35, 7.0, 0.35]} />
                <meshStandardMaterial color="#252831" roughness={0.5} metalness={0.5} />
              </mesh>

              {/* Canted Cantilever Arm Overhanging Roadway */}
              <group position={[armDir * 0.9, 7.1, 0]} rotation={[0, 0, armDir * -0.3]}>
                <mesh castShadow>
                  <boxGeometry args={[2.2, 0.25, 0.3]} />
                  <meshStandardMaterial color="#252831" roughness={0.5} metalness={0.6} />
                </mesh>
                {/* Downward Luminaire Fixture Head */}
                <mesh position={[armDir * 0.9, -0.2, 0]}>
                  <boxGeometry args={[0.8, 0.2, 0.4]} />
                  <meshStandardMaterial color="#111319" roughness={0.3} metalness={0.7} />
                </mesh>
                {/* Red Neon Luminaire Lens */}
                <mesh position={[armDir * 0.9, -0.31, 0]}>
                  <planeGeometry args={[0.7, 0.32]} />
                  <meshStandardMaterial
                    color="#D62E42"
                    emissive="#D62E42"
                    emissiveIntensity={3.5}
                    side={THREE.DoubleSide}
                    toneMapped={false}
                  />
                </mesh>
              </group>

              {/* Downward Signal Red Streetlight Spot */}
              <spotLight
                position={[armDir * 2.0, 6.8, 0]}
                target-position={[armDir * 5.0, 0, 0]}
                color="#D62E42"
                intensity={1.2}
                distance={15}
                angle={0.55}
                penumbra={0.7}
              />
            </group>
          );
        })}
      </group>

      {/* ==================================================================== */}
      {/* 5. SECURITY CHECKPOINT GANTRIES (PERIMETER SCANNERS)                 */}
      {/* Massive cybernetic truss archways spanning across the boulevard      */}
      {/* ==================================================================== */}
      <group name="Security-Gantries">
        {/* CHECKPOINT 1 (Z = -45m) */}
        <group position={[0, 0, -45]}>
          {/* Left Tower Pylon */}
          <mesh position={[-9.5, 5, 0]} castShadow>
            <boxGeometry args={[1.2, 10, 1.4]} />
            <meshStandardMaterial color="#252831" roughness={0.6} metalness={0.4} />
          </mesh>
          {/* Right Tower Pylon */}
          <mesh position={[9.5, 5, 0]} castShadow>
            <boxGeometry args={[1.2, 10, 1.4]} />
            <meshStandardMaterial color="#252831" roughness={0.6} metalness={0.4} />
          </mesh>
          {/* Cross Gantry Overhead Truss */}
          <mesh position={[0, 9.2, 0]} castShadow>
            <boxGeometry args={[20.2, 1.6, 1.8]} />
            <meshStandardMaterial color="#111319" roughness={0.6} metalness={0.5} />
          </mesh>

          {/* Overhead Telemetry Status Display Board */}
          <mesh position={[0, 9.2, 0.92]}>
            <planeGeometry args={[14.0, 1.0]} />
            <meshStandardMaterial
              color="#08090D"
              emissive="#9D071A"
              emissiveIntensity={0.8}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>

          {/* Active Laser Scan Sheet (Moving Plane) */}
          <mesh ref={scanLineRef1} position={[0, 4.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[17.8, 0.1]} />
            <meshStandardMaterial
              color="#D62E42"
              emissive="#D62E42"
              emissiveIntensity={4.0}
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* CHECKPOINT 2 (Z = -125m) */}
        <group position={[0, 0, -125]}>
          {/* Left Tower Pylon */}
          <mesh position={[-9.5, 5, 0]} castShadow>
            <boxGeometry args={[1.2, 10, 1.4]} />
            <meshStandardMaterial color="#252831" roughness={0.6} metalness={0.4} />
          </mesh>
          {/* Right Tower Pylon */}
          <mesh position={[9.5, 5, 0]} castShadow>
            <boxGeometry args={[1.2, 10, 1.4]} />
            <meshStandardMaterial color="#252831" roughness={0.6} metalness={0.4} />
          </mesh>
          {/* Cross Gantry Overhead Truss */}
          <mesh position={[0, 9.2, 0]} castShadow>
            <boxGeometry args={[20.2, 1.6, 1.8]} />
            <meshStandardMaterial color="#111319" roughness={0.6} metalness={0.5} />
          </mesh>

          {/* Overhead Telemetry Display Board */}
          <mesh position={[0, 9.2, 0.92]}>
            <planeGeometry args={[14.0, 1.0]} />
            <meshStandardMaterial
              color="#08090D"
              emissive="#9D071A"
              emissiveIntensity={0.8}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>

          {/* Active Laser Scan Sheet */}
          <mesh ref={scanLineRef2} position={[0, 4.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[17.8, 0.1]} />
            <meshStandardMaterial
              color="#D62E42"
              emissive="#D62E42"
              emissiveIntensity={4.0}
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default KartavyaPath;
