'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DESIGN_TOKENS } from '../store';

/**
 * YellowLineTrain Component
 *
 * Real-world scale representation (1 unit = 1 meter):
 * - Real Delhi Metro Yellow Line: Subterranean high-speed transit tube.
 * - Train Coach Dimensions: 3.2m width, 3.8m height, 22m length per car (~45m section).
 * - Tunnel Dimensions: 6.8m diameter cylindrical bore spanning from z=-230 to z=-420.
 *
 * Greybox Architectural Representation:
 * 1. Concrete Tube Tunnel: Faceted circular subway bore (radius: 3.5m, length: 190m)
 * 2. Standard Gauge Railway Tracks: Dual steel rails (gauge: 1.435m) with ballast trackbed
 * 3. 2-Car Metro Trainset:
 *    - Car 1 (Lead Cab): Aerodynamic sloped front, driver visor, passenger side-doors
 *    - Car 2 (Trailer): Articulated vestibule gangway connection
 * 4. Undercarriage Bogies: Wheelsets and magnetic traction motors
 * 5. Tunnel Cable Conduits: Heavy-duty data and high-voltage cable runs
 *
 * Cyberpunk Accents:
 * - Red emergency strobe strips repeating along the tunnel walls
 * - Crimson (#9D071A) interior cabin glow leaking through tinted window slits
 * - Signal red (#D62E42) neon undercarriage ground-effect track lighting
 * - High-speed running light pulses along tunnel rails
 */
