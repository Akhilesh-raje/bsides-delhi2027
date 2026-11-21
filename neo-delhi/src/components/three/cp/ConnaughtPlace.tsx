"use client";

import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { useFlags } from "@/lib/flags";
import { scrollState, sfx, weight } from "@/lib/scroll";
import { Flag } from "../Flag";
import { NationalFlag } from "../atmosphere";
import { useMats } from "../materials";
import { MODELS, useModelPart, usePosterImages } from "../metro/assets";
import { posterTexture } from "../metro/signs";
import { clearOfPath, PLACES, pathCrossings } from "../path";
import { HoloRing, Lanterns, People } from "../props";
import { Trees } from "../trees";
import { arcadeWall, glowTexture, NEON, rand, setInstances, signTexture, type V3 } from "../util";
import { RingTraffic } from "./vehicles";

// Connaught Place (1929–33): concentric rings of two-storey white Georgian blocks around Central Park.
// Each ring is built from one detailed colonnade bay (Tuscan columns, arches, entablature, framed upper windows,
// balustraded parapet, recessed lit shopfront) repeated around the curve, with radial roads cut through.
// World scale: 1 unit ≈ 2 m. "d" = distance in front of a ring's facade line, towards its road.
const C = PLACES.cp;
const BAY = 2.3, GAP = 9; // radial roads ~18 m wide
const RINGS = { inner: { FL: 11.4, face: -1 as const, seed: 0.2 }, outer: { FL: 25.5, face: 1 as const, seed: 0.65 } };
const LANES = { inner: [9.2, 10.2], middle: [17.3, 18.4, 19.5], outer: [27.2, 28.3, 29.3] };
const ROAD_EDGES = [[8.4, 10.9], [16.3, 20.6], [26.4, 30]] as const;

type Item = { p: V3; r?: V3; s?: V3; c?: THREE.ColorRepresentation };
const angDiff = (a: number, b: number) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
const polar = (r: number, a: number, y = 0): V3 => [C[0] + Math.cos(a) * r, y, C[2] + Math.sin(a) * r];
const hover = { onPointerOver: () => (document.body.style.cursor = "pointer"), onPointerOut: () => (document.body.style.cursor = "") };
const go = (id: string) => document.querySelector<HTMLAnchorElement>(`a[href="#${id}"]`)?.click();

/** Radial road angles: wherever the camera path crosses a ring, plus evenly spaced roads (CP has 7 radials). */
function radials(R: number, seed: number) {
  const cross = pathCrossings(C, R);
  const even = Array.from({ length: 7 }, (_, i) => (i / 7) * Math.PI * 2 + seed);
  return [...cross, ...even.filter((a) => cross.every((c) => Math.abs(angDiff(a, c)) > 0.6))];
}

function bays(FL: number, seed: number) {
  const gaps = radials(FL, seed);
  const n = Math.floor((Math.PI * 2 * FL) / BAY), step = (Math.PI * 2) / n;
  const half = GAP / 2 / FL + step / 2;
  const list = Array.from({ length: n }, (_, k) => k * step).filter((a) => gaps.every((g) => Math.abs(angDiff(a, g)) > half));
  // Run ends (where a radial road cuts the ring) get end walls.
  const ends = list.filter((a) => !list.some((b) => Math.abs(angDiff(b, a) - step) < 1e-6) || !list.some((b) => Math.abs(angDiff(b, a) + step) < 1e-6));
  return { list, step, gaps, ends };
}

// ---- Lathe-turned classical parts (metres → units already) ----
function columnGeometry() {
  const prof: [number, number][] = [[0, 0], [0.23, 0], [0.23, 0.1], [0.2, 0.12], [0.205, 0.18], [0.17, 0.2], [0.165, 0.9], [0.16, 1.6], [0.15, 2.3], [0.142, 2.62], [0.16, 2.66], [0.15, 2.7], [0.2, 2.78], [0.21, 2.82], [0, 2.82]];
  const shaft = new THREE.LatheGeometry(prof.map(([x, y]) => new THREE.Vector2(x, y)), 20);
  const abacus = new THREE.BoxGeometry(0.46, 0.08, 0.46).translate(0, 2.86, 0);
  const plinth = new THREE.BoxGeometry(0.48, 0.08, 0.48).translate(0, 0.04, 0);
  return mergeGeometries([shaft.toNonIndexed(), abacus.toNonIndexed(), plinth.toNonIndexed()])!;
}
const balusterGeometry = () =>
  new THREE.LatheGeometry([[0, 0], [0.07, 0], [0.07, 0.04], [0.05, 0.07], [0.085, 0.2], [0.06, 0.33], [0.035, 0.38], [0.06, 0.42], [0.06, 0.46], [0, 0.46]].map(([x, y]) => new THREE.Vector2(x, y)), 10);

function windowFrame(w: number, h: number) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 - 0.09, -h / 2 - 0.09);
  s.lineTo(w / 2 + 0.09, -h / 2 - 0.09);
  s.lineTo(w / 2 + 0.09, h / 2 + 0.09);
  s.lineTo(-w / 2 - 0.09, h / 2 + 0.09);
  s.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-w / 2, -h / 2);
  hole.lineTo(w / 2, -h / 2);
  hole.lineTo(w / 2, h / 2);
  hole.lineTo(-w / 2, h / 2);
  hole.closePath();
  s.holes.push(hole);
  // Glazing bars (sash window)
  const bars = [new THREE.BoxGeometry(0.03, h, 0.03), new THREE.BoxGeometry(w, 0.03, 0.03).translate(0, h * 0.18, 0), new THREE.BoxGeometry(w, 0.03, 0.03).translate(0, -h * 0.18, 0)];
  return mergeGeometries([new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: false }).toNonIndexed(), ...bars.map((b) => b.toNonIndexed())])!;
}

