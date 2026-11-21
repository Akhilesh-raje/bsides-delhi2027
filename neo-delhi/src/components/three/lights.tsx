"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll";
import type { V3 } from "./util";

// Each chapter's floodlights, in world coordinates. Only two chapters are lit at once (current + next,
// crossfaded by scroll), using a fixed pool of lights: changing the light count would recompile every shader,
// and lighting every monument at once made integrated GPUs crawl.
type Spot = { from: V3; to: V3; color: string; intensity: number; angle: number; distance: number };
type Point = { at: V3; color: string; intensity: number; distance: number };
const CH: { spots: Spot[]; points: Point[] }[] = [
  {
    // India Gate: drenched in crimson from both sides of Kartavya Path, eternal flame below
    spots: [
      { from: [-9, 0.3, 13], to: [0, 9, 0], color: "#ff1f3a", intensity: 1500, angle: 0.62, distance: 80 },
      { from: [9, 0.3, 13], to: [0, 9, 0], color: "#ff2a3a", intensity: 1300, angle: 0.62, distance: 80 },
    ],
    points: [
      { at: [0, 2.4, 0], color: "#ff7a3a", intensity: 16, distance: 12 },
      { at: [0, 3, 12], color: "#ff2a45", intensity: 35, distance: 26 },
    ],
  },
  {
    // Metro platform: warm-white station lighting (crimson only on LED accents)
    spots: [],
    points: [
      { at: [-2, 4.9, -84], color: "#ffe6c8", intensity: 90, distance: 36 },
      { at: [-2, 4.9, -108], color: "#ffe6c8", intensity: 80, distance: 36 },
    ],
  },
  {
    // Connaught Place at blue hour: warm white floods on the colonnades, amber arcade glow, a touch of crimson
    spots: [
      { from: [-12, 0.3, -158], to: [-7, 5, -171], color: "#ffd2a0", intensity: 520, angle: 0.75, distance: 45 },
      { from: [12, 0.3, -158], to: [7, 5, -171], color: "#ffd2a0", intensity: 520, angle: 0.75, distance: 45 },
    ],
    points: [
      { at: [0, 4, -171], color: "#ffb066", intensity: 55, distance: 22 },
      { at: [0, 9, -195], color: "#ff2a45", intensity: 35, distance: 26 },
    ],
  },
  {
    // Qutub Minar: crimson uplights, red spill on the ruins
    spots: [
      { from: [6, 0.4, -276], to: [0, 20, -282], color: "#ff1f3a", intensity: 1800, angle: 0.4, distance: 90 },
      { from: [-6, 0.4, -277], to: [0, 16, -282], color: "#ff3a3a", intensity: 1300, angle: 0.45, distance: 90 },
    ],
    points: [
      { at: [-10, 2, -286], color: "#ff2a45", intensity: 45, distance: 25 },
      { at: [13, 2, -289], color: "#ff2a45", intensity: 45, distance: 25 },
    ],
  },
  {
    // Chandni Chowk lane + Jama Masjid floodlit red
    spots: [
      { from: [8, 0.4, -428], to: [16, 12, -455], color: "#ff1f3a", intensity: 2200, angle: 0.65, distance: 90 },
      { from: [24, 0.4, -428], to: [16, 16, -458], color: "#ffd0c0", intensity: 500, angle: 0.5, distance: 90 },
    ],
    points: [
      { at: [0, 4.5, -332], color: "#ff2a45", intensity: 55, distance: 24 },
      { at: [0, 4.5, -349], color: "#e8a95d", intensity: 40, distance: 24 },
    ],
  },
  {
    // Jantar Mantar: crimson uplight on the Samrat Yantra, white key, warm shamiana light over the protest
    spots: [
      { from: [-12, 0.4, -486], to: [-22, 6, -503], color: "#ff1f3a", intensity: 1800, angle: 0.7, distance: 70 },
      { from: [-4, 0.5, -486], to: [-20, 8, -502], color: "#fff0e6", intensity: 600, angle: 0.55, distance: 70 },
    ],
    points: [
      { at: [-21, 3, -478], color: "#ffb070", intensity: 70, distance: 16 },
      { at: [-12, 1.5, -486], color: "#ff2a45", intensity: 45, distance: 18 },
    ],
  },
  {
    // Metro concourse
    spots: [],
    points: [
      { at: [0, 6.5, -570], color: "#e9eeff", intensity: 60, distance: 30 },
      { at: [0, 5, -560], color: "#ff2a45", intensity: 40, distance: 26 },
    ],
  },
];

const SPOTS = 2, POINTS = 2;

export function LightRig() {
  const spots = useRef<(THREE.SpotLight | null)[]>([]);
  const points = useRef<(THREE.PointLight | null)[]>([]);
  const targets = useMemo(() => Array.from({ length: SPOTS * 2 }, () => new THREE.Object3D()), []);

  useFrame(() => {
    const c = THREE.MathUtils.clamp(scrollState.chapter, 0, CH.length - 1);
    const base = Math.floor(c), f = c - base;
    [base, base + 1].forEach((ch, set) => {
      const w = set === 0 ? 1 - f : f;
      const data = CH[ch] ?? { spots: [], points: [] };
      for (let i = 0; i < SPOTS; i++) {
        const l = spots.current[set * SPOTS + i], d = data.spots[i];
        if (!l) continue;
        l.intensity = d ? d.intensity * w : 0;
        if (!d) continue;
        l.position.set(...d.from);
        l.target.position.set(...d.to);
        l.target.updateMatrixWorld();
        l.color.set(d.color);
        l.angle = d.angle;
        l.distance = d.distance;
      }
      for (let i = 0; i < POINTS; i++) {
        const l = points.current[set * POINTS + i], d = data.points[i];
        if (!l) continue;
        l.intensity = d ? d.intensity * w : 0;
        if (!d) continue;
        l.position.set(...d.at);
        l.color.set(d.color);
        l.distance = d.distance;
      }
    });
  });

  return (
    <>
      {targets.map((t, i) => (
        <primitive key={`t${i}`} object={t} />
      ))}
      {targets.map((t, i) => (
        <spotLight key={`s${i}`} ref={(l) => void (spots.current[i] = l)} target={t} penumbra={0.8} decay={1.6} />
      ))}
      {Array.from({ length: POINTS * 2 }, (_, i) => (
        <pointLight key={`p${i}`} ref={(l) => void (points.current[i] = l)} decay={1.6} />
      ))}
    </>
  );
}
