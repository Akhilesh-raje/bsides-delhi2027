"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import { useFlags } from "@/lib/flags";

// A small glowing crystal hidden in a scene. Click it to capture.
export function Flag({ id, position }: { id: string; position: [number, number, number] }) {
  const found = useFlags((s) => s.found.includes(id));
  const find = useFlags((s) => s.find);
  const ref = useRef<THREE.Group>(null);
  const t = useRef(position[0] + position[2]); // per-flag bob phase

  useFrame((_, dt) => {
    t.current += dt;
    if (!ref.current) return;
    ref.current.rotation.y += dt * 1.2;
    ref.current.position.y = Math.sin(t.current * 2) * 0.15;
  });

  return (
    <group position={position}>
      <group ref={ref}>
        <mesh>
          <octahedronGeometry args={[0.3]} />
          <meshBasicMaterial color={found ? "#3a3d46" : "#ff6a7c"} toneMapped={false} />
        </mesh>
        {/* Larger invisible hit area so it is clickable while the camera moves */}
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            find(id);
          }}
          onPointerOver={() => (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "")}
        >
          <sphereGeometry args={[0.9, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}