// ---- Textures ----
function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
/** Lit shop interior seen through the glass: warm back light, shelves, display tables, blurred highlights. */
const shopInterior = () =>
  canvasTex(256, 256, (g) => {
    const grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, "#fff1d8");
    grd.addColorStop(0.55, "#d9a46a");
    grd.addColorStop(1, "#5a3a22");
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    g.fillStyle = "rgba(60,35,20,0.55)";
    [60, 110, 160].forEach((y) => g.fillRect(14, y, 228, 6));
    for (let i = 0; i < 40; i++) {
      g.fillStyle = `hsla(${(i * 47) % 360},40%,${35 + (i % 4) * 10}%,0.8)`;
      g.fillRect(16 + ((i * 37) % 220), 30 + Math.floor(i / 10) * 50, 10 + (i % 3) * 6, 26);
    }
    g.fillStyle = "rgba(40,25,15,0.7)";
    g.fillRect(70, 200, 116, 40);
    for (let i = 0; i < 6; i++) {
      const r = g.createRadialGradient(30 + i * 40, 12, 0, 30 + i * 40, 12, 26);
      r.addColorStop(0, "rgba(255,255,240,0.9)");
      r.addColorStop(1, "rgba(255,255,240,0)");
      g.fillStyle = r;
      g.fillRect(0, 0, 256, 60);
    }
  });
const shutterTex = () =>
  canvasTex(64, 256, (g) => {
    for (let y = 0; y < 256; y += 8) {
      g.fillStyle = y % 16 ? "#5d6066" : "#7a7d83";
      g.fillRect(0, y, 64, 8);
      g.fillStyle = "rgba(0,0,0,0.35)";
      g.fillRect(0, y + 7, 64, 1);
    }
  });
const grassTex = () => {
  const t = canvasTex(256, 256, (g) => {
    g.fillStyle = "#2f4a22";
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 9000; i++) {
      g.fillStyle = ["#3a5a28", "#26401b", "#45692e", "#22361a", "#517a36"][i % 5];
      g.fillRect(rand(i) * 256, rand(i + 0.5) * 256, 1.5, 3);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(10, 10);
  return t;
};

const SHOPS: [string, string][] = [
  ["कैफ़े 1931", "Café 1931"], ["लुटियंस बुक्स", "Lutyens Books"], ["खादी स्टोर", "Khadi Store"], ["जनपथ सिल्क्स", "Janpath Silks"],
  ["ऑप्टिक पॉइंट", "Optic Point"], ["चाय और कोड", "Chai & Code"], ["रायसीना", "Raisina Restaurant"], ["पश्मीना हाउस", "Pashmina House"],
  ["मोबाइल हब", "Mobile Hub"], ["कुल्फ़ी कॉर्नर", "Kulfi Corner"], ["भारत वॉच कं.", "Bharat Watch Co."], ["दिल्ली स्वीट्स", "Delhi Sweets"],
];
const BLOCKS = "ABCDEFGHKLMN".split("");

function useCpMaterials() {
  const m = useMats();
  const pave = useTexture({ map: "/assets/textures/metro/granite_tile/diff.webp", normalMap: "/assets/textures/metro/granite_tile/nor_gl.webp" });
  return useMemo(() => {
    const paveMap = pave.map.clone(), paveNor = pave.normalMap.clone();
    [paveMap, paveNor].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(1.2, 1.2);
      t.needsUpdate = true;
    });
    paveMap.colorSpace = THREE.SRGBColorSpace;
    const plaster = (c: string, rough = 0.85) => {
      const x = m.stucco.clone();
      x.color.set(c);
      x.roughness = rough;
      return x;
    };
    return {
      m,
      wall: plaster("#ffffff"), // per-instance tint gives aged variation
      trim: plaster("#f4f0e6", 0.6),
      back: plaster("#bdb4a6"),
      soffit: plaster("#9a9286"),
      paving: new THREE.MeshStandardMaterial({ map: paveMap, normalMap: paveNor, color: "#8f8a84", roughness: 0.55 }),
      kerb: new THREE.MeshStandardMaterial({ color: "#6d6862", roughness: 0.8 }),
      grass: new THREE.MeshStandardMaterial({ map: grassTex(), roughness: 1 }),
      shop: new THREE.MeshBasicMaterial({ map: shopInterior(), toneMapped: false }),
      shutter: new THREE.MeshStandardMaterial({ map: shutterTex(), metalness: 0.6, roughness: 0.5 }),
      frame: new THREE.MeshStandardMaterial({ color: "#1a1b1e", metalness: 0.6, roughness: 0.4 }),
      winGlass: new THREE.MeshPhysicalMaterial({ roughness: 0.08, metalness: 0.2, clearcoat: 1 }), // per-instance: dark or lit
      awning: new THREE.MeshStandardMaterial({ roughness: 0.9, side: THREE.DoubleSide }),
      downlight: new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffc98a").multiplyScalar(3), toneMapped: false }),
      paint: new THREE.MeshBasicMaterial({ color: "#d9d6cf" }),
      water: new THREE.MeshPhysicalMaterial({ color: "#0d1a24", roughness: 0.02, metalness: 0.1, clearcoat: 1, transparent: true, opacity: 0.9 }),
    };
  }, [m, pave.map, pave.normalMap]);
}
type CpMats = ReturnType<typeof useCpMaterials>;

