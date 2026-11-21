"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { sfx } from "@/lib/scroll";
import { glowTexture, rand, type V3 } from "../util";

// Delhi traffic on a ring road (clockwise one-way, as around CP). Each vehicle type is a few InstancedMeshes
// (body / glass / wheels / lamps) driven by one matrix per vehicle. Units: 1 = 2 m, vehicle faces +z.
type Kind = "car" | "auto" | "bus" | "bike";

const BODY_COLORS: Record<Kind, string[]> = {
  car: ["#e9e9e7", "#c9ccd0", "#1b1c1f", "#8a8d92", "#7a1418", "#2b3d5c", "#e9e9e7", "#bfc3c8"],
  auto: ["#1f7a3a"],
  bus: ["#b3141c", "#2b7a3a"],
  bike: ["#1a1a1c", "#7a1418", "#2b3d5c"],
};

function shapes() {
  const rb = (w: number, h: number, d: number, r: number) => new RoundedBoxGeometry(w, h, d, 3, r);
  const wheels = (xs: number[], zs: number[], r: number, w: number, y = r) =>
    mergeGeometries(xs.flatMap((x) => zs.map((z) => new THREE.CylinderGeometry(r, r, w, 14).rotateZ(Math.PI / 2).translate(x, y, z))))!;
  const lamps = (xs: number[], y: number, z: number, s: number) => mergeGeometries(xs.map((x) => new THREE.PlaneGeometry(s, s * 0.6).translate(x, y, z)))!;
  const tails = (xs: number[], y: number, z: number, s: number) => mergeGeometries(xs.map((x) => new THREE.PlaneGeometry(s, s * 0.5).rotateY(Math.PI).translate(x, y, z)))!;
  return {
    car: {
      body: mergeGeometries([rb(0.9, 0.32, 2.15, 0.12).translate(0, 0.33, 0), rb(0.8, 0.3, 1.15, 0.12).translate(0, 0.6, -0.12)])!,
      glass: rb(0.82, 0.24, 1.0, 0.1).translate(0, 0.62, -0.12),
      wheels: wheels([-0.44, 0.44], [-0.7, 0.68], 0.16, 0.1),
      head: lamps([-0.3, 0.3], 0.38, 1.08, 0.16),
      tail: tails([-0.34, 0.34], 0.4, -1.08, 0.16),
    },
    auto: {
      body: mergeGeometries([rb(0.66, 0.38, 1.25, 0.08).translate(0, 0.38, 0), rb(0.4, 0.42, 0.25, 0.06).translate(0, 0.5, 0.6)])!,
      glass: new THREE.CylinderGeometry(0.36, 0.36, 1.0, 14, 1, true, -Math.PI / 2, Math.PI).rotateZ(Math.PI / 2).rotateY(Math.PI / 2).translate(0, 0.78, -0.08),
      wheels: mergeGeometries([wheels([-0.3, 0.3], [-0.42], 0.13, 0.08), wheels([0], [0.6], 0.13, 0.08)])!,
      head: lamps([0], 0.58, 0.74, 0.12),
      tail: tails([-0.26, 0.26], 0.35, -0.63, 0.1),
    },
    bus: {
      body: rb(1.25, 1.45, 6.0, 0.15).translate(0, 0.95, 0),
      glass: mergeGeometries([new THREE.BoxGeometry(1.27, 0.5, 5.4).translate(0, 1.25, -0.1), new THREE.BoxGeometry(1.1, 0.75, 0.04).translate(0, 1.15, 3.0)])!,
      wheels: wheels([-0.55, 0.55], [-1.8, 1.9], 0.25, 0.14),
      head: lamps([-0.45, 0.45], 0.55, 3.01, 0.18),
      tail: tails([-0.5, 0.5], 0.6, -3.01, 0.16),
    },
    bike: {
      body: mergeGeometries([new THREE.BoxGeometry(0.12, 0.28, 0.9).translate(0, 0.35, 0), new THREE.CapsuleGeometry(0.12, 0.35, 4, 8).translate(0, 0.78, -0.05), new THREE.SphereGeometry(0.12, 10, 8).translate(0, 1.12, 0)])!,
      glass: new THREE.BoxGeometry(0.01, 0.01, 0.01),
      wheels: wheels([0], [-0.36, 0.38], 0.15, 0.06),
      head: lamps([0], 0.5, 0.47, 0.1),
      tail: tails([0], 0.42, -0.46, 0.07),
    },
  } as Record<Kind, { body: THREE.BufferGeometry; glass: THREE.BufferGeometry; wheels: THREE.BufferGeometry; head: THREE.BufferGeometry; tail: THREE.BufferGeometry }>;
}

const MIX: Kind[] = ["car", "car", "car", "auto", "car", "bike", "car", "auto", "car", "bike", "car", "bus"];

