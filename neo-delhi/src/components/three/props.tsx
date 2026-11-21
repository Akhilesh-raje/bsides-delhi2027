"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Crowd, randomLook, type Pose } from "./humans";
import { useMats } from "./materials";
import { glowTexture, NEON, rand, setInstances, type V3 } from "./util";

// Street furniture and life from the reference images: lanterns, red bollards, neon edges, trees, people, HUD rings.

const pool = (color: string, k: number) =>
  new THREE.MeshBasicMaterial({ map: glowTexture(), color: new THREE.Color(color).multiplyScalar(k), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });

/** Black cast-iron Victorian lanterns (Lutyens' Delhi) with warm glass and a light pool on the ground. */
export function Lanterns({ points, height = 3.2 }: { points: V3[]; height?: number }) {
  const m = useMats();
  const pole = useRef<THREE.InstancedMesh>(null);
  const glass = useRef<THREE.InstancedMesh>(null);
  const cap = useRef<THREE.InstancedMesh>(null);
  const floor = useRef<THREE.InstancedMesh>(null);
  const poleGeo = useMemo(() => mergeGeometries([new THREE.CylinderGeometry(0.06, 0.08, height, 8).translate(0, height / 2, 0), new THREE.CylinderGeometry(0.2, 0.28, 0.9, 8).translate(0, 0.45, 0), new THREE.CylinderGeometry(0.14, 0.1, 0.12, 8).translate(0, height, 0)])!, [height]);
  const floorMat = useMemo(() => pool("#ff8a4a", 0.5), []);
  useLayoutEffect(() => {
    setInstances(pole.current, points.map((p) => ({ p })));
    setInstances(glass.current, points.map((p) => ({ p: [p[0], p[1] + height + 0.38, p[2]] })));
    setInstances(cap.current, points.map((p) => ({ p: [p[0], p[1] + height + 0.85, p[2]] })));
    setInstances(floor.current, points.map((p) => ({ p: [p[0], 0.04, p[2]], r: [-Math.PI / 2, 0, 0] })));
  }, [points, height]);
  return (
    <group>
      <instancedMesh ref={pole} args={[poleGeo, m.darkMetal, points.length]} />
      <instancedMesh ref={glass} args={[undefined, m.sodium, points.length]}>
        <cylinderGeometry args={[0.2, 0.15, 0.6, 6]} />
      </instancedMesh>
      <instancedMesh ref={cap} args={[undefined, m.darkMetal, points.length]}>
        <coneGeometry args={[0.32, 0.4, 6]} />
      </instancedMesh>
      <instancedMesh ref={floor} args={[undefined, floorMat, points.length]}>
        <planeGeometry args={[8, 8]} />
      </instancedMesh>
    </group>
  );
}

/** Low red-glowing bollards with a red light pool (path edges in every reference image). */
export function Bollards({ points }: { points: V3[] }) {
  const m = useMats();
  const post = useRef<THREE.InstancedMesh>(null);
  const lamp = useRef<THREE.InstancedMesh>(null);
  const spill = useRef<THREE.InstancedMesh>(null);
  const spillMat = useMemo(() => pool(NEON, 0.9), []);
  useLayoutEffect(() => {
    setInstances(post.current, points.map((p) => ({ p: [p[0], 0.35, p[2]] })));
    setInstances(lamp.current, points.map((p) => ({ p: [p[0], 0.62, p[2]] })));
    setInstances(spill.current, points.map((p) => ({ p: [p[0], 0.05, p[2]], r: [-Math.PI / 2, 0, 0] })));
  }, [points]);
  return (
    <group>
      <instancedMesh ref={post} args={[undefined, m.darkMetal, points.length]}>
        <boxGeometry args={[0.24, 0.7, 0.24]} />
      </instancedMesh>
      <instancedMesh ref={lamp} args={[undefined, m.neon, points.length]}>
        <boxGeometry args={[0.2, 0.3, 0.2]} />
      </instancedMesh>
      <instancedMesh ref={spill} args={[undefined, spillMat, points.length]}>
        <planeGeometry args={[2.6, 2.6]} />
      </instancedMesh>
    </group>
  );
}

