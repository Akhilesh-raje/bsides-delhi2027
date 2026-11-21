"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Flag } from "../Flag";
import { useMats } from "../materials";
import { PLACES } from "../path";
import { boxUV, NEON, signTexture, uv } from "../util";

export { MetroTunnel, TunnelLight } from "../metro/Station";
export { TrainLight } from "../metro/Train";

/** Delhi Metro concourse with AFC gates: the tickets section. */
export function MetroStation() {
  const m = useMats();
  const P = PLACES.metroGate;
  const token = useRef<THREE.Group>(null);
  const entry = useMemo(() => signTexture("प्रवेश · Entry", "Platforms · BSides Delhi 2027", { w: 1024, h: 160, fg: "#ffffff", bg: "#14223a", border: "none", sub: "#ffd23f" }), []);
  const map = useMemo(() => metroMap(), []);
  const hall = useMemo(() => boxUV(new THREE.BoxGeometry(28, 7.5, 34)), []);
  // Seen from inside; the +z face (index 4) is left open so the camera can look in.
  const hallMats = useMemo(() => {
    const inside = m.concrete.clone();
    inside.side = THREE.BackSide;
    const open = new THREE.MeshBasicMaterial({ visible: false });
    return [inside, inside, inside, inside, open, inside];
  }, [m]);
  useFrame((_, dt) => {
    if (token.current) token.current.rotation.y += dt * 0.7;
  });
  return (
    <group position={P}>
      {/* Concourse shell: open at the front so the camera looks in */}
      <mesh geometry={hall} material={hallMats} position={[0, 3.75, -14]} />
      <mesh material={m.granite} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -10]}>
        <planeGeometry args={[28, 42]} ref={uv} />
      </mesh>
      {/* Ceiling tube lights */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} material={m.cool} position={[(i % 3 - 1) * 7, 7.4, -2 - Math.floor(i / 3) * 7]}>
          <boxGeometry args={[3.2, 0.06, 0.2]} />
        </mesh>
      ))}
      {/* Pillars */}
      {[-9, 9].map((x) => (
        <mesh key={x} material={m.stucco} position={[x, 3.75, -6]}>
          <cylinderGeometry args={[0.6, 0.6, 7.5, 24]} ref={uv} />
        </mesh>
      ))}
      {/* AFC gates: steel cabinets, red flaps, green arrow readers */}
      {[-6, -3, 0, 3, 6].map((x) => (
        <group key={x}>
          <RoundedBox args={[0.55, 1.15, 2.2]} radius={0.08} position={[x, 0.58, 0]} material={m.steel} />
          <mesh material={m.glass} position={[x, 1.17, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.45, 0.6]} />
          </mesh>
          <mesh position={[x, 1.0, 1.11]}>
            <planeGeometry args={[0.22, 0.22]} />
            <meshBasicMaterial color={new THREE.Color("#2bff7a").multiplyScalar(1.8)} toneMapped={false} />
          </mesh>
          <mesh position={[x + 0.75, 0.85, 0]}>
            <boxGeometry args={[0.9, 0.5, 0.04]} />
            <meshStandardMaterial color={NEON} transparent opacity={0.55} emissive={NEON} emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 4.8, 1]}>
        <planeGeometry args={[14, 2.2]} />
        <meshBasicMaterial map={entry} toneMapped={false} />
      </mesh>
      <mesh position={[-13.9, 3.6, -12]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[12, 4.5]} />
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>
      {/* The token (Delhi Metro uses plastic tokens), floating beyond the gates */}
      <group ref={token} position={[0, 3, -9]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.6, 1.6, 0.18, 64]} />
          <meshStandardMaterial color="#7a0612" roughness={0.25} metalness={0.1} emissive="#9D071A" emissiveIntensity={0.6} />
        </mesh>
        <mesh material={m.neon} rotation={[0, 0, 0]}>
          <torusGeometry args={[1.62, 0.035, 8, 80]} />
        </mesh>
      </group>
      <Flag id="metro" position={[6.9, 0.5, 1.4]} />
    </group>
  );
}

/** Stylised route-map board (abstract coloured lines, not the official DMRC map). */
function metroMap() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 384;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f4f1ea";
  g.fillRect(0, 0, 1024, 384);
  const lines: [string, [number, number][]][] = [
    ["#f2c300", [[520, 20], [520, 360]]],
    ["#1f5fbf", [[40, 200], [1000, 170]]],
    ["#d6262e", [[80, 60], [420, 130], [700, 90], [980, 40]]],
    ["#7b3fa0", [[300, 360], [520, 230], [880, 330]]],
    ["#1f9e4a", [[60, 330], [380, 260]]],
    ["#f28c28", [[520, 200], [760, 250], [1000, 300]]],
  ];
  lines.forEach(([col, pts]) => {
    g.strokeStyle = col;
    g.lineWidth = 12;
    g.lineJoin = "round";
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.stroke();
    pts.forEach(([x, y]) => {
      g.fillStyle = "#fff";
      g.beginPath();
      g.arc(x, y, 9, 0, 7);
      g.fill();
      g.strokeStyle = "#222";
      g.lineWidth = 3;
      g.stroke();
    });
  });
  g.fillStyle = "#14223a";
  g.font = 'bold 30px "Segoe UI", sans-serif';
  g.fillText("राजीव चौक  RAJIV CHOWK", 540, 192);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