/** One ring of colonnaded blocks. */
function Ring({ M, FL, face, seed, accent }: { M: CpMats; FL: number; face: 1 | -1; seed: number; accent: boolean }) {
  const { list, step, ends } = useMemo(() => bays(FL, seed), [FL, seed]);
  const w = step * FL;
  const at = (a: number, lx: number, y: number, d: number, flip = false): Item => {
    const R = FL + face * d, nx = Math.cos(a), nz = Math.sin(a), tx = Math.sin(a), tz = -Math.cos(a);
    return { p: [C[0] + nx * R + tx * lx, y, C[2] + nz * R + tz * lx], r: [0, Math.PI / 2 - a + (face < 0 !== flip ? Math.PI : 0), 0] };
  };
  const geo = useMemo(
    () => ({
      column: columnGeometry(),
      arch: arcadeWall(w, 1.3, 0.45, [{ x: 0, w: w - 0.44, spring: 0.12 }]),
      baluster: balusterGeometry(),
      frame: windowFrame(0.85, 1.55),
      awning: new THREE.BoxGeometry(w * 0.8, 0.04, 0.75).rotateX(0.35),
      shopFrame: mergeGeometries([new THREE.BoxGeometry(w * 0.84, 0.07, 0.06).translate(0, 1.2, 0), new THREE.BoxGeometry(w * 0.84, 0.07, 0.06).translate(0, -1.2, 0), new THREE.BoxGeometry(0.05, 2.4, 0.06), new THREE.BoxGeometry(0.06, 2.4, 0.06).translate(-w * 0.42, 0, 0), new THREE.BoxGeometry(0.06, 2.4, 0.06).translate(w * 0.42, 0, 0)])!,
    }),
    [w],
  );
  const signs = useMemo(() => SHOPS.map(([hi, en]) => signTexture(hi, en, { w: 512, h: 128, fg: "#fff4e0", bg: "#141114", border: "none", sub: "#e8c690" })), []);
  const signMats = useMemo(() => signs.map((map) => new THREE.MeshBasicMaterial({ map, toneMapped: false, color: "#d8d8d8" })), [signs]);

  const items = useMemo(() => {
    const I = (fn: (a: number, i: number) => Item | Item[] | null) => list.flatMap((a, i) => fn(a, i) ?? []);
    const tint = (i: number, base = 0.93) => new THREE.Color().setHSL(0.11, 0.18, base + rand(i * 7.3 + FL) * 0.06);
    const closed = (i: number) => rand(i * 3.3 + FL) > 0.72;
    return {
      floor: I((a) => at(a, 0, 0.09, -0.7)),
      step: I((a) => at(a, 0, 0.05, 0.45)),
      columns: I((a, i) => ({ ...at(a - step / 2, 0, 0.18, 0), c: tint(i, 0.92) })),
      arches: I((a, i) => ({ ...at(a, 0, 3.0, 0), c: tint(i) })),
      keystones: I((a) => at(a, 0, 4.06, 0.06)),
      entab: I((a) => at(a, 0, 4.42, 0.1)),
      lip: I((a) => at(a, 0, 4.58, 0.14)),
      soffit: I((a) => at(a, 0, 4.25, -0.75)),
      downlights: I((a) => ({ ...at(a, 0, 4.2, -0.65), r: [Math.PI / 2, 0, 0] as V3 })),
      shopWall: I((a) => at(a, 0, 2.15, -1.75)),
      shopGlass: I((a, i) => (closed(i) ? null : { ...at(a, 0, 1.45, -1.64), c: new THREE.Color().setHSL(0.08 + rand(i) * 0.05, 0.5, 0.45 + rand(i + 2) * 0.25) })),
      shutters: I((a, i) => (closed(i) ? at(a, 0, 1.45, -1.63) : null)),
      shopFrames: I((a) => at(a, 0, 1.45, -1.6)),
      awnings: I((a, i) => (!closed(i) && rand(i * 5.1 + FL) > 0.55 ? { ...at(a, 0, 2.75, -1.3), c: ["#7a1418", "#1f3d2a", "#2b2f4a", "#6a4a1e"][i % 4] } : null)),
      signs: SHOPS.map((_, k) => I((a, i) => (i % SHOPS.length === k ? at(a, 0, 3.05, -1.56) : null))),
      upper: I((a, i) => ({ ...at(a, 0, 6.1, 0), c: tint(i) })),
      pilasters: I((a) => at(a - step / 2, 0, 6.1, 0.18)),
      winLit: I((a, i) => (rand(i * 2.1 + FL) > 0.55 ? { ...at(a, 0, 6.0, 0.16), c: new THREE.Color("#ffc58a").multiplyScalar(0.9) } : null)),
      winDark: I((a, i) => (rand(i * 2.1 + FL) > 0.55 ? null : { ...at(a, 0, 6.0, 0.16), c: "#10141a" })),
      winFrames: I((a) => at(a, 0, 6.0, 0.15)),
      sills: I((a) => at(a, 0, 5.15, 0.22)),
      hoods: I((a) => at(a, 0, 6.88, 0.22)),
      cornice: I((a) => at(a, 0, 7.72, 0.12)),
      parapetBase: I((a) => at(a, 0, 7.9, 0.05)),
      rail: I((a) => at(a, 0, 8.48, 0.05)),
      piers: I((a) => at(a - step / 2, 0, 8.2, 0.05)),
      balusters: I((a) => [-0.36, -0.18, 0, 0.18, 0.36].map((f) => at(a, f * w * 1.1, 7.96, 0.05))),
      mass: I((a, i) => ({ ...at(a, 0, 3.8, -3.1), c: tint(i, 0.85) })),
      roof: I((a) => at(a, 0, 7.66, -2.2)),
      backWin: I((a, i) => [-0.5, 0.5].flatMap((lx, k) => [2.2, 5.6].map((y, j) => ({ ...at(a, lx * w * 0.6, y, -4.56, true), c: rand(i * 4 + k + j * 2 + FL) > 0.6 ? "#ffb070" : "#0b0d10" }) as Item))),
      neon: accent ? I((a) => at(a, 0, 4.3, 0.29)) : [],
      endWalls: ends.flatMap((a) => {
        const side = list.some((b) => Math.abs(angDiff(b, a) - step) < 1e-6) ? -1 : 1;
        return [at(a + (side * step) / 2, 0, 4.2, -2.1)];
      }),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `at` depends only on FL/face
  }, [list, step, ends, FL, face, w, accent]);

  return (
    <group>
      <SetInst items={items.floor} material={M.paving}>
        <boxGeometry args={[w, 0.18, 2.1]} />
      </SetInst>
      <SetInst items={items.step} material={M.paving}>
        <boxGeometry args={[w, 0.1, 0.4]} />
      </SetInst>
      <SetInst items={items.columns} material={M.wall} geometry={geo.column} />
      <SetInst items={items.arches} material={M.wall} geometry={geo.arch} />
      <SetInst items={items.keystones} material={M.trim}>
        <boxGeometry args={[0.22, 0.34, 0.5]} />
      </SetInst>
      <SetInst items={items.entab} material={M.trim}>
        <boxGeometry args={[w, 0.24, 0.72]} />
      </SetInst>
      <SetInst items={items.lip} material={M.trim}>
        <boxGeometry args={[w, 0.08, 0.86]} />
      </SetInst>
      <SetInst items={items.soffit} material={M.soffit}>
        <boxGeometry args={[w, 0.08, 2.0]} />
      </SetInst>
      <SetInst items={items.downlights} material={M.downlight}>
        <circleGeometry args={[0.09, 12]} />
      </SetInst>
      <SetInst items={items.shopWall} material={M.back}>
        <boxGeometry args={[w, 4.3, 0.2]} />
      </SetInst>
      <SetInst items={items.shopGlass} material={M.shop}>
        <planeGeometry args={[w * 0.84, 2.4]} />
      </SetInst>
      <SetInst items={items.shutters} material={M.shutter}>
        <planeGeometry args={[w * 0.84, 2.4]} />
      </SetInst>
      <SetInst items={items.shopFrames} material={M.frame} geometry={geo.shopFrame} />
      <SetInst items={items.awnings} material={M.awning} geometry={geo.awning} />
      {items.signs.map((it, k) => (
        <SetInst key={k} items={it} material={signMats[k]}>
          <boxGeometry args={[w * 0.82, 0.42, 0.06]} />
        </SetInst>
      ))}
      <SetInst items={items.upper} material={M.wall}>
        <boxGeometry args={[w, 3.2, 0.3]} />
      </SetInst>
      <SetInst items={items.pilasters} material={M.trim}>
        <boxGeometry args={[0.32, 3.1, 0.1]} />
      </SetInst>
      <SetInst items={items.winLit} material={M.shop}>
        <planeGeometry args={[0.85, 1.55]} />
      </SetInst>
      <SetInst items={items.winDark} material={M.winGlass}>
        <planeGeometry args={[0.85, 1.55]} />
      </SetInst>
      <SetInst items={items.winFrames} material={M.trim} geometry={geo.frame} />
      <SetInst items={items.sills} material={M.trim}>
        <boxGeometry args={[1.08, 0.08, 0.2]} />
      </SetInst>
      <SetInst items={items.hoods} material={M.trim}>
        <boxGeometry args={[1.16, 0.1, 0.22]} />
      </SetInst>
      <SetInst items={items.cornice} material={M.trim}>
        <boxGeometry args={[w, 0.24, 0.78]} />
      </SetInst>
      <SetInst items={items.parapetBase} material={M.trim}>
        <boxGeometry args={[w, 0.12, 0.32]} />
      </SetInst>
      <SetInst items={items.balusters} material={M.trim} geometry={geo.baluster} />
      <SetInst items={items.rail} material={M.trim}>
        <boxGeometry args={[w, 0.1, 0.34]} />
      </SetInst>
      <SetInst items={items.piers} material={M.trim}>
        <boxGeometry args={[0.3, 0.72, 0.38]} />
      </SetInst>
      <SetInst items={items.mass} material={M.wall}>
        <boxGeometry args={[w, 7.6, 2.8]} />
      </SetInst>
      <SetInst items={items.roof} material={M.soffit}>
        <boxGeometry args={[w, 0.12, 4.7]} />
      </SetInst>
      <SetInst items={items.backWin} material={M.shop}>
        <planeGeometry args={[0.7, 1.2]} />
      </SetInst>
      <SetInst items={items.endWalls} material={M.back}>
        <boxGeometry args={[0.3, 8.4, 4.9]} />
      </SetInst>
      {items.neon.length > 0 && (
        <SetInst items={items.neon} material={M.m.neonSoft}>
          <boxGeometry args={[w, 0.025, 0.025]} />
        </SetInst>
      )}
      <BlockPlaques M={M} ends={ends} at={at} step={step} list={list} />
    </group>
  );
}

/** "A Block", "B Block"… plaques on the corner piers where radial roads cut the rings (click to light one up). */
function BlockPlaques({ M, ends, at, step, list }: { M: CpMats; ends: number[]; at: (a: number, lx: number, y: number, d: number) => Item; step: number; list: number[] }) {
  const tex = useMemo(() => BLOCKS.map((b) => signTexture(`${b} ब्लॉक`, `${b} Block`, { w: 256, h: 128, fg: "#1a1a1a", bg: "#e9e2cf", border: "#1a1a1a", sub: "#7a1418" })), []);
  return (
    <>
      {ends.slice(0, BLOCKS.length).map((a, k) => {
        const side = list.some((b) => Math.abs(angDiff(b, a) - step) < 1e-6) ? -1 : 1;
        const it = at(a + (side * step) / 2, 0, 3.4, 0.27);
        return <Plaque key={k} M={M} map={tex[k]} it={it} />;
      })}
    </>
  );
}
function Plaque({ M, map, it }: { M: CpMats; map: THREE.Texture; it: Item }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map, toneMapped: false, color: "#9a9a9a" }), [map]);
  const glow = useRef(0);
  useFrame((_, dt) => {
    glow.current = Math.max(0, glow.current - dt * 0.5);
    mat.color.setScalar(0.6 + glow.current * 0.9);
  });
  return (
    <mesh
      position={it.p}
      rotation={it.r}
      material={mat}
      onClick={(e) => {
        e.stopPropagation();
        glow.current = 1;
        sfx("chime");
      }}
      {...hover}
    >
      <planeGeometry args={[0.5, 0.25]} />
      <mesh material={M.frame} position={[0, 0, -0.02]}>
        <boxGeometry args={[0.56, 0.31, 0.03]} />
      </mesh>
    </mesh>
  );
}