/** Thin red neon strip from a to b (path and pool edges). */
export function NeonLine({ a, b, y = 0.06 }: { a: [number, number]; b: [number, number]; y?: number }) {
  const m = useMats();
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return (
    <mesh material={m.neon} position={[(a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2]} rotation={[0, Math.atan2(b[0] - a[0], b[1] - a[1]), 0]}>
      <boxGeometry args={[0.06, 0.04, len]} />
    </mesh>
  );
}

export { Trees } from "./trees";

/** People strolling back and forth along paths, at `scale` world units per metre. Click someone to make them wave. */
export function People({ paths, count = 14, scale = 0.55 }: { paths: [V3, V3][]; count?: number; scale?: number }) {
  const looks = useMemo(() => Array.from({ length: count }, (_, i) => randomLook(i * 3.7 + paths.length)), [count, paths.length]);
  const walkers = useMemo(
    () => Array.from({ length: count }, (_, i) => ({ path: i % paths.length, t: rand(i * 1.7), v: (0.006 + rand(i + 3) * 0.008) * (rand(i + 9) > 0.5 ? 1 : -1), off: (rand(i + 5) - 0.5) * 2.2, idle: rand(i + 11) > 0.8, prev: -1 })),
    [count, paths.length],
  );
  const update = (i: number, t: number, p: Pose) => {
    const w = walkers[i];
    const dt = w.prev < 0 ? 0 : t - w.prev;
    w.prev = t;
    const [a, b] = paths[w.path];
    const dx = b[0] - a[0], dz = b[2] - a[2], len = Math.hypot(dx, dz) || 1;
    if (!w.idle) w.t = (w.t + w.v * dt + 1) % 1;
    p.x = a[0] + dx * w.t + (-dz / len) * w.off;
    p.y = a[1];
    p.z = a[2] + dz * w.t + (dx / len) * w.off;
    p.yaw = Math.atan2(dx, dz) + (w.v < 0 ? Math.PI : 0);
    p.mode = w.idle ? (i % 2 ? "phone" : "idle") : "walk";
    p.speed = 1;
    p.visible = true;
  };
  return <Crowd looks={looks} update={update} scale={scale} />;
}

/** Holographic HUD rings orbiting a monument: two dashed red rings counter-rotating, tilted. */
export function HoloRing({ center, radius, tilt = 0.18 }: { center: V3; radius: number; tilt?: number }) {
  const a = useRef<THREE.Group>(null);
  const b = useRef<THREE.Group>(null);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(NEON).multiplyScalar(1.6), transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), []);
  const ticks = useRef<THREE.InstancedMesh>(null);
  const N = 120;
  useLayoutEffect(() => {
    setInstances(ticks.current, Array.from({ length: N }, (_, i) => {
      const ang = (i / N) * Math.PI * 2, long = i % 10 === 0;
      return { p: [Math.cos(ang) * radius, 0, Math.sin(ang) * radius] as V3, r: [0, -ang, 0] as V3, s: [long ? 2.2 : 1, 1, 1] as V3 };
    }));
  }, [radius]);
  useFrame((_, dt) => {
    if (a.current) a.current.rotation.y += dt * 0.08;
    if (b.current) b.current.rotation.y -= dt * 0.05;
  });
  return (
    <group position={center} rotation={[tilt, 0, tilt * 0.4]}>
      <group ref={a}>
        <mesh material={mat} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.025, 4, 160, Math.PI * 1.4]} />
        </mesh>
        <instancedMesh ref={ticks} args={[undefined, mat, N]}>
          <boxGeometry args={[0.35, 0.02, 0.04]} />
        </instancedMesh>
      </group>
      <group ref={b}>
        <mesh material={mat} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius * 1.08, 0.015, 4, 160, Math.PI * 0.9]} />
        </mesh>
        <mesh material={mat} rotation={[Math.PI / 2, 0, 2.6]}>
          <torusGeometry args={[radius * 1.08, 0.015, 4, 160, Math.PI * 0.5]} />
        </mesh>
      </group>
    </group>
  );
}

/** Pointer cursor while hovering a clickable 3D object. */
export const hover = {
  onPointerOver: () => (document.body.style.cursor = "pointer"),
  onPointerOut: () => (document.body.style.cursor = ""),
};

/** Pointer props for a clickable 3D object: pointer cursor on hover, handler on click. */
export const clickable = (fn: () => void) => ({
  onClick: (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    fn();
  },
  onPointerOver: () => (document.body.style.cursor = "pointer"),
  onPointerOut: () => (document.body.style.cursor = ""),
});

/** Points along a line every `step` units. */
export const along = (a: [number, number], b: [number, number], step: number): V3[] => {
  const n = Math.max(1, Math.floor(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
  return Array.from({ length: n + 1 }, (_, i) => [a[0] + ((b[0] - a[0]) * i) / n, 0, a[1] + ((b[1] - a[1]) * i) / n]);
};
