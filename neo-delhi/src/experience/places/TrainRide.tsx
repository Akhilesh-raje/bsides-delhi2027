"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame, type ThreeElements } from "@react-three/fiber";

/**
 * TrainRide Props
 * Supports standard Three.js group props plus scroll progress and active state.
 */
export type TrainRideProps = ThreeElements["group"] & {
  /** Scroll progress through journey (Train Ride chapter: 0.45 - 0.62) */
  progress?: number;
  /** Whether this chapter is active */
  active?: boolean;
};

/**
 * Train Ride on Yellow Line (Greybox Architecture)
 * High-speed cyber-metro carriage interior speeding through subterranean data tunnels.
 * Real dimensions: ~3.4m width, ~2.6m height, ~18m length (Z: -9m to +9m).
 * Features longitudinal bench seats, stainless steel grab stanchions, dynamic route map displays,
 * gangway bellows, and dynamic exterior tunnel speed streak rings.
 *
 * Design Tokens:
 * - obsidian: #08090D (exterior tunnel walls, darkened window glass)
 * - surface: #111319 (interior wall paneling, ceiling bulkheads)
 * - gunmetal: #252831 (seat chassis, door leaf frames, grab pole fittings)
 * - crimson: #9D071A (recessed ceiling coves, seat underglow, tunnel markers)
 * - signal: #D62E42 (route map active station LEDs, floor guide strip, tunnel speed lights)
 * - silver: #E5E1DF (brushed stainless grab stanchions, hand rings)
 * - muted: #99949A (acoustic ceiling panels, air conditioning louvers)
 */