export function YellowLineTrain() {
  const trainGroupRef = useRef<THREE.Group>(null);
  const underglowRef = useRef<THREE.PointLight>(null);
  const pulseRingsRef = useRef<THREE.Group>(null);

  // Generate 18 tunnel ring ribs along the 190m tube
  const ringZPositions = useMemo(() => {
    const pos: number[] = [];
    for (let z = -235; z >= -415; z -= 10) {
      pos.push(z);
    }
    return pos;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Subtle train cabin rumble / kinetic vibration
    if (trainGroupRef.current) {
      trainGroupRef.current.position.y = -14 + Math.sin(time * 24) * 0.015;
      trainGroupRef.current.position.x = Math.sin(time * 14) * 0.012;
    }

    // Dynamic underglow pulsing
    if (underglowRef.current) {
      underglowRef.current.intensity = 2.2 + Math.sin(time * 8) * 0.5;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ============================================================ */}
      {/* 1. SUBTERRANEAN CYLINDER TUNNEL (z = -230 to -420)           */}
      {/* ============================================================ */}
      <mesh position={[0, -13.5, -325]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[3.8, 3.8, 190, 16, 1, true]} />
        <meshStandardMaterial
          color={DESIGN_TOKENS.gunmetal}
          roughness={0.8}
          metalness={0.2}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Concrete Ballast Trackbed Floor */}
      <mesh position={[0, -16.8, -325]} receiveShadow>
        <boxGeometry args={[4.5, 0.4, 190]} />
        <meshStandardMaterial
          color={DESIGN_TOKENS.obsidian}
          roughness={0.9}
        />
      </mesh>

      {/* Standard Gauge Steel Rails (Gauge: 1.435m) */}
      {/* Left Rail */}
      <mesh position={[-0.72, -16.55, -325]}>
        <boxGeometry args={[0.08, 0.12, 190]} />
        <meshStandardMaterial color={DESIGN_TOKENS.silver} roughness={0.3} metalness={0.9} />
      </mesh>
      {/* Right Rail */}
      <mesh position={[0.72, -16.55, -325]}>
        <boxGeometry args={[0.08, 0.12, 190]} />
        <meshStandardMaterial color={DESIGN_TOKENS.silver} roughness={0.3} metalness={0.9} />
      </mesh>

      {/* Power Rail (Third Rail) with Crimson Pulse Conduit */}
      <mesh position={[1.4, -16.4, -325]}>
        <boxGeometry args={[0.12, 0.16, 190]} />
        <meshBasicMaterial color={DESIGN_TOKENS.signal} />
      </mesh>

      {/* ============================================================ */}
      {/* 2. REPEATING TUNNEL RIBS & RED EMERGENCY LIGHT STRIPS         */}
      {/* ============================================================ */}
      <group ref={pulseRingsRef}>
        {ringZPositions.map((rz, idx) => (
          <group key={idx} position={[0, -13.5, rz]}>
            {/* Structural Tunnel Steel Arch Rib */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[3.65, 3.82, 16]} />
              <meshStandardMaterial
                color={DESIGN_TOKENS.surface}
                roughness={0.6}
                metalness={0.5}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Left Wall Emergency Red Beacon */}
            <mesh position={[-3.6, 0.5, 0]}>
              <boxGeometry args={[0.1, 0.2, 0.3]} />
              <meshBasicMaterial color={DESIGN_TOKENS.signal} />
            </mesh>
            {/* Right Wall Emergency Red Beacon */}
            <mesh position={[3.6, 0.5, 0]}>
              <boxGeometry args={[0.1, 0.2, 0.3]} />
              <meshBasicMaterial color={DESIGN_TOKENS.signal} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ============================================================ */}
      {/* 3. METRO TRAINSET (2 Cars: Length ~44m, Width: 3.2m, H: 3.8m)*/}
      {/* ============================================================ */}
      <group ref={trainGroupRef} position={[0, -14, -310]}>
        {/* CAR 1: LEAD COACH (z = -12 to +10) */}
        <group position={[0, 0, -10]}>
          {/* Main Coach Body Box */}
          <mesh position={[0, -0.6, 0]} castShadow>
            <boxGeometry args={[3.2, 3.2, 20]} />
            <meshStandardMaterial
              color={DESIGN_TOKENS.gunmetal}
              roughness={0.4}
              metalness={0.7}
            />
          </mesh>

          {/* Aerodynamic Sloped Front Nose Cone */}
          <mesh position={[0, -0.9, -11.2]} rotation={[Math.PI / 8, 0, 0]} castShadow>
            <boxGeometry args={[3.1, 2.6, 2.5]} />
            <meshStandardMaterial
              color={DESIGN_TOKENS.surface}
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>

          {/* Front Cockpit Visor / Windshield */}
          <mesh position={[0, -0.4, -12.1]}>
            <boxGeometry args={[2.5, 0.9, 0.1]} />
            <meshStandardMaterial
              color={DESIGN_TOKENS.obsidian}
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>

          {/* Twin Red LED Headlight Strips */}
          <mesh position={[-1.0, -1.5, -12.3]}>
            <boxGeometry args={[0.4, 0.15, 0.05]} />
            <meshBasicMaterial color={DESIGN_TOKENS.signal} />
          </mesh>
          <mesh position={[1.0, -1.5, -12.3]}>
            <boxGeometry args={[0.4, 0.15, 0.05]} />
            <meshBasicMaterial color={DESIGN_TOKENS.signal} />
          </mesh>

          {/* Forward Projection Spotlights */}
          <spotLight
            position={[0, -1.4, -12.5]}
            target-position={[0, -15, -60]}
            color={DESIGN_TOKENS.signal}
            intensity={3.0}
            angle={Math.PI / 5}
            penumbra={0.7}
            distance={45}
          />

          {/* Passenger Cabin Window Slits (Emitting Crimson Interior Glow) */}
          {[-6, -2, 2, 6].map((wz, idx) => (
            <group key={idx}>
              {/* Left Window */}
              <mesh position={[-1.61, -0.4, wz]}>
                <boxGeometry args={[0.04, 0.9, 2.2]} />
                <meshBasicMaterial color={DESIGN_TOKENS.crimson} />
              </mesh>
              {/* Right Window */}
              <mesh position={[1.61, -0.4, wz]}>
                <boxGeometry args={[0.04, 0.9, 2.2]} />
                <meshBasicMaterial color={DESIGN_TOKENS.crimson} />
              </mesh>
            </group>
          ))}
        </group>

        {/* ARTICULATED GANGWAY (Connection between coaches) */}
        <mesh position={[0, -0.6, 1.0]}>
          <boxGeometry args={[2.8, 2.9, 1.8]} />
          <meshStandardMaterial
            color={DESIGN_TOKENS.obsidian}
            roughness={0.9}
          />
        </mesh>

        {/* CAR 2: SECOND COACH (z = 2 to 22) */}
        <group position={[0, 0, 12]}>
          <mesh position={[0, -0.6, 0]} castShadow>
            <boxGeometry args={[3.2, 3.2, 20]} />
            <meshStandardMaterial
              color={DESIGN_TOKENS.gunmetal}
              roughness={0.4}
              metalness={0.7}
            />
          </mesh>

          {/* Passenger Cabin Window Slits */}
          {[-6, -2, 2, 6].map((wz, idx) => (
            <group key={idx}>
              {/* Left Window */}
              <mesh position={[-1.61, -0.4, wz]}>
                <boxGeometry args={[0.04, 0.9, 2.2]} />
                <meshBasicMaterial color={DESIGN_TOKENS.crimson} />
              </mesh>
              {/* Right Window */}
              <mesh position={[1.61, -0.4, wz]}>
                <boxGeometry args={[0.04, 0.9, 2.2]} />
                <meshBasicMaterial color={DESIGN_TOKENS.crimson} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Undercarriage Neon Ground Effects (Signal Red) */}
        <pointLight
          ref={underglowRef}
          position={[0, -2.2, 0]}
          color={DESIGN_TOKENS.signal}
          intensity={2.8}
          distance={12}
          decay={2}
        />
      </group>
    </group>
  );
}

export default YellowLineTrain;