/** Pavements, kerbs, lane dashes and zebra crossings. Road surfaces are the wet reflective ground itself. */
function Streets({ M }: { M: CpMats }) {
  const dash = useRef<THREE.InstancedMesh>(null);
  const zebra = useRef<THREE.InstancedMesh>(null);
  const pavements: [number, number][] = [[8.0, 8.4], [10.9, 11.4], [15.9, 16.3], [20.6, 21.0], [25.95, 26.4], [30, 31.6]];
  const { dashes, stripes } = useMemo(() => {
    const dashes: Item[] = [];
    ROAD_EDGES.forEach(([r0, r1], k) => {
      const lanes = k === 0 ? [r0 + (r1 - r0) / 2] : [r0 + (r1 - r0) / 3, r0 + ((r1 - r0) * 2) / 3];
      lanes.forEach((r) => {
        const n = Math.floor((Math.PI * 2 * r) / 2);
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          dashes.push({ p: polar(r, a, 0.025), r: [-Math.PI / 2, 0, -a] });
        }
      });
    });
    // Zebra crossings across each ring road where a radial road meets it.
    const stripes: Item[] = [];
    ROAD_EDGES.forEach(([r0, r1], k) => {
      const ra = radials(k === 0 ? RINGS.inner.FL : RINGS.outer.FL, k === 0 ? RINGS.inner.seed : RINGS.outer.seed);
      ra.forEach((a) => {
        for (let r = r0 + 0.3; r < r1 - 0.2; r += 0.5) stripes.push({ p: polar(r, a, 0.026), r: [-Math.PI / 2, 0, -a] });
      });
    });
    return { dashes, stripes };
  }, []);
  useLayoutEffect(() => {
    setInstances(dash.current, dashes);
    setInstances(zebra.current, stripes);
  }, [dashes, stripes]);
  return (
    <group>
      {pavements.map(([r0, r1]) => (
        <group key={r0}>
          <mesh material={M.paving} rotation={[-Math.PI / 2, 0, 0]} position={[C[0], 0.12, C[2]]}>
            <ringGeometry args={[r0, r1, 160, 1]} />
          </mesh>
          {[r0, r1].map((r) => (
            <mesh key={r} material={M.kerb} position={[C[0], 0.06, C[2]]}>
              <cylinderGeometry args={[r, r, 0.12, 160, 1, true]} />
            </mesh>
          ))}
        </group>
      ))}
      <instancedMesh ref={dash} args={[undefined, M.paint, dashes.length]}>
        <planeGeometry args={[0.07, 1.0]} />
      </instancedMesh>
      <instancedMesh ref={zebra} args={[undefined, M.paint, stripes.length]}>
        <planeGeometry args={[0.25, 2.2]} />
      </instancedMesh>
    </group>
  );
}