export function TrainRide({
  progress = 0.52,
  active = true,
  ...groupProps
}: TrainRideProps) {
  // Animation refs
  const trainCarriageRef = useRef<THREE.Group>(null);
  const tunnelRingsRef = useRef<THREE.Group>(null);
  const routeLedsRef = useRef<THREE.Group>(null);
  const speedStreaksRef = useRef<THREE.Group>(null);

  // Bench positions along the left and right walls (4 bench clusters per side)
  const benchPositions = useMemo(() => [-6, -2, 2, 6], []);

  // Vertical grab stanchion positions along the center aisle
  const grabStanchions = useMemo(() => [-6.5, -3.5, 0, 3.5, 6.5], []);

  // Tunnel ring structural ribs outside the train (spaced along 40m tunnel)
  const tunnelRibs = useMemo(() => {
    const ribs: number[] = [];
    for (let z = -25; z <= 25; z += 5) {
      ribs.push(z);
    }
    return ribs;
  }, []);

  // Frame animation: Train sway rumble, high-speed tunnel streaks, route LED flicker
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    // Subtle train carriage sway and suspension rumble
    if (trainCarriageRef.current) {
      // Lateral low-frequency sway
      trainCarriageRef.current.rotation.z = Math.sin(time * 3.5) * 0.008;
      // High-frequency vertical track rumble
      trainCarriageRef.current.position.y = Math.sin(time * 16.0) * 0.012 + Math.cos(time * 28.0) * 0.005;
    }

    // Tunnel speed lights streaking past the train windows
    if (speedStreaksRef.current) {
      speedStreaksRef.current.children.forEach((child, i) => {
        // High speed translation along Z axis
        const speed = 45.0;
        const currentZ = ((time * speed + i * 8.0) % 60.0) - 30.0;
        child.position.z = currentZ;
      });
    }

    // Pulsing dynamic route map LEDs
    if (routeLedsRef.current) {
      const pulse = (Math.sin(time * 8.0) + 1) * 0.5;
      routeLedsRef.current.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = 2.0 + pulse * 2.0;
        }
      });
    }
  });

  return (
    <group {...groupProps} name="TrainRide-Chapter">
      {/* ==================================================================== */}
      {/* 1. EXTERNAL SUBTERRANEAN TUNNEL & HIGH-SPEED STREAK LIGHTS           */}
      {/* Cylindrical tunnel envelope visible outside train windows            */}
      {/* ==================================================================== */}
      <group name="Subterranean-Tunnel">
        {/* Tunnel Outer Concrete Shell */}
        <mesh position={[0, 1.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[4.2, 4.2, 50, 24, 1, true]} />
          <meshStandardMaterial
            color="#08090D"
            roughness={0.95}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Circular Tunnel Structural Rings */}
        <group ref={tunnelRingsRef} name="Tunnel-Rings">
          {tunnelRibs.map((tz, idx) => (
            <mesh key={`tunnel-rib-${idx}`} position={[0, 1.3, tz]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[4.15, 0.08, 12, 32]} />
              <meshStandardMaterial color="#252831" roughness={0.7} metalness={0.5} />
            </mesh>
          ))}
        </group>

        {/* Dynamic High-Speed Tunnel Streak Lights (Simulating 120 km/h) */}
        <group ref={speedStreaksRef} name="Speed-Streaks">
          {[-3.2, 3.2].map((sx, sideIdx) =>
            [0, 1, 2, 3, 4, 5].map((i) => (
              <mesh key={`streak-${sideIdx}-${i}`} position={[sx, 1.5 + (i % 2) * 0.8, 0]}>
                <boxGeometry args={[0.08, 0.08, 3.5]} />
                <meshStandardMaterial
                  color="#D62E42"
                  emissive="#D62E42"
                  emissiveIntensity={4.5}
                  toneMapped={false}
                />
              </mesh>
            ))
          )}
        </group>
      </group>

      {/* ==================================================================== */}
      {/* 2. TRAIN CARRIAGE CHASSIS & INTERIOR SHELL                           */}
      {/* Width 3.4m, Height 2.6m, Length 18m                                  */}
      {/* ==================================================================== */}
      <group ref={trainCarriageRef} name="Train-Carriage">
        {/* Anti-Slip Interior Composite Floor (Y = 0) */}
        <mesh position={[0, -0.05, 0]} receiveShadow>
          <boxGeometry args={[3.2, 0.1, 18]} />
          <meshStandardMaterial color="#111319" roughness={0.8} metalness={0.3} />
        </mesh>

        {/* Centerline Glowing Red Safety Guidance Strip */}
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[0.15, 0.01, 17.6]} />
          <meshStandardMaterial
            color="#D62E42"
            emissive="#D62E42"
            emissiveIntensity={2.5}
            toneMapped={false}
          />
        </mesh>

        {/* Ceiling Vault / Acoustic Roof Panel (Y = 2.55m) */}
        <mesh position={[0, 2.55, 0]}>
          <boxGeometry args={[3.2, 0.1, 18]} />
          <meshStandardMaterial color="#111319" roughness={0.7} metalness={0.4} />
        </mesh>

        {/* Continuous Recessed Ceiling Cove Lights (Port & Starboard) */}
        <mesh position={[-1.1, 2.48, 0]}>
          <boxGeometry args={[0.12, 0.04, 17.6]} />
          <meshStandardMaterial
            color="#9D071A"
            emissive="#9D071A"
            emissiveIntensity={2.8}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[1.1, 2.48, 0]}>
          <boxGeometry args={[0.12, 0.04, 17.6]} />
          <meshStandardMaterial
            color="#9D071A"
            emissive="#9D071A"
            emissiveIntensity={2.8}
            toneMapped={false}
          />
        </mesh>

        {/* Ambient Carriage Interior Lighting */}
        <pointLight position={[0, 2.2, -4]} color="#E5E1DF" intensity={0.4} distance={8} />
        <pointLight position={[0, 2.2, 4]} color="#E5E1DF" intensity={0.4} distance={8} />
        <pointLight position={[0, 2.2, 0]} color="#9D071A" intensity={0.6} distance={10} />

        {/* ==================================================================== */}
        {/* 3. SIDE WALLS, DOORS & TINTED WINDOWS                                */}
        {/* ==================================================================== */}
        {/* PORT SIDE WALL (X = -1.6m) */}
        <group position={[-1.6, 1.25, 0]}>
          {/* Main Wall Panels */}
          <mesh receiveShadow>
            <boxGeometry args={[0.1, 2.5, 18]} />
            <meshStandardMaterial color="#252831" roughness={0.6} metalness={0.5} />
          </mesh>
          {/* Tinted Glass Window Strips */}
          {[-6, -2, 2, 6].map((wz, idx) => (
            <mesh key={`win-port-${idx}`} position={[0.06, 0.25, wz]}>
              <boxGeometry args={[0.02, 1.0, 2.8]} />
              <meshStandardMaterial
                color="#08090D"
                roughness={0.1}
                metalness={0.9}
                transparent
                opacity={0.45}
              />
            </mesh>
          ))}
        </group>

        {/* STARBOARD SIDE WALL (X = +1.6m) */}
        <group position={[1.6, 1.25, 0]}>
          {/* Main Wall Panels */}
          <mesh receiveShadow>
            <boxGeometry args={[0.1, 2.5, 18]} />
            <meshStandardMaterial color="#252831" roughness={0.6} metalness={0.5} />
          </mesh>
          {/* Tinted Glass Window Strips */}
          {[-6, -2, 2, 6].map((wz, idx) => (
            <mesh key={`win-starboard-${idx}`} position={[-0.06, 0.25, wz]}>
              <boxGeometry args={[0.02, 1.0, 2.8]} />
              <meshStandardMaterial
                color="#08090D"
                roughness={0.1}
                metalness={0.9}
                transparent
                opacity={0.45}
              />
            </mesh>
          ))}
        </group>

        {/* ==================================================================== */}
        {/* 4. LONGITUDINAL BENCH SEATING                                        */}
        {/* Continuous molded benches with crimson cushions & courtesy underglow */}
        {/* ==================================================================== */}
        <group name="Bench-Seating">
          {benchPositions.map((bz, idx) => (
            <React.Fragment key={`benches-${idx}`}>
              {/* Port Side Bench (X = -1.25m) */}
              <group position={[-1.25, 0.25, bz]}>
                {/* Bench Base Plinth */}
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[0.6, 0.45, 2.6]} />
                  <meshStandardMaterial color="#252831" roughness={0.7} metalness={0.4} />
                </mesh>
                {/* Crimson Inset Seat Cushion */}
                <mesh position={[0, 0.24, 0]}>
                  <boxGeometry args={[0.55, 0.06, 2.5]} />
                  <meshStandardMaterial color="#9D071A" roughness={0.5} metalness={0.2} />
                </mesh>
                {/* Backrest Cushion */}
                <mesh position={[-0.26, 0.55, 0]}>
                  <boxGeometry args={[0.06, 0.5, 2.5]} />
                  <meshStandardMaterial color="#9D071A" roughness={0.5} metalness={0.2} />
                </mesh>
                {/* Under-Seat Crimson Courtesy Glow Strip */}
                <mesh position={[0.28, -0.15, 0]}>
                  <boxGeometry args={[0.04, 0.04, 2.5]} />
                  <meshStandardMaterial
                    color="#D62E42"
                    emissive="#9D071A"
                    emissiveIntensity={2.0}
                    toneMapped={false}
                  />
                </mesh>
              </group>

              {/* Starboard Side Bench (X = +1.25m) */}
              <group position={[1.25, 0.25, bz]}>
                {/* Bench Base Plinth */}
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[0.6, 0.45, 2.6]} />
                  <meshStandardMaterial color="#252831" roughness={0.7} metalness={0.4} />
                </mesh>
                {/* Crimson Inset Seat Cushion */}
                <mesh position={[0, 0.24, 0]}>
                  <boxGeometry args={[0.55, 0.06, 2.5]} />
                  <meshStandardMaterial color="#9D071A" roughness={0.5} metalness={0.2} />
                </mesh>
                {/* Backrest Cushion */}
                <mesh position={[0.26, 0.55, 0]}>
                  <boxGeometry args={[0.06, 0.5, 2.5]} />
                  <meshStandardMaterial color="#9D071A" roughness={0.5} metalness={0.2} />
                </mesh>
                {/* Under-Seat Courtesy Glow Strip */}
                <mesh position={[-0.28, -0.15, 0]}>
                  <boxGeometry args={[0.04, 0.04, 2.5]} />
                  <meshStandardMaterial
                    color="#D62E42"
                    emissive="#9D071A"
                    emissiveIntensity={2.0}
                    toneMapped={false}
                  />
                </mesh>
              </group>
            </React.Fragment>
          ))}
        </group>

        {/* ==================================================================== */}
        {/* 5. STAINLESS STEEL GRAB STANCHIONS & OVERHEAD RAILS                  */}
        {/* ==================================================================== */}
        <group name="Grab-Stanchions">
          {/* Vertical Center Stanchions */}
          {grabStanchions.map((sz, idx) => (
            <group key={`stanchion-${idx}`} position={[0, 1.25, sz]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.025, 0.025, 2.5, 12]} />
                <meshStandardMaterial color="#E5E1DF" metalness={0.9} roughness={0.15} />
              </mesh>
              {/* Red Grip Ring Accent */}
              <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.25, 12]} />
                <meshStandardMaterial
                  color="#D62E42"
                  emissive="#D62E42"
                  emissiveIntensity={2.5}
                  toneMapped={false}
                />
              </mesh>
            </group>
          ))}

          {/* Longitudinal Overhead Grab Rails (Left & Right at Y = 2.05m) */}
          <mesh position={[-0.7, 2.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 17.6, 8]} />
            <meshStandardMaterial color="#E5E1DF" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0.7, 2.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 17.6, 8]} />
            <meshStandardMaterial color="#E5E1DF" metalness={0.85} roughness={0.2} />
          </mesh>
        </group>

        {/* ==================================================================== */}
        {/* 6. DYNAMIC OVERHEAD ROUTE MAPS & BULKHEAD CYBER-SCREENS              */}
        {/* ==================================================================== */}
        <group name="Route-Displays">
          {/* Overhead Route Map Strip above doors (Port Side) */}
          {[-4, 0, 4].map((dz, idx) => (
            <group key={`route-port-${idx}`} position={[-1.52, 2.15, dz]}>
              <mesh>
                <boxGeometry args={[0.04, 0.22, 1.6]} />
                <meshStandardMaterial color="#111319" metalness={0.8} />
              </mesh>
              {/* Glowing Route Strip Face */}
              <mesh position={[0.03, 0, 0]}>
                <planeGeometry args={[1.5, 0.18]} />
                <meshStandardMaterial
                  color="#08090D"
                  emissive="#9D071A"
                  emissiveIntensity={1.2}
                />
              </mesh>
            </group>
          ))}

          {/* Pulsing Active Station Node LEDs */}
          <group ref={routeLedsRef} name="Active-Station-LEDs">
            {[-4, 0, 4].map((dz, idx) => (
              <mesh key={`route-led-${idx}`} position={[-1.48, 2.15, dz + 0.2]}>
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshStandardMaterial
                  color="#D62E42"
                  emissive="#D62E42"
                  emissiveIntensity={3.5}
                  toneMapped={false}
                />
              </mesh>
            ))}
          </group>

          {/* Forward Bulkhead Cyber-Screen (Z = -8.9m) */}
          <group position={[0, 1.5, -8.85]}>
            <mesh castShadow>
              <boxGeometry args={[1.8, 1.0, 0.08]} />
              <meshStandardMaterial color="#252831" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.05]}>
              <planeGeometry args={[1.7, 0.9]} />
              <meshStandardMaterial
                color="#08090D"
                emissive="#D62E42"
                emissiveIntensity={1.6}
                roughness={0.2}
              />
            </mesh>
          </group>

          {/* Rear Bulkhead Cyber-Screen (Z = +8.9m) */}
          <group position={[0, 1.5, 8.85]} rotation={[0, Math.PI, 0]}>
            <mesh castShadow>
              <boxGeometry args={[1.8, 1.0, 0.08]} />
              <meshStandardMaterial color="#252831" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.05]}>
              <planeGeometry args={[1.7, 0.9]} />
              <meshStandardMaterial
                color="#08090D"
                emissive="#D62E42"
                emissiveIntensity={1.6}
                roughness={0.2}
              />
            </mesh>
          </group>
        </group>

        {/* ==================================================================== */}
        {/* 7. INTER-CAR GANGWAY ACCORDION BELLOWS                               */}
        {/* Vestibule connecting to adjacent coaches at both ends                */}
        {/* ==================================================================== */}
        <group name="Gangway-Bellows">
          {/* Front Gangway Vestibule (Z = -9m) */}
          <group position={[0, 1.25, -9.0]}>
            <mesh>
              <boxGeometry args={[1.4, 2.2, 0.4]} />
              <meshStandardMaterial color="#08090D" roughness={0.9} />
            </mesh>
            {/* Warning Chevron Frame */}
            <mesh position={[0, 0, 0.21]}>
              <boxGeometry args={[1.5, 2.3, 0.02]} />
              <meshStandardMaterial
                color="#D62E42"
                emissive="#9D071A"
                emissiveIntensity={1.5}
              />
            </mesh>
          </group>

          {/* Rear Gangway Vestibule (Z = +9m) */}
          <group position={[0, 1.25, 9.0]}>
            <mesh>
              <boxGeometry args={[1.4, 2.2, 0.4]} />
              <meshStandardMaterial color="#08090D" roughness={0.9} />
            </mesh>
            {/* Warning Chevron Frame */}
            <mesh position={[0, 0, -0.21]}>
              <boxGeometry args={[1.5, 2.3, 0.02]} />
              <meshStandardMaterial
                color="#D62E42"
                emissive="#9D071A"
                emissiveIntensity={1.5}
              />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

export default TrainRide;
