"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Flag } from "../Flag";
import { Kites } from "../atmosphere";
import { useMats } from "../materials";
import { clearOfPath, PLACES } from "../path";
import { sfx } from "@/lib/scroll";
import { Bollards, clickable, HoloRing, Trees } from "../props";
import { arcadeWall, cylUV, flutedStorey, rand, setInstances, uv, type V3 } from "../util";

// Qutub Minar (1199–1220): 72.5 m, five storeys. 1st: alternating round and angular flutes, 2nd: round,
// 3rd: angular, 4th–5th: marble with sandstone bands. Each storey ends in a balcony on muqarnas corbels.
type Storey = { rb: number; rt: number; h: number; kind: "mixed" | "round" | "angular" | "plain"; marble?: boolean };
const STOREYS: Storey[] = [
  { rb: 4.1, rt: 3.15, h: 16.3, kind: "mixed" },
  { rb: 3.05, rt: 2.5, h: 8.6, kind: "round" },
  { rb: 2.42, rt: 2.0, h: 6.4, kind: "angular" },
  { rb: 1.95, rt: 1.65, h: 4.7, kind: "plain", marble: true },
  { rb: 1.6, rt: 1.32, h: 4.0, kind: "plain", marble: true },
];
const Q = PLACES.qutub;

function Balcony({ y, r, last }: { y: number; r: number; last?: boolean }) {
  const m = useMats();
  const corbels = useRef<THREE.InstancedMesh>(null);
  const posts = useRef<THREE.InstancedMesh>(null);
  const N = Math.round(r * 16);
  useLayoutEffect(() => {
    setInstances(corbels.current, Array.from({ length: N }, (_, i) => {
      const a = (i / N) * Math.PI * 2;
      return { p: [Math.cos(a) * (r + 0.35), y - 0.45, Math.sin(a) * (r + 0.35)] as V3, r: [0, -a, 0.5] as V3 };
    }));
    setInstances(posts.current, Array.from({ length: N }, (_, i) => {
      const a = (i / N) * Math.PI * 2;
      return { p: [Math.cos(a) * (r + 0.95), y + 0.45, Math.sin(a) * (r + 0.95)] as V3 };
    }));
  }, [N, r, y]);
  return (
    <group>
      <mesh material={m.redStone} position={[0, y, 0]}>
        <cylinderGeometry args={[r + 1.05, r + 0.7, 0.3, 64]} ref={uv} />
      </mesh>
      <instancedMesh ref={corbels} args={[undefined, m.redStoneDark, N]}>
        <boxGeometry args={[0.7, 0.55, 0.22]} />
      </instancedMesh>
      <instancedMesh ref={posts} args={[undefined, m.redStone, N]}>
        <boxGeometry args={[0.07, 0.6, 0.07]} />
      </instancedMesh>
      <mesh material={m.redStone} position={[0, y + 0.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r + 0.95, 0.06, 6, 64]} />
      </mesh>
      {!last && (
        <mesh material={m.neonSoft} position={[0, y - 0.17, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r + 0.72, 0.025, 6, 96]} />
        </mesh>
      )}
    </group>
  );
}