/** Traffic signal: red / amber / green cycle; click to change it. */
function Signal({ M, position, yaw, phase }: { M: CpMats; position: V3; yaw: number; phase: number }) {
  const lamps = useMemo(() => ["#ff2030", "#ffa21a", "#25e07a"].map(() => new THREE.MeshBasicMaterial({ toneMapped: false })), []);
  const t = useRef(phase);
  useFrame((_, dt) => {
    t.current = (t.current + dt) % 14;
    const s = t.current < 6 ? 0 : t.current < 12 ? 2 : 1;
    lamps.forEach((l, i) => l.color.set(["#ff2030", "#ffa21a", "#25e07a"][i]).multiplyScalar(i === s ? 3 : 0.08));
  });
  return (
    <group position={position} rotation={[0, yaw, 0]} onClick={(e) => (e.stopPropagation(), (t.current = (t.current + 6) % 14), sfx("chime"))} {...hover}>
      <mesh material={M.frame} position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 3.2, 8]} />
      </mesh>
      <mesh material={M.frame} position={[0, 2.9, 0.12]}>
        <boxGeometry args={[0.28, 0.8, 0.2]} />
      </mesh>
      {lamps.map((l, i) => (
        <mesh key={i} material={l} position={[0, 3.15 - i * 0.25, 0.225]}>
          <circleGeometry args={[0.08, 14]} />
        </mesh>
      ))}
    </group>
  );
}