/** Vehicles circling `center` in lanes at the given radii (clockwise seen from above). */
export function RingTraffic({ center, lanes, perLane = 14, speed = 4 }: { center: V3; lanes: number[]; perLane?: number; speed?: number }) {
  const geo = useMemo(() => shapes(), []);
  const mats = useMemo(
    () => ({
      body: new THREE.MeshPhysicalMaterial({ roughness: 0.32, metalness: 0.55, clearcoat: 1, clearcoatRoughness: 0.15 }),
      glass: new THREE.MeshPhysicalMaterial({ color: "#0b0f14", roughness: 0.05, metalness: 0.4, clearcoat: 1 }),
      canopy: new THREE.MeshStandardMaterial({ color: "#e0b21b", roughness: 0.6, side: THREE.DoubleSide }),
      wheels: new THREE.MeshStandardMaterial({ color: "#0e0e10", roughness: 0.8 }),
      head: new THREE.MeshBasicMaterial({ color: new THREE.Color("#fff3e0").multiplyScalar(5), toneMapped: false, side: THREE.DoubleSide }),
      tail: new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff1a24").multiplyScalar(4), toneMapped: false, side: THREE.DoubleSide }),
      beam: new THREE.MeshBasicMaterial({ map: glowTexture(), color: new THREE.Color("#fff1dc").multiplyScalar(1.4), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }),
    }),
    [],
  );
  // Same speed within a lane so vehicles never overlap; inner lanes slightly slower.
  const cars = useMemo(
    () =>
      lanes.flatMap((r, l) =>
        Array.from({ length: perLane }, (_, i) => {
          const kind = MIX[(i * 5 + l * 3) % MIX.length];
          return { kind, r, a: (i / perLane) * Math.PI * 2 + rand(i + l * 11) * 0.12 + l, w: (speed * (0.85 + l * 0.12)) / r, color: BODY_COLORS[kind][Math.floor(rand(i * 3 + l) * BODY_COLORS[kind].length)] };
        }),
      ),
    [lanes, perLane, speed],
  );
  const byKind = useMemo(() => {
    const m: Record<Kind, number[]> = { car: [], auto: [], bus: [], bike: [] };
    cars.forEach((c, i) => m[c.kind].push(i));
    return m;
  }, [cars]);
  const meshes = useMemo<Record<string, THREE.InstancedMesh | null>>(() => ({}), []);
  const o = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    const col = new THREE.Color();
    (Object.keys(byKind) as Kind[]).forEach((k) => {
      const body = meshes[`${k}-body`];
      byKind[k].forEach((ci, j) => body?.setColorAt(j, col.set(cars[ci].color)));
      if (body?.instanceColor) body.instanceColor.needsUpdate = true;
    });
  }, [byKind, cars, meshes]);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.1);
    (Object.keys(byKind) as Kind[]).forEach((k) => {
      byKind[k].forEach((ci, j) => {
        const c = cars[ci];
        c.a -= c.w * d;
        o.position.set(center[0] + Math.cos(c.a) * c.r, 0.02, center[2] + Math.sin(c.a) * c.r);
        o.rotation.set(0, -c.a + Math.PI, 0); // tangent heading for clockwise travel
        o.updateMatrix();
        ["body", "glass", "wheels", "head", "tail", "beam"].forEach((part) => meshes[`${k}-${part}`]?.setMatrixAt(j, o.matrix));
      });
      ["body", "glass", "wheels", "head", "tail", "beam"].forEach((part) => {
        const m = meshes[`${k}-${part}`];
        if (m) m.instanceMatrix.needsUpdate = true;
      });
    });
  });

  const honk = (k: Kind) => (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    sfx(k === "auto" ? "auto-horn" : k === "bike" ? "rickshaw-bell" : "car-horn");
  };
  const beam = useMemo(() => new THREE.PlaneGeometry(1.6, 3.2).rotateX(-Math.PI / 2).translate(0, 0.03, 2.4), []);

  return (
    <group>
      {(Object.keys(byKind) as Kind[]).map((k) => {
        const n = Math.max(1, byKind[k].length);
        // Ref callbacks only run after render, writing into the shared ref map.
        const set = (part: string) => (m: THREE.InstancedMesh | null) => {
          meshes[`${k}-${part}`] = m;
        };
        return (
          <group key={k}>
            <instancedMesh
              ref={set("body")}
              args={[geo[k].body, mats.body, n]}
              frustumCulled={false}
              onClick={honk(k)}
              onPointerOver={() => (document.body.style.cursor = "pointer")}
              onPointerOut={() => (document.body.style.cursor = "")}
            />
            <instancedMesh ref={set("glass")} args={[geo[k].glass, k === "auto" ? mats.canopy : mats.glass, n]} frustumCulled={false} />
            <instancedMesh ref={set("wheels")} args={[geo[k].wheels, mats.wheels, n]} frustumCulled={false} />
            <instancedMesh ref={set("head")} args={[geo[k].head, mats.head, n]} frustumCulled={false} />
            <instancedMesh ref={set("tail")} args={[geo[k].tail, mats.tail, n]} frustumCulled={false} />
            <instancedMesh ref={set("beam")} args={[beam, mats.beam, n]} frustumCulled={false} />
          </group>
        );
      })}
    </group>
  );
}
