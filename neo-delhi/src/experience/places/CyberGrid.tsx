'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { DESIGN_TOKENS } from '../store';

/**
 * CyberGrid Component
 *
 * Provides a continuous subterranean and surface cybersecurity terrain grid.
 * Merges deep obsidian (#08090D) ground with gunmetal (#252831) lines
 * and signal red (#D62E42) grid intersections.
 */
export function CyberGrid() {
  const gridHelper = useMemo(() => {
    const grid = new THREE.GridHelper(900, 90, DESIGN_TOKENS.gunmetal, DESIGN_TOKENS.surface);
    grid.position.y = -0.15;
    grid.position.z = -250;
    return grid;
  }, []);

  return (
    <group>
      {/* Base Dark Ground Floor */}
      <mesh position={[0, -0.3, -250]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[900, 900]} />
        <meshStandardMaterial
          color={DESIGN_TOKENS.obsidian}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Cyberpunk Grid Helper Lines */}
      <primitive object={gridHelper} />
    </group>
  );
}

export default CyberGrid;