/** Central Park: lawns, paths, low wall, benches, fountain, flag, Rajiv Chowk entrance, Palika Bazaar terminal, beacon. */
function CentralPark({ M }: { M: CpMats }) {
  const seat = useModelPart(MODELS.bench, "seat_bench", null);
  const legs = useModelPart(MODELS.bench, "legs_double", null);
  const spokes = useMemo(() => radials(RINGS.inner.FL, RINGS.inner.seed), []);
  const items = useMemo(() => {
    const free = (a: number, tol = 0.18) => spokes.every((s) => Math.abs(angDiff(a, s)) > tol);
    const benches = Array.from({ length: 14 }, (_, i) => (i / 14) * Math.PI * 2 + 0.1).filter((a) => free(a, 0.3));
    const S = 0.5;
    return {
      wall: Array.from({ length: 120 }, (_, i) => (i / 120) * Math.PI * 2).filter((a) => free(a, 0.12)).map((a) => ({ p: polar(7.85, a, 0.2), r: [0, -a, 0] }) as Item),
      seats: benches.map((a) => ({ p: polar(5.85, a, 0.45 * S), r: [0, -a, 0], s: [S, S, S] }) as Item),
      legs: benches.flatMap((a) => [-0.85, 0.85].map((d) => ({ p: polar(5.85, a + d * S / 5.85, 0), r: [0, -a, 0], s: [S, S, S] }) as Item)),
      lamps: Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2 + 0.26).filter((a) => free(a, 0.2)).map((a) => polar(6.7, a)),
      trees: Array.from({ length: 16 }, (_, i) => (i / 16) * Math.PI * 2 + 0.13).filter((a) => free(a, 0.35)).map((a) => polar(7.1, a)).filter(([x, , z]) => clearOfPath(x, z, 3)),
    };
  }, [spokes]);
  const metroSign = useMemo(() => signTexture("राजीव चौक मेट्रो", "Rajiv Chowk Metro · Gate 7", { w: 768, h: 192, fg: "#ffffff", bg: "#101826", border: NEON, sub: "#ffd23f" }), []);
  const palikaSign = useMemo(() => signTexture("पालिका बाज़ार", "Palika Bazaar", { w: 512, h: 160, fg: "#ffe9c0", bg: "#2a0b0b", border: "#ffd27a", sub: "#ffffff" }), []);
  const metroA = Math.PI / 2 + 0.75, palikaA = Math.PI / 2 - 0.75;
  return (
    <group>
      <mesh material={M.grass} rotation={[-Math.PI / 2, 0, 0]} position={[C[0], 0.1, C[2]]}>
        <circleGeometry args={[8, 96]} />
      </mesh>
      <mesh material={M.paving} rotation={[-Math.PI / 2, 0, 0]} position={[C[0], 0.11, C[2]]}>
        <ringGeometry args={[4.9, 5.6, 128]} />
      </mesh>
      <mesh material={M.paving} rotation={[-Math.PI / 2, 0, 0]} position={[C[0], 0.11, C[2]]}>
        <circleGeometry args={[2.2, 48]} />
      </mesh>
      {spokes.map((a) => (
        <mesh key={a} material={M.paving} rotation={[-Math.PI / 2, 0, -a + Math.PI / 2]} position={polar(5.1, a, 0.112)}>
          <planeGeometry args={[1.1, 5.8]} />
        </mesh>
      ))}
      <SetInst items={items.wall} material={M.kerb}>
        <boxGeometry args={[0.18, 0.4, 0.42]} />
      </SetInst>
      {seat.map((pt, i) => (
        <SetInst key={i} items={items.seats} material={pt.material} geometry={pt.geometry} />
      ))}
      {legs.map((pt, i) => (
        <SetInst key={i} items={items.legs} material={pt.material} geometry={pt.geometry} />
      ))}
      <Lanterns points={items.lamps} />
      <Trees points={items.trees} scale={0.9} />
      <NationalFlag position={[C[0], 0, C[2]]} pole={31} size={[9, 6]} />
      <Fountain M={M} position={polar(3.4, Math.PI * 1.2, 0.1)} />
      {/* Rajiv Chowk Metro entrance: glass canopy over the stairs, with a link node back to the Metro chapter */}
      <group position={polar(6.4, metroA, 0.1)} rotation={[0, -metroA + Math.PI / 2, 0]}>
        {[[-0.9, -1.2], [0.9, -1.2], [-0.9, 1.2], [0.9, 1.2]].map(([x, z]) => (
          <mesh key={`${x}${z}`} material={M.m.steel} position={[x, 1.1, z]}>
            <boxGeometry args={[0.07, 2.2, 0.07]} />
          </mesh>
        ))}
        <mesh material={M.m.glass} position={[0, 2.25, 0]} rotation={[0.08, 0, 0]}>
          <boxGeometry args={[2.1, 0.05, 2.8]} />
        </mesh>
        <mesh material={M.paint} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.7, 2.4]} />
        </mesh>
        <mesh position={[0, 0.03, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.4, 2.0]} />
          <meshBasicMaterial color="#020203" />
        </mesh>
        <mesh position={[0, 2.6, -1.25]}>
          <planeGeometry args={[2.0, 0.5]} />
          <meshBasicMaterial map={metroSign} toneMapped={false} />
        </mesh>
        <Node position={[0, 1.4, -1.3]} onClick={() => go("about")} />
      </group>
      {/* Palika Bazaar: domed entrance to the underground market, with a terminal hiding a flag */}
      <group position={polar(6.2, palikaA, 0.1)} rotation={[0, -palikaA + Math.PI / 2, 0]}>
        <mesh material={M.wall} position={[0, 0.6, 0]}>
          <cylinderGeometry args={[1.25, 1.35, 1.2, 8]} />
        </mesh>
        <mesh material={M.trim} position={[0, 1.2, 0]} scale={[1, 0.45, 1]}>
          <sphereGeometry args={[1.3, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh position={[0, 1.6, -1.25]}>
          <planeGeometry args={[1.6, 0.5]} />
          <meshBasicMaterial map={palikaSign} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.55, -1.3]}>
          <planeGeometry args={[0.8, 1.0]} />
          <meshBasicMaterial color="#060505" />
        </mesh>
        <Terminal position={[1.45, 0, -0.4]} />
      </group>
      <Beacon position={polar(4.2, -0.6, 0.1)} />
    </group>
  );
}

function SetInst({ items, material, geometry, children }: { items: Item[]; material: THREE.Material; geometry?: THREE.BufferGeometry; children?: React.ReactNode }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  // Re-run when the mesh is rebuilt (new material/geometry), not just when the items change.
  useLayoutEffect(() => setInstances(ref.current, items), [items, material, geometry]);
  return (
    <instancedMesh ref={ref} args={[geometry, material, Math.max(1, items.length)]}>
      {children}
    </instancedMesh>
  );
}

/** Pulsing crimson node — the cyber layer's hotspots. */
export function Node({ position, onClick }: { position: V3; onClick: () => void }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: NEON, toneMapped: false }), []);
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const k = 1.5 + Math.sin(clock.elapsedTime * 3) * 1.2;
    mat.color.set(NEON).multiplyScalar(k);
    ref.current?.rotation.set(clock.elapsedTime, clock.elapsedTime * 0.7, 0);
  });
  return (
    <mesh ref={ref} position={position} material={mat} onClick={(e) => (e.stopPropagation(), sfx("chime"), onClick())} {...hover}>
      <octahedronGeometry args={[0.16]} />
    </mesh>
  );
}

/** Palika Bazaar terminal: green-on-black prompt; clicking it captures a hidden flag. */
function Terminal({ position }: { position: V3 }) {
  const find = useFlags((s) => s.find);
  const { tex, draw } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 192;
    const g = c.getContext("2d")!;
    const tex = new THREE.CanvasTexture(c);
    const draw = (cursor: boolean, unlocked: boolean) => {
      g.fillStyle = "#020604";
      g.fillRect(0, 0, 256, 192);
      g.fillStyle = unlocked ? "#ff4a5a" : "#3cff8a";
      g.font = "16px ui-monospace, Consolas, monospace";
      ["PALIKA-NET v1.9", "> ls /underground", "  stalls/ tunnels/ ???", unlocked ? "> flag captured ✔" : "> access_", ""].forEach((l, i) => g.fillText(l + (i === 3 && cursor && !unlocked ? "█" : ""), 12, 30 + i * 30));
      tex.needsUpdate = true;
    };
    draw(true, false);
    return { tex, draw };
  }, []);
  const unlocked = useFlags((s) => s.found.includes("palika"));
  const last = useRef(-1);
  useFrame(({ clock }) => {
    const b = Math.floor(clock.elapsedTime * 2) % 2 === 0;
    if (b === (last.current === 1)) return;
    last.current = b ? 1 : 0;
    draw(b, unlocked);
  });
  return (
    <group position={position} onClick={(e) => (e.stopPropagation(), find("palika"), sfx("chime"))} {...hover}>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.45, 1.1, 0.3]} />
        <meshStandardMaterial color="#1a1b1e" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.9, -0.16]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.38, 0.28]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Hidden Central Park beacon: click to send a crimson light pillar into the sky. */