export function QutubMinar() {
  const m = useMats();
  const parts = useMemo(() => {
    return STOREYS.map((s, i) => {
      const base = STOREYS.slice(0, i).reduce((sum, t) => sum + t.h, 0);
      const body = flutedStorey(s.rt, s.rb, s.h, s.kind);
      // Inscription bands: slightly proud rings of darker, deeper-carved stone.
      const bands = (s.marble ? [0.5] : [0.32, 0.58, 0.82]).map((f) => {
        const r = s.rb + (s.rt - s.rb) * f + 0.08;
        return { y: base + s.h * f, g: flutedStorey(r, r, s.h * 0.035 + 0.25, s.kind) };
      });
      return { ...s, base, body, bands };
    });
  }, []);
  const screen = useMemo(
    () =>
      arcadeWall(22, 11, 1.6, [
        { x: 0, w: 5.2, spring: 5.2, pointed: true },
        { x: -6.6, w: 3.2, spring: 3.6, pointed: true },
        { x: 6.6, w: 3.2, spring: 3.6, pointed: true },
        { x: -9.9, w: 1.6, spring: 2.6, pointed: true },
        { x: 9.9, w: 1.6, spring: 2.6, pointed: true },
      ], [[11, 6.5], [9, 7.2], [7.5, 9.6], [4.2, 10.4], [3, 11.4], [0, 11.8], [-3, 11.2], [-5, 9.4], [-7.4, 8.8], [-9, 6], [-11, 5.2]]),
    [],
  );
  const ruin = useMemo(
    () => arcadeWall(10, 12, 2.2, [{ x: 0, w: 5, spring: 5.5, pointed: true }], [[5, 9.5], [3.4, 11.2], [1, 12], [-1.5, 11.4], [-3.6, 12.3], [-5, 10]]),
    [],
  );
  // Red ground spotlights ringing the base, and trees around the lawn (kept clear of the camera's approach).
  const spots = useMemo<V3[]>(() => Array.from({ length: 16 }, (_, i) => [Math.cos((i / 16) * Math.PI * 2) * 7.5, 0, Math.sin((i / 16) * Math.PI * 2) * 7.5]), []);
  const trees = useMemo<V3[]>(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2 + rand(i) * 0.2, r = 19 + rand(i + 3) * 8;
        return [Math.cos(a) * r, 0, Math.sin(a) * r] as V3;
      }).filter(([x, , z]) => clearOfPath(Q[0] + x, Q[2] + z)),
    [],
  );
  const capital = useMemo(() => cylUV(new THREE.LatheGeometry([[0.22, 0], [0.3, 0.12], [0.24, 0.3], [0.34, 0.45], [0.2, 0.6]].map(([x, y]) => new THREE.Vector2(x, y)), 24), 0.26), []);

  return (
    <group position={Q}>
      {/* Stone plinth and lawn of the Qutub complex */}
      <mesh material={m.redStone} position={[0, 0.2, 0]}>
        <cylinderGeometry args={[6.2, 6.6, 0.4, 48]} ref={uv} />
      </mesh>
      <mesh material={m.grass} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[30, 48]} />
      </mesh>

      <group position={[0, 0.4, 0]} {...clickable(() => sfx("chime"))}>
        {parts.map((s, i) => (
          <group key={i}>
            <mesh geometry={s.body} material={s.marble ? m.marble : m.redStone} position={[0, s.base + s.h / 2, 0]} />
            {s.bands.map((b, j) => (
              <mesh key={j} geometry={b.g} material={s.marble ? m.redStone : m.redStoneDark} position={[0, b.y, 0]} />
            ))}
            <Balcony y={s.base + s.h} r={s.rt} last={i === parts.length - 1} />
          </group>
        ))}
        <mesh material={m.redStone} position={[0, 40.3, 0]}>
          <cylinderGeometry args={[0.9, 1.2, 0.6, 24]} ref={uv} />
        </mesh>
      </group>

      {/* Iron Pillar (4th c.): 7 m, famously rust-free */}
      <group position={[-8, 0.4, 5]}>
        <mesh material={m.iron} position={[0, 1.8, 0]}>
          <cylinderGeometry args={[0.18, 0.22, 3.6, 24]} />
        </mesh>
        <mesh material={m.iron} geometry={capital} position={[0, 3.6, 0]} />
      </group>

      {/* Ruined arched screen of the Quwwat-ul-Islam mosque */}
      <mesh geometry={screen} material={m.redStone} position={[-13, 0, -6]} rotation={[0, 0.9, 0]} />
      {[-1, 1].map((s) => (
        <mesh key={s} material={m.redStone} position={[-13 + s * 6.2, 1.5, -6 - s * 7.8]}>
          <cylinderGeometry args={[0.35, 0.4, 3, 8]} ref={uv} />
        </mesh>
      ))}

      {/* Second ruined arch framing the right of the view, as in the reference */}
      <mesh geometry={ruin} material={m.redStone} position={[15, 0, -9]} rotation={[0, -0.75, 0]} />
      <Bollards points={spots} />
      <Trees points={trees} />
      <HoloRing center={[0, 26, 0]} radius={10} tilt={0.22} />
      <Kites center={[0, 0, 0]} count={9} height={34} />
      <Flag id="qutub" position={[3.4, 31.4, 1.2]} />
    </group>
  );
}