export function Beacon({ position }: { position: V3 }) {
  const on = useRef(0);
  const pillar = useMemo(() => new THREE.MeshBasicMaterial({ map: glowTexture(), color: new THREE.Color(NEON).multiplyScalar(2), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide }), []);
  useFrame((_, dt) => {
    on.current = Math.max(0, on.current - dt * 0.12);
    pillar.opacity = on.current;
  });
  return (
    <group position={position}>
      <Node position={[0, 0.35, 0]} onClick={() => (on.current = 1)} />
      <mesh material={pillar} position={[0, 20, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 40, 12, 1, true]} />
      </mesh>
    </group>
  );
}

/** Small round fountain with animated water jets. */
function Fountain({ M, position }: { M: CpMats; position: V3 }) {
  const ref = useRef<THREE.Points>(null);
  const N = 260;
  const data = useMemo(() => Array.from({ length: N }, (_, i) => ({ a: rand(i) * Math.PI * 2, v: 2.2 + rand(i + 0.3) * 0.8, t: rand(i + 0.6) * 1.2 })), []);
  const pos = useMemo(() => new Float32Array(N * 3), []);
  useFrame((_, dt) => {
    const p = ref.current;
    if (!p) return;
    data.forEach((d, i) => {
      d.t = (d.t + Math.min(dt, 0.05)) % 1.2;
      const r = d.t * 0.35;
      pos[i * 3] = Math.cos(d.a) * r;
      pos[i * 3 + 1] = 0.35 + d.v * d.t - 4.9 * d.t * d.t;
      pos[i * 3 + 2] = Math.sin(d.a) * r;
    });
    p.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <group position={position}>
      <mesh material={M.kerb} position={[0, 0.15, 0]}>
        <cylinderGeometry args={[1.3, 1.35, 0.3, 40, 1, true]} />
      </mesh>
      <mesh material={M.water} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.22, 0]}>
        <circleGeometry args={[1.28, 40]} />
      </mesh>
      <mesh material={M.trim} position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.18, 0.25, 0.3, 16]} />
      </mesh>
      <points ref={ref} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pos, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#dfefff" transparent opacity={0.75} depthWrite={false} />
      </points>
    </group>
  );
}

/** Rooftop billboards on the outer circle (CP is famous for them) showing the event posters. */
function Billboards({ M }: { M: CpMats }) {
  const imgs = usePosterImages();
  const tex = useMemo(() => [posterTexture(imgs["india-gate"].image as HTMLImageElement, "SECURE · BUILD · DEFEND", "BSides Delhi 2027 — get your pass →"), posterTexture(imgs.masjid.image as HTMLImageElement, "CAPTURE THE FLAG", "24h CTF · Villages →")], [imgs]);
  const spots: [number, string][] = [[Math.PI / 2 + 0.42, "tickets"], [Math.PI / 2 - 0.4, "villages"]];
  return (
    <>
      {spots.map(([a, id], k) => (
        <group key={a} position={polar(RINGS.outer.FL - 1.2, a, 8.6)} rotation={[0, Math.PI / 2 - a, 0]}>
          {[-1.1, 1.1].map((x) => (
            <mesh key={x} material={M.frame} position={[x, 0.9, -0.1]}>
              <boxGeometry args={[0.08, 1.8, 0.08]} />
            </mesh>
          ))}
          <mesh material={M.frame} position={[0, 2.3, -0.06]}>
            <boxGeometry args={[2.0, 2.66, 0.1]} />
          </mesh>
          <mesh position={[0, 2.3, 0]} onClick={(e) => (e.stopPropagation(), go(id))} {...hover}>
            <planeGeometry args={[1.9, 2.53]} />
            <meshBasicMaterial map={tex[k]} toneMapped={false} color="#e0e0e0" />
          </mesh>
        </group>
      ))}
    </>
  );
}

/** BSides "digital storefront": a shop window that is a live crimson screen; click for tickets. */
function DigitalStore() {
  const a = useMemo(() => {
    const { list } = bays(RINGS.outer.FL, RINGS.outer.seed);
    return list.reduce((best, b) => (Math.abs(angDiff(b, Math.PI / 2)) < Math.abs(angDiff(best, Math.PI / 2)) ? b : best), list[0]);
  }, []);
  const { tex, draw } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 640;
    const g = c.getContext("2d")!;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const lines = ["SECURE", "BUILD", "DEFEND", "BSIDES DELHI 2027", "FEB 13–14", "TALKS · CTF · VILLAGES"];
    const draw = (t: number) => {
      g.fillStyle = "#08090d";
      g.fillRect(0, 0, 512, 640);
      for (let i = 0; i < 40; i++) {
        g.fillStyle = `rgba(214,46,66,${0.08 + ((i * 7 + Math.floor(t * 8)) % 10) / 60})`;
        g.font = "14px ui-monospace, monospace";
        g.fillText(((i * 2654435761 + Math.floor(t * 4)) >>> 0).toString(16), (i * 97) % 480, ((i * 53 + t * 60) % 640));
      }
      g.textAlign = "center";
      g.fillStyle = "#ff2a45";
      g.font = "bold 72px Arial, sans-serif";
      lines.slice(0, 3).forEach((l, i) => g.fillText(l, 256, 170 + i * 90));
      g.fillStyle = "#fff";
      g.font = "600 34px Arial, sans-serif";
      g.fillText(lines[3], 256, 470);
      g.font = "26px Arial, sans-serif";
      g.fillStyle = "#c8c8cc";
      g.fillText(lines[4], 256, 515);
      g.fillText(lines[5], 256, 555);
      if (Math.floor(t * 2) % 2) g.fillText("▶ TAP FOR TICKETS", 256, 610);
      tex.needsUpdate = true;
    };
    draw(0);
    return { tex, draw };
  }, []);
  const last = useRef(0);
  useFrame(({ clock }) => {
    if (clock.elapsedTime - last.current < 0.12) return;
    last.current = clock.elapsedTime;
    draw(clock.elapsedTime);
  });
  const FL = RINGS.outer.FL, R = FL - 1.62;
  return (
    <mesh position={polar(R, a, 1.45)} rotation={[0, Math.PI / 2 - a, 0]} onClick={(e) => (e.stopPropagation(), go("tickets"))} {...hover}>
      <planeGeometry args={[BAY * 0.86, 2.4]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
}

/** The cyber layer: ring roads and radials glow as a crimson network as the camera rises over CP. */
function Network() {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(NEON).multiplyScalar(2.2), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), []);
  const spokes = useMemo(() => radials(RINGS.outer.FL, RINGS.outer.seed), []);
  useFrame(({ camera }) => {
    const rise = THREE.MathUtils.clamp((camera.position.y - 6) / 8, 0, 1);
    const near = THREE.MathUtils.clamp(1 - Math.abs(scrollState.chapter - 2.5) / 0.9, 0, 1);
    mat.opacity = rise * near * 0.9;
  });
  return (
    <group>
      {[9.65, 18.45, 28.2].map((r) => (
        <mesh key={r} material={mat} rotation={[-Math.PI / 2, 0, 0]} position={[C[0], 0.05, C[2]]}>
          <ringGeometry args={[r - 0.06, r + 0.06, 160]} />
        </mesh>
      ))}
      {spokes.map((a) => (
        <mesh key={a} material={mat} rotation={[-Math.PI / 2, 0, -a + Math.PI / 2]} position={polar(19, a, 0.05)}>
          <planeGeometry args={[0.1, 22]} />
        </mesh>
      ))}
    </group>
  );
}

function ChaiCart({ M, a }: { M: CpMats; a: number }) {
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ color: "#5a3a22", roughness: 0.8 }), []);
  const umbrella = useMemo(() => new THREE.MeshStandardMaterial({ color: "#8a1520", roughness: 0.8, side: THREE.DoubleSide }), []);
  return (
    <group position={polar(31.0, a, 0.12)} rotation={[0, -a, 0]}>
      <mesh material={wood} position={[0, 0.45, 0]}>
        <boxGeometry args={[0.55, 0.3, 1.0]} />
      </mesh>
      <mesh material={M.m.steel} position={[0, 0.72, 0.25]}>
        <cylinderGeometry args={[0.1, 0.12, 0.25, 12]} />
      </mesh>
      <mesh material={M.m.darkMetal} position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.4, 6]} />
      </mesh>
      <mesh material={umbrella} position={[0, 1.75, 0]}>
        <coneGeometry args={[0.9, 0.35, 10, 1, true]} />
      </mesh>
      <mesh material={M.downlight} position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
      </mesh>
      {[-0.4, 0.4].map((z) => (
        <mesh key={z} material={M.m.darkMetal} position={[0.3, 0.18, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 0.04, 14]} />
        </mesh>
      ))}
    </group>
  );
}

function CpWorld() {
  const M = useCpMaterials();
  const gate = Math.PI / 2; // the radial road the camera looks down
  const trees = useMemo(() => {
    const ring = (r: number, n: number, off: number) =>
      Array.from({ length: n }, (_, i) => (i / n) * Math.PI * 2 + off)
        .map((a) => polar(r, a))
        .filter(([x, , z]) => clearOfPath(x, z, 3.5));
    return [...ring(30.9, 30, 0.07), ...ring(33.5, 26, 0.2)];
  }, []);
  const lamps = useMemo(() => Array.from({ length: 24 }, (_, i) => (i / 24) * Math.PI * 2 + 0.03).map((a) => polar(30.4, a)).filter(([x, , z]) => clearOfPath(x, z, 2.5)), []);
  const walks = useMemo(() => {
    const chord = (r: number, a0: number, a1: number): [V3, V3] => [polar(r, a0), polar(r, a1)];
    return [chord(24.85, gate + 0.18, gate + 0.6), chord(24.85, gate - 0.18, gate - 0.6), chord(31.0, gate + 0.15, gate + 0.55), chord(31.0, gate - 0.12, gate - 0.5), chord(5.25, 0, 1.2), chord(5.25, 2.5, 3.6), chord(5.25, 4.2, 5.6)];
  }, [gate]);
  const crossers = useMemo(() => [[polar(31.2, gate + 0.07), polar(26.1, gate + 0.07)], [polar(26.1, gate - 0.08), polar(31.2, gate - 0.08)]] as [V3, V3][], [gate]);
  const signals = useMemo(() => [gate + 0.19, gate - 0.19].map((a, k) => ({ p: polar(30.3, a), yaw: Math.PI / 2 - a + (k ? 0.4 : -0.4) })), [gate]);
  return (
    <group>
      <Ring M={M} {...RINGS.inner} accent={false} />
      <Ring M={M} {...RINGS.outer} accent />
      <Streets M={M} />
      <CentralPark M={M} />
      <Billboards M={M} />
      <DigitalStore />
      <Network />
      <Trees points={trees} />
      <Lanterns points={lamps} />
      <People paths={walks} count={22} />
      <People paths={crossers} count={4} />
      <ChaiCart M={M} a={gate + 0.3} />
      {signals.map((s, k) => (
        <Signal key={k} M={M} position={s.p} yaw={s.yaw} phase={k * 7} />
      ))}
      <RingTraffic center={C} lanes={LANES.inner} perLane={6} speed={3.2} />
      <RingTraffic center={C} lanes={LANES.middle} perLane={9} speed={3.8} />
      <RingTraffic center={C} lanes={LANES.outer} perLane={12} speed={4.4} />
      <HoloRing center={[C[0], 16, C[2]]} radius={24} tilt={0.06} />
      <Flag id="cp" position={polar(RINGS.outer.FL + 0.05, gate + 0.55, 9.1)} />
    </group>
  );
}

export function ConnaughtPlace() {
  return (
    <Suspense fallback={null}>
      <CpWorld />
    </Suspense>
  );
}

/** Blue-hour fill for this chapter (lives outside the chapter groups so it never toggles visibility). */
export function CpFill() {
  const ref = useRef<THREE.HemisphereLight>(null);
  useFrame(() => {
    if (ref.current) ref.current.intensity = 0.65 * weight(2);
  });
  return <hemisphereLight ref={ref} args={["#3d5a8a", "#1a1410", 0]} />;
}

