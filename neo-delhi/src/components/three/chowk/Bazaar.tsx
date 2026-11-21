"use client";

import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { VILLAGES } from "@/lib/content";
import { useFlags } from "@/lib/flags";
import { scrollState, sfx } from "@/lib/scroll";
import { Beacon, Node } from "../cp/ConnaughtPlace";
import { Flag } from "../Flag";
import { Crowd, randomLook, type Pose } from "../humans";
import { useMats } from "../materials";
import { PLACES } from "../path";
import { hover } from "../props";
import { boxUV, glowTexture, NEON, rand, setInstances, signTexture, wiresGeometry, worldUV, type V3 } from "../util";
import { FlickerSign, JamaMasjid, Stalls } from "./landmarks";

// Chandni Chowk at night (1 unit ≈ 2 m). The main lane runs along -z between two rows of buildings at x = ±LANE.
// Every building is assembled from parts — shopfront with recess, interior, shutter, sign, awning; upper floors
// with wooden windows, shutters, balconies, jharokhas, cornices; services (AC units, downpipes, meter boxes);
// parapets, water tanks and rooftop rooms — with per-building style, height and colour so the row never repeats.
const { start: Z0, end: Z1, rightEnd: ZR } = PLACES.chowk;
const LANE = 3.7;
const GF = 2.0, UF = 1.55; // ground floor, upper floor heights
const SIDE_LANES = [
  { side: -1, z: -336, w: 2.4, name: ["पराठे वाली गली", "Paranthe Wali Gali"], kind: "food" },
  { side: 1, z: -333, w: 2.3, name: ["दरीबा कलाँ", "Dariba Kalan"], kind: "jewel" },
  { side: -1, z: -352, w: 2.3, name: ["किनारी बाज़ार", "Kinari Bazaar"], kind: "kinari" },
] as const;
const GURDWARA = { z0: -342.5, z1: -351.5 }; // right side

type ShopKind = "fabric" | "jewel" | "food" | "general" | "sweets" | "electronics";
type B = { side: number; z: number; len: number; floors: number; style: 0 | 1 | 2 | 3; tint: string; shop: ShopKind; closed: boolean; i: number };
const TINTS = ["#a87555", "#b98d6a", "#9a7a62", "#c4a07a", "#8f6a55", "#b07e6a", "#a99a84", "#7f8a8c"];
const KINDS: ShopKind[] = ["fabric", "jewel", "food", "general", "sweets", "fabric", "general", "electronics"];
const SHOP_NAMES: Record<ShopKind, [string, string][]> = {
  fabric: [["साड़ी महल", "Saree Mahal"], ["लहंगा हाउस", "Lehenga House"], ["कपड़ा भंडार", "Kapda Bhandar"]],
  jewel: [["ज्वेलर्स", "Jewellers"], ["सोना चाँदी", "Gold & Silver"]],
  food: [["चाट भंडार", "Chaat Bhandar"], ["कचौरी", "Kachori"]],
  general: [["जनरल स्टोर", "General Store"], ["बर्तन", "Utensils"], ["इत्र", "Attar & Perfumes"]],
  sweets: [["मिठाई", "Sweets"], ["जलेबी वाला", "Jalebi Wala"]],
  electronics: [["गुप्ता इलेक्ट्रॉनिक्स", "Gupta Electronics"]],
};

function useBuildings() {
  return useMemo(() => {
    const out: B[] = [];
    const blocked = (side: number, a: number, b: number) =>
      SIDE_LANES.some((l) => l.side === side && b > l.z - l.w / 2 && a < l.z + l.w / 2) || (side > 0 && b > GURDWARA.z1 && a < GURDWARA.z0);
    [-1, 1].forEach((side) => {
      let z = Z0, i = side > 0 ? 100 : 0;
      const end = side > 0 ? ZR : Z1;
      while (z > end) {
        const len = 3.4 + rand(i) * 2.8;
        if (blocked(side, z - len, z)) {
          // Jump to the far edge of whatever is in the way.
          const l = SIDE_LANES.find((s) => s.side === side && z - len < s.z + s.w / 2 && z > s.z - s.w / 2);
          z = l ? l.z - l.w / 2 - 0.02 : GURDWARA.z1 - 0.02;
          i++;
          continue;
        }
        out.push({
          side, z: z - len / 2, len, i,
          floors: 3 + Math.floor(rand(i + 7) * 3.2),
          style: Math.floor(rand(i + 13) * 4) as B["style"],
          tint: TINTS[Math.floor(rand(i + 3) * TINTS.length)],
          shop: KINDS[Math.floor(rand(i + 21) * KINDS.length)],
          closed: rand(i + 31) > 0.82,
        });
        z -= len + 0.04;
        i++;
      }
    });
    // Exactly one electronics shop near the camera hosts the terminal.
    const e = out.find((b) => b.side < 0 && b.z < Z0 - 6) ?? out[0];
    e.shop = "electronics";
    e.closed = false;
    return out;
  }, []);
}

// ---- CC0 photo-scanned materials (Poly Haven), mapped by world position so every wall keeps real-size bricks ----
const PBR = ["red_brick_03", "worn_plaster_wall", "damaged_plaster", "weathered_brown_planks", "red_sandstone_pavement"] as const;
const PBR_URLS = Object.fromEntries(PBR.flatMap((n) => (["diff", "nor_gl", "arm"] as const).map((k) => [`${n}:${k}`, `/assets/textures/chowk/${n}/${k}.jpg`])));

function usePbr() {
  const tex = useTexture(PBR_URLS) as unknown as Record<string, THREE.Texture>;
  const key = Object.values(tex).map((t) => t.uuid).join();
  return useMemo(() => {
    const mk = (n: (typeof PBR)[number], tilesPerUnit: number, o: THREE.MeshStandardMaterialParameters = {}) => {
      const get = (k: string) => {
        const t = tex[`${n}:${k}`];
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.anisotropy = 8;
        if (k === "diff") t.colorSpace = THREE.SRGBColorSpace;
        return t;
      };
      const arm = get("arm");
      return worldUV(new THREE.MeshStandardMaterial({ map: get("diff"), normalMap: get("nor_gl"), roughnessMap: arm, aoMap: arm, roughness: 1, ...o }), tilesPerUnit);
    };
    return {
      brick: mk("red_brick_03", 0.9),
      plaster: mk("worn_plaster_wall", 0.32), // tinted per building
      plasterOld: mk("damaged_plaster", 0.4, { color: "#b89a80" }),
      wood: mk("weathered_brown_planks", 1.2, { color: "#8a6a55" }),
      woodLight: mk("weathered_brown_planks", 1.2, { color: "#b08a6a" }),
      paving: mk("red_sandstone_pavement", 0.45, { color: "#b9a090" }),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on texture ids (useTexture returns a new wrapper each render)
  }, [key]);
}

// ---- Procedural textures ----
function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat?: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
  }
  return t;
}
/** Rain and soot streaks below sills and cornices (overlaid on facades). */
const streakTex = () =>
  canvasTex(256, 256, (g) => {
    g.clearRect(0, 0, 256, 256);
    for (let i = 0; i < 70; i++) {
      const x = rand(i) * 256, len = 40 + rand(i + 0.5) * 200, w = 1 + rand(i + 0.3) * 6;
      const grd = g.createLinearGradient(0, 0, 0, len);
      grd.addColorStop(0, `rgba(20,14,10,${0.25 + rand(i + 0.7) * 0.35})`);
      grd.addColorStop(1, "rgba(20,14,10,0)");
      g.fillStyle = grd;
      g.fillRect(x, rand(i + 0.9) * 60, w, len);
    }
    const base = g.createLinearGradient(0, 256, 0, 170);
    base.addColorStop(0, "rgba(15,10,8,0.6)");
    base.addColorStop(1, "rgba(15,10,8,0)");
    g.fillStyle = base;
    g.fillRect(0, 170, 256, 86);
  });
/** Shop interior seen through the opening, per trade. */
function interiorTex(kind: ShopKind | "kinari") {
  return canvasTex(256, 192, (g) => {
    const warm = g.createLinearGradient(0, 0, 0, 192);
    warm.addColorStop(0, "#fff0d0");
    warm.addColorStop(0.5, "#f6c47e");
    warm.addColorStop(1, "#6a4426");
    g.fillStyle = warm;
    g.fillRect(0, 0, 256, 192);
    const shelf = (y: number) => {
      g.fillStyle = "rgba(70,40,22,0.8)";
      g.fillRect(0, y, 256, 5);
    };
    if (kind === "fabric" || kind === "kinari") {
      // Rolled fabric bolts stacked in pigeonholes, hanging dupattas.
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 12; c++) {
          g.fillStyle = `hsl(${(c * 53 + r * 97) % 360},${55 + (c % 3) * 12}%,${38 + (r % 2) * 14}%)`;
          g.fillRect(4 + c * 21, 10 + r * 26, 18, 22);
        }
      for (let c = 0; c < 10; c++) {
        g.fillStyle = `hsla(${(c * 71) % 360},70%,50%,0.85)`;
        g.fillRect(10 + c * 25, 115, 12, 70);
      }
    } else if (kind === "jewel") {
      g.fillStyle = "#3a0a10";
      g.fillRect(0, 0, 256, 192);
      for (let r = 0; r < 3; r++) {
        shelf(40 + r * 45);
        for (let c = 0; c < 14; c++) {
          const x = 10 + c * 17, y = 25 + r * 45;
          const gl = g.createRadialGradient(x, y, 0, x, y, 9);
          gl.addColorStop(0, "#fff6c0");
          gl.addColorStop(0.4, "#e8b84a");
          gl.addColorStop(1, "rgba(120,70,10,0)");
          g.fillStyle = gl;
          g.fillRect(x - 9, y - 9, 18, 18);
        }
      }
      g.fillStyle = "rgba(255,240,200,0.35)";
      g.fillRect(0, 160, 256, 32);
    } else if (kind === "food" || kind === "sweets") {
      shelf(70);
      for (let c = 0; c < 9; c++) {
        g.fillStyle = kind === "sweets" ? ["#f2c94c", "#f28c28", "#e9e2c9", "#d64545"][c % 4] : "#8a5a2a";
        g.beginPath();
        g.ellipse(18 + c * 28, 60, 12, 7, 0, 0, 7);
        g.fill();
      }
      g.fillStyle = "#b7b9bc";
      g.fillRect(20, 130, 216, 40); // steel counter
      g.fillStyle = "#2b2b2b";
      g.beginPath();
      g.ellipse(128, 128, 40, 10, 0, 0, 7); // tawa
      g.fill();
    } else if (kind === "electronics") {
      g.fillStyle = "#1a2030";
      g.fillRect(0, 0, 256, 192);
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 8; c++) {
          g.fillStyle = r === 1 && c === 3 ? "#ff2a45" : `hsl(${200 + c * 8},40%,${30 + ((r + c) % 3) * 10}%)`;
          g.fillRect(8 + c * 31, 14 + r * 50, 26, 38);
        }
    } else {
      for (let r = 0; r < 4; r++) {
        shelf(36 + r * 40);
        for (let c = 0; c < 16; c++) {
          g.fillStyle = `hsl(${(c * 37 + r * 50) % 360},35%,${40 + (c % 3) * 10}%)`;
          g.fillRect(4 + c * 16, 14 + r * 40, 12, 22);
        }
      }
    }
    // Tube lights
    g.fillStyle = "rgba(255,255,245,0.95)";
    g.fillRect(30, 2, 80, 4);
    g.fillRect(146, 2, 80, 4);
  });
}
const shutterTex = () =>
  canvasTex(64, 256, (g) => {
    for (let y = 0; y < 256; y += 6) {
      g.fillStyle = y % 12 ? "#5a5650" : "#75716a";
      g.fillRect(0, y, 64, 6);
    }
    g.fillStyle = "rgba(90,40,20,0.35)";
    for (let i = 0; i < 30; i++) g.fillRect(rand(i) * 64, rand(i + 1) * 256, 3, 20 * rand(i + 2));
  });

/** Placement helper: d = depth into the building from its facade (negative = sticks out into the lane). */
function F(b: { side: number; z: number }, lz: number, y: number, d = 0): V3 {
  return [b.side * (LANE + d), y, b.z + lz];
}
const ry = (side: number): V3 => [0, -side * Math.PI / 2, 0]; // planes: face the lane
const rx = (side: number): V3 => [0, side < 0 ? 0 : Math.PI, 0]; // parts modelled facing +x: face the lane

type Item = { p: V3; r?: V3; s?: V3; c?: THREE.ColorRepresentation };
function Inst({ items, material, geometry, children }: { items: Item[]; material: THREE.Material; geometry?: THREE.BufferGeometry; children?: React.ReactNode }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => setInstances(ref.current, items), [items, material, geometry]);
  return (
    <instancedMesh ref={ref} args={[geometry, material, Math.max(1, items.length)]}>
      {children}
    </instancedMesh>
  );
}

function Buildings({ blds }: { blds: B[] }) {
  const m = useMats();
  const pbr = usePbr();
  const mats = useMemo(() => {
    return {
      plaster: pbr.plaster, // tinted per instance
      plasterOld: pbr.plasterOld,
      brick: pbr.brick,
      wood: pbr.wood,
      woodLight: pbr.woodLight,
      trim: m.plaster("#d9cdb6"),
      metal: new THREE.MeshStandardMaterial({ color: "#3a3c40", metalness: 0.7, roughness: 0.5 }),
      shutter: new THREE.MeshStandardMaterial({ map: shutterTex(), metalness: 0.5, roughness: 0.6 }),
      winLit: new THREE.MeshBasicMaterial({ toneMapped: false }),
      streaks: new THREE.MeshBasicMaterial({ map: streakTex(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }),
      tube: new THREE.MeshBasicMaterial({ color: new THREE.Color("#f2f6ff").multiplyScalar(2.2), toneMapped: false }),
      recess: new THREE.MeshStandardMaterial({ color: "#2a211b", roughness: 0.9 }),
      awning: new THREE.MeshStandardMaterial({ roughness: 0.9, side: THREE.DoubleSide }),
      ac: m.stucco,
      tank: new THREE.MeshStandardMaterial({ color: "#121212", roughness: 0.6 }),
      dish: new THREE.MeshStandardMaterial({ color: "#d8d8d8", roughness: 0.4, side: THREE.DoubleSide }),
    };
  }, [m, pbr]);
  const interiors = useMemo(() => Object.fromEntries((["fabric", "jewel", "food", "general", "sweets", "electronics"] as ShopKind[]).map((k) => [k, new THREE.MeshBasicMaterial({ map: interiorTex(k), toneMapped: false })])) as Record<ShopKind, THREE.MeshBasicMaterial>, []);
  const signs = useMemo(() => {
    const all: { map: THREE.Texture; key: string }[] = [];
    (Object.keys(SHOP_NAMES) as ShopKind[]).forEach((k) => SHOP_NAMES[k].forEach(([hi, en], j) => all.push({ key: `${k}${j}`, map: signTexture(hi, en, { w: 512, h: 128, fg: k === "jewel" ? "#ffe08a" : "#fff2d8", bg: ["#5a0f12", "#14305a", "#0f3d24", "#3b2410"][(j + k.length) % 4], border: "#e8c26a", sub: "#ffffff" }) })));
    return all;
  }, []);
  const signMats = useMemo(() => Object.fromEntries(signs.map((s) => [s.key, new THREE.MeshBasicMaterial({ map: s.map, toneMapped: false, color: "#cfcfcf" })])), [signs]);

  const geo = useMemo(
    () => ({
      // Wooden window: frame with mullion + two shutter leaves standing open
      winFrame: mergeGeometries([new THREE.BoxGeometry(0.06, 0.95, 0.75), new THREE.BoxGeometry(0.06, 0.05, 0.75).translate(0, 0.45, 0), new THREE.BoxGeometry(0.06, 0.05, 0.75).translate(0, -0.45, 0), new THREE.BoxGeometry(0.07, 0.95, 0.04)])!.toNonIndexed(),
      leaves: mergeGeometries([new THREE.BoxGeometry(0.03, 0.9, 0.36).rotateY(0.9).translate(0.12, 0, 0.5), new THREE.BoxGeometry(0.03, 0.9, 0.36).rotateY(-0.9).translate(0.12, 0, -0.5)])!.toNonIndexed(),
      bracket: new THREE.BoxGeometry(0.4, 0.15, 0.12).translate(0.2, 0, 0).rotateZ(0.5),
      ac: mergeGeometries([new THREE.BoxGeometry(0.35, 0.3, 0.5).toNonIndexed(), new THREE.CylinderGeometry(0.11, 0.11, 0.02, 14).rotateZ(Math.PI / 2).translate(-0.18, 0, 0.05).toNonIndexed()])!,
      dish: new THREE.SphereGeometry(0.22, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.35).rotateZ(-Math.PI / 2 + 0.4),
    }),
    [],
  );

  const items = useMemo(() => {
    const it: Record<string, Item[]> = {};
    const add = (k: string, x: Item) => (it[k] ??= []).push(x);
    const sideOf = (b: B) => (b.side < 0 ? 1 : -1); // geometry built facing +x; flip for the right row
    blds.forEach((b) => {
      const H = GF + (b.floors - 1) * UF, R = ry(b.side), k = b.i;
      const col = new THREE.Color(b.tint).multiplyScalar(0.85 + rand(k + 0.4) * 0.3);
      // Mass and facade
      const ow = b.len * 0.78;
      add("mass", { p: [b.side * (LANE + 4), (GF + H) / 2, b.z], s: [8, H - GF, b.len], c: col });
      add("mass", { p: [b.side * (LANE + 1.1 + 3.45), GF / 2, b.z], s: [6.9, GF, b.len], c: col });
      [-1, 1].forEach((s) => add("mass", { p: F(b, s * (ow / 2 + (b.len - ow) / 4 + 0.03), GF / 2, 0.55), s: [1.1, GF, (b.len - ow) / 2 - 0.06], c: col }));
      if (b.style === 1) add("brick", { p: F(b, 0, GF + (H - GF) / 2, -0.02), s: [0.04, H - GF, b.len - 0.1] });
      add("streaks", { p: F(b, 0, GF + (H - GF) / 2 + 0.2, -0.02), r: R, s: [b.len, H - GF, 1] });
      // Ground floor: recess, interior, shutter / sign / awning / tube light
      add("recess", { p: F(b, 0, 0.005, 0.55), s: [1.1, 0.01, ow] });
      if (b.closed) add("shutterDown", { p: F(b, 0, 0.85, 0.04), r: R, s: [ow, 1.7, 1] });
      else {
        add(`int-${b.shop}`, { p: F(b, 0, 0.9, 0.5), r: R, s: [ow, 1.7, 1] });
        add("shutterRoll", { p: F(b, 0, 1.78, 0.05), s: [0.28, 0.22, ow] });
      }
      add("jamb", { p: F(b, ow / 2 + 0.06, GF / 2, -0.02), s: [0.14, GF, 0.12] });
      add("jamb", { p: F(b, -ow / 2 - 0.06, GF / 2, -0.02), s: [0.14, GF, 0.12] });
      const names = SHOP_NAMES[b.shop];
      add(`sign-${b.shop}${k % names.length}`, { p: F(b, 0, GF + 0.05, -0.06), r: R, s: [Math.min(ow, 2.8), 0.48, 1] });
      add("tube", { p: F(b, 0, GF + 0.35, -0.12), s: [0.04, 0.03, Math.min(ow, 2.6) * 0.8] });
      if (!b.closed && rand(k + 41) > 0.45) add("awning", { p: F(b, 0, 1.92, -0.32), r: [0, 0, sideOf(b) * -0.42], s: [0.75, 0.03, ow * 0.95], c: ["#7a1418", "#1f4a7a", "#2f6b3a", "#c47a1a", "#5a2a6a"][k % 5] });
      add("corniceG", { p: F(b, 0, GF + 0.3, -0.05), s: [0.16, 0.12, b.len] });
      // Meter / junction boxes and a downpipe
      add("metal", { p: F(b, b.len / 2 - 0.35, GF - 0.2, -0.05), s: [0.1, 0.35, 0.25] });
      add("pipe", { p: F(b, -b.len / 2 + 0.15, H / 2, -0.06), s: [1, H, 1] });
      // Upper floors
      const nWin = Math.max(1, Math.floor(b.len / 1.4));
      for (let f = 1; f < b.floors; f++) {
        const y = GF + (f - 1) * UF + UF * 0.55;
        add("cornice", { p: F(b, 0, GF + f * UF - 0.02, -0.06), s: [0.14, 0.1, b.len] });
        for (let w = 0; w < nWin; w++) {
          const lz = (w - (nWin - 1) / 2) * (b.len / nWin);
          const lit = rand(k * 13 + f * 5 + w) > 0.45;
          add(lit ? "winLit" : "winDark", { p: F(b, lz, y, -0.015), r: R, s: [0.7, 0.88, 1], c: lit ? new THREE.Color("#f6c47e").multiplyScalar(0.55 + rand(w + f + k) * 0.6) : "#0a0b0e" });
          add("winFrame", { p: F(b, lz, y, -0.04), r: rx(b.side) });
          if (rand(k + f * 3 + w * 7) > 0.55) add("leaves", { p: F(b, lz, y, -0.04), r: rx(b.side) });
          if (rand(k + f * 3 + w * 11) > 0.84) add("ac", { p: F(b, lz + 0.45, y - 0.55, -0.22), r: rx(b.side) });
        }
        if (b.style === 2 && f === 1) {
          // Haveli jharokha: projecting oriel on carved brackets with a chhajja over it
          add("jharokha", { p: F(b, 0, y, -0.45), s: [0.9, 1.2, Math.min(1.8, b.len * 0.45)], c: col });
          add("chhajja", { p: F(b, 0, y + 0.75, -0.55), s: [1.2, 0.07, Math.min(2.3, b.len * 0.55)] });
          [-0.5, 0.5].forEach((o) => add("bracket", { p: F(b, o * Math.min(1.6, b.len * 0.4), y - 0.65, 0), r: rx(b.side) }));
        } else if (rand(k + f) > 0.5) {
          add("balcony", { p: F(b, 0, y - 0.5, -0.35), s: [0.7, 0.08, b.len * 0.7] });
          add("rail", { p: F(b, 0, y - 0.2, -0.68), s: [0.04, 0.5, b.len * 0.7] });
          add("railTop", { p: F(b, 0, y + 0.05, -0.68), s: [0.06, 0.05, b.len * 0.7] });
        }
      }
      // Roofline: parapet, water tank, rooftop room, dish
      add("parapet", { p: F(b, 0, H + 0.2, 0.1), s: [0.25, 0.4, b.len] });
      if (rand(k + 21) > 0.35) add("tank", { p: [b.side * (LANE + 2 + rand(k) * 3), H + 0.35, b.z + (rand(k + 2) - 0.5) * b.len * 0.5], s: [0.6, 0.7, 0.6] });
      if (rand(k + 23) > 0.6) add("roomTop", { p: [b.side * (LANE + 3.5), H + 0.6, b.z], s: [2.4, 1.2, b.len * 0.5], c: col });
      if (rand(k + 29) > 0.7) add("dish", { p: F(b, 0, H + 0.45, 0.6), r: rx(b.side) });
    });
    return it;
  }, [blds]);

  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const boxUv = useMemo(() => boxUV(new THREE.BoxGeometry(1, 1, 1), 1), []);
  const plane = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const pipe = useMemo(() => new THREE.CylinderGeometry(0.04, 0.04, 1, 8), []);
  const tank = useMemo(() => new THREE.CylinderGeometry(0.5, 0.5, 1, 16), []);
  const I = (k: string, material: THREE.Material, geometry: THREE.BufferGeometry) => (it(k).length ? <Inst key={k} items={it(k)} material={material} geometry={geometry} /> : null);
  const it = (k: string) => items[k] ?? [];
  return (
    <group>
      {I("mass", mats.plaster, boxUv)}
      {I("brick", mats.brick, box)}
      {I("streaks", mats.streaks, plane)}
      {I("recess", mats.recess, box)}
      {I("shutterDown", mats.shutter, plane)}
      {I("shutterRoll", mats.metal, box)}
      {(Object.keys(interiors) as ShopKind[]).map((k) => I(`int-${k}`, interiors[k], plane))}
      {I("jamb", mats.trim, box)}
      {signs.map((s) => I(`sign-${s.key}`, signMats[s.key], plane))}
      {I("tube", mats.tube, box)}
      {I("awning", mats.awning, box)}
      {I("corniceG", mats.trim, box)}
      {I("cornice", mats.trim, box)}
      {I("metal", mats.metal, box)}
      {I("pipe", mats.metal, pipe)}
      {I("winLit", mats.winLit, plane)}
      {I("winDark", mats.winLit, plane)}
      {I("winFrame", mats.wood, geo.winFrame)}
      {I("leaves", mats.woodLight, geo.leaves)}
      {I("ac", mats.ac, geo.ac)}
      {I("jharokha", mats.plasterOld, boxUv)}
      {I("chhajja", mats.trim, box)}
      {I("bracket", mats.wood, geo.bracket)}
      {I("balcony", mats.trim, box)}
      {I("rail", mats.metal, box)}
      {I("railTop", mats.metal, box)}
      {I("parapet", mats.trim, box)}
      {I("tank", mats.tank, tank)}
      {I("roomTop", mats.plasterOld, boxUv)}
      {I("dish", mats.dish, geo.dish)}
    </group>
  );
}

/** Narrow side market opening off the main lane, with its own gateway sign and character. */
function SideLane({ side, z, w, name, kind }: (typeof SIDE_LANES)[number]) {
  const m = useMats();
  const pbr = usePbr();
  const depth = 12;
  const sign = useMemo(() => signTexture(name[0], name[1], { w: 768, h: 192, fg: "#ffe9c0", bg: "#2a0b0b", border: "#e8c26a", sub: "#ffffff" }), [name]);
  const glow = useMemo(() => new THREE.MeshBasicMaterial({ map: interiorTex(kind === "food" ? "food" : kind === "jewel" ? "jewel" : "kinari"), toneMapped: false }), [kind]);
  const wall = pbr.plasterOld;
  const x0 = side * LANE, xm = side * (LANE + depth / 2);
  const decor = useRef<THREE.InstancedMesh>(null);
  const decorItems = useMemo(() => {
    if (kind !== "kinari") return [];
    // Tinsel garlands and gota-patti strings criss-crossing the alley
    const out: Item[] = [];
    for (let s = 0; s < 9; s++)
      for (let k = 0; k <= 18; k++) {
        const t = k / 18;
        out.push({ p: [side * (LANE + 1 + s * 1.2), 3.4 - Math.sin(Math.PI * t) * 0.5, z - w / 2 + t * w], c: new THREE.Color().setHSL(((s * 0.17 + k * 0.05) % 1), 0.9, 0.55).multiplyScalar(1.6) });
      }
    return out;
  }, [kind, side, z, w]);
  useLayoutEffect(() => setInstances(decor.current, decorItems), [decorItems]);
  const decorMat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), []);
  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh material={wall} position={[xm, 3, z + s * (w / 2 + 0.15)]}>
            <boxGeometry args={[depth, 6, 0.3]} />
          </mesh>
          {/* Lit shopfronts down both walls of the alley */}
          {[0, 1, 2, 3].map((k) => (
            <mesh key={k} material={glow} position={[side * (LANE + 1.5 + k * 2.6), 0.9, z + s * (w / 2 - 0.01)]} rotation={[0, s > 0 ? Math.PI : 0, 0]}>
              <planeGeometry args={[2, 1.6]} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh material={m.asphalt} rotation={[-Math.PI / 2, 0, 0]} position={[xm, 0.03, z]}>
        <planeGeometry args={[depth, w]} />
      </mesh>
      {/* Gateway beam with the market's name */}
      <mesh material={m.darkMetal} position={[x0, 3.6, z]}>
        <boxGeometry args={[0.2, 0.15, w + 0.4]} />
      </mesh>
      <mesh position={[x0 - side * 0.12, 3.25, z]} rotation={[0, -side * Math.PI / 2, 0]}>
        <planeGeometry args={[w, w / 4]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      {kind === "kinari" && (
        <instancedMesh ref={decor} args={[undefined, decorMat, decorItems.length]}>
          <octahedronGeometry args={[0.07]} />
        </instancedMesh>
      )}
      {kind === "food" && <Steam position={[side * (LANE + 1.8), 1.0, z]} />}
      {kind === "kinari" && <Beacon position={[side * (LANE + 9), 0.1, z]} />}
    </group>
  );
}

/** Cooking steam rising from the paratha tawas. */
function Steam({ position }: { position: V3 }) {
  const ref = useRef<THREE.Points>(null);
  const N = 80;
  const pos = useMemo(() => new Float32Array(N * 3), []);
  const seeds = useMemo(() => Array.from({ length: N }, (_, i) => ({ t: rand(i) * 3, x: (rand(i + 1) - 0.5) * 0.8, z: (rand(i + 2) - 0.5) * 0.8 })), []);
  useFrame((_, dt) => {
    seeds.forEach((s, i) => {
      s.t = (s.t + Math.min(dt, 0.1) * 0.6) % 3;
      pos[i * 3] = s.x + Math.sin(s.t * 2 + i) * 0.1;
      pos[i * 3 + 1] = s.t * 0.9;
      pos[i * 3 + 2] = s.z;
    });
    if (ref.current) ref.current.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref} position={position} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <pointsMaterial map={glowTexture()} size={0.5} color="#d8d2c8" transparent opacity={0.18} depthWrite={false} />
    </points>
  );
}

/** Gurdwara Sis Ganj Sahib (exterior, respectfully simplified): white marble facade, scalloped entrance, gilded domes,
 *  Nishan Sahib. Purely architectural — nothing here is interactive. */
function Gurdwara() {
  const m = useMats();
  const gold = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d9a93a", metalness: 0.9, roughness: 0.25 }), []);
  const saffron = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ff8a1a", roughness: 0.8, side: THREE.DoubleSide }), []);
  const len = GURDWARA.z0 - GURDWARA.z1, zc = (GURDWARA.z0 + GURDWARA.z1) / 2, x = LANE + 2.2;
  const dome = useMemo(() => new THREE.LatheGeometry([[0, 0], [0.9, 0], [1.0, 0.25], [0.95, 0.6], [0.6, 0.95], [0.25, 1.15], [0.05, 1.35], [0, 1.4]].map(([a, b]) => new THREE.Vector2(a, b)), 32), []);
  return (
    <group>
      <mesh material={m.marble} position={[x, 3.2, zc]}>
        <boxGeometry args={[4.4, 6.4, len]} />
      </mesh>
      {/* Entrance arch and steps */}
      <mesh material={m.tungsten} position={[LANE - 0.01, 1.6, zc]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.2, 3.0]} />
      </mesh>
      {[0, 1, 2].map((s) => (
        <mesh key={s} material={m.marble} position={[LANE - 0.3 - s * 0.3, 0.08 + s * 0.06, zc]}>
          <boxGeometry args={[0.3, 0.16, 3.4 - s * 0.4]} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} material={m.marble} position={[LANE - 0.15, 3.3, zc + s * 3.4]}>
          <boxGeometry args={[0.5, 6.6, 0.6]} />
        </mesh>
      ))}
      <mesh geometry={dome} material={gold} position={[x, 6.4, zc]} scale={1.3} />
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={dome} material={gold} position={[LANE + 0.4, 6.6, zc + s * 3.4]} scale={0.45} />
      ))}
      {/* Nishan Sahib */}
      <mesh material={m.steel} position={[LANE - 1.0, 4.5, GURDWARA.z0 - 0.5]}>
        <cylinderGeometry args={[0.05, 0.07, 9, 10]} />
      </mesh>
      <mesh material={saffron} position={[LANE - 1.0 + 0.7, 8.3, GURDWARA.z0 - 0.5]} rotation={[0, 0, 0]}>
        <planeGeometry args={[1.4, 0.8]} />
      </mesh>
    </group>
  );
}

// ---- Vehicles moving through the bazaar (centre of the lane), with their riders in the crowd ----
type Veh = { kind: "erick" | "cycle" | "cart"; x: number; dir: 1 | -1; speed: number; phase: number };
const VEHICLES: Veh[] = [
  { kind: "erick", x: -0.55, dir: -1, speed: 1.1, phase: 0 },
  { kind: "erick", x: 0.65, dir: 1, speed: 1.0, phase: 0.5 },
  { kind: "cycle", x: -0.7, dir: -1, speed: 0.75, phase: 0.33 },
  { kind: "cycle", x: 0.75, dir: 1, speed: 0.7, phase: 0.85 },
  { kind: "cart", x: 0.2, dir: -1, speed: 0.55, phase: 0.62 },
];
const ROUTE = { a: Z0 + 6, b: Z1 - 14 }; // wraps behind the camera and past the square
const vehZ = (v: Veh, t: number) => {
  const L = ROUTE.a - ROUTE.b, s = (((t * v.speed) / L + v.phase) % 1 + 1) % 1;
  return v.dir < 0 ? ROUTE.a - s * L : ROUTE.b + s * L;
};

function Vehicles() {
  const m = useMats();
  const refs = useRef<(THREE.Group | null)[]>([]);
  const mats = useMemo(
    () => ({
      erick: new THREE.MeshPhysicalMaterial({ color: "#1d6a8a", roughness: 0.35, metalness: 0.4, clearcoat: 1 }),
      erick2: new THREE.MeshPhysicalMaterial({ color: "#2a7a3a", roughness: 0.35, metalness: 0.4, clearcoat: 1 }),
      canopy: new THREE.MeshStandardMaterial({ color: "#1a1a1d", roughness: 0.7, side: THREE.DoubleSide }),
      hood: new THREE.MeshStandardMaterial({ color: "#6a0f15", roughness: 0.8, side: THREE.DoubleSide }),
      wood: new THREE.MeshStandardMaterial({ color: "#5a3a22", roughness: 0.85 }),
      sack: new THREE.MeshStandardMaterial({ color: "#c8b68e", roughness: 1 }),
      lamp: new THREE.MeshBasicMaterial({ color: new THREE.Color("#fff3e0").multiplyScalar(4), toneMapped: false }),
    }),
    [],
  );
  const clock = useRef(0);
  useFrame((_, dt) => {
    clock.current += Math.min(dt, 0.1);
    VEHICLES.forEach((v, i) => {
      const g = refs.current[i];
      if (!g) return;
      g.position.set(v.x, 0, vehZ(v, clock.current));
      g.rotation.y = v.dir < 0 ? Math.PI : 0;
    });
  });
  const wheel = (x: number, z: number, r: number, k: string | number) => (
    <mesh key={k} material={m.darkMetal} position={[x, r, z]} rotation={[0, 0, Math.PI / 2]}>
      <torusGeometry args={[r * 0.85, r * 0.15, 8, 20]} />
    </mesh>
  );
  return (
    <>
      {VEHICLES.map((v, i) => (
        <group
          key={i}
          ref={(g) => void (refs.current[i] = g)}
          onClick={(e) => (e.stopPropagation(), sfx(v.kind === "erick" ? "auto-horn" : "rickshaw-bell"))}
          {...hover}
        >
          {v.kind === "erick" && (
            <group>
              <mesh material={i % 2 ? mats.erick2 : mats.erick} position={[0, 0.45, 0]}>
                <boxGeometry args={[0.6, 0.35, 1.3]} />
              </mesh>
              <mesh material={i % 2 ? mats.erick2 : mats.erick} position={[0, 0.65, 0.62]} rotation={[0.3, 0, 0]}>
                <boxGeometry args={[0.5, 0.45, 0.08]} />
              </mesh>
              <mesh material={mats.canopy} position={[0, 1.15, -0.05]}>
                <boxGeometry args={[0.66, 0.04, 1.4]} />
              </mesh>
              {[[-0.3, 0.6], [0.3, 0.6], [-0.3, -0.6], [0.3, -0.6]].map(([x, z]) => (
                <mesh key={`${x}${z}`} material={m.darkMetal} position={[x, 0.8, z]}>
                  <cylinderGeometry args={[0.015, 0.015, 0.7, 6]} />
                </mesh>
              ))}
              {wheel(-0.3, -0.45, 0.14, "a")}
              {wheel(0.3, -0.45, 0.14, "b")}
              {wheel(0, 0.62, 0.14, "c")}
              <mesh material={mats.lamp} position={[0, 0.72, 0.69]}>
                <circleGeometry args={[0.05, 12]} />
              </mesh>
            </group>
          )}
          {v.kind === "cycle" && (
            <group>
              {wheel(-0.32, -0.35, 0.28, "a")}
              {wheel(0.32, -0.35, 0.28, "b")}
              {wheel(0, 0.6, 0.24, "c")}
              <mesh material={mats.wood} position={[0, 0.62, -0.35]}>
                <boxGeometry args={[0.65, 0.08, 0.4]} />
              </mesh>
              <mesh material={mats.hood} position={[0, 0.98, -0.5]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.38, 0.38, 0.66, 12, 1, true, 0, Math.PI]} />
              </mesh>
              <mesh material={m.darkMetal} position={[0, 0.55, 0.2]} rotation={[0.35, 0, 0]}>
                <boxGeometry args={[0.04, 0.04, 0.9]} />
              </mesh>
            </group>
          )}
          {v.kind === "cart" && (
            <group>
              <mesh material={mats.wood} position={[0, 0.45, 0]}>
                <boxGeometry args={[0.6, 0.06, 1.5]} />
              </mesh>
              {[0, 1, 2].map((k) => (
                <mesh key={k} material={mats.sack} position={[(k - 1) * 0.15, 0.62, -0.4 + k * 0.4]} scale={[1, 0.7, 1]}>
                  <sphereGeometry args={[0.2, 10, 8]} />
                </mesh>
              ))}
              {wheel(-0.32, 0, 0.22, "a")}
              {wheel(0.32, 0, 0.22, "b")}
              <mesh material={m.darkMetal} position={[0, 0.5, -0.95]}>
                <boxGeometry args={[0.6, 0.03, 0.03]} />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </>
  );
}

// ---- Crowd with behaviour: walkers both ways, shoppers stopping at shops, shopkeepers, drivers, food customers ----
type Agent = { kind: "walk" | "shop" | "keeper" | "driver" | "pusher" | "eat"; x: number; z?: number; dir?: 1 | -1; speed?: number; phase?: number; veh?: number; side?: number };

function BazaarCrowd({ blds }: { blds: B[] }) {
  const agents = useMemo(() => {
    const a: Agent[] = [];
    for (let k = 0; k < 20; k++) a.push({ kind: "walk", x: (k % 2 ? 1 : -1) * (1.5 + rand(k) * 0.8), dir: k % 3 ? -1 : 1, speed: 0.45 + rand(k + 3) * 0.3, phase: rand(k + 5) });
    blds.filter((b, j) => !b.closed && j % 3 === 0).forEach((b) => a.push({ kind: "keeper", x: b.side * (LANE + 0.25), z: b.z, side: b.side }));
    blds.filter((b, j) => !b.closed && j % 4 === 1).slice(0, 7).forEach((b, k) => a.push({ kind: "shop", x: b.side * (LANE - 0.75 - rand(k) * 0.3), z: b.z + (rand(k + 9) - 0.5) * b.len * 0.5, side: b.side }));
    VEHICLES.forEach((v, i) => a.push({ kind: v.kind === "cart" ? "pusher" : "driver", x: v.x, veh: i }));
    SIDE_LANES.filter((l) => l.kind === "food").forEach((l) => [0, 1, 2].forEach((k) => a.push({ kind: "eat", x: l.side * (LANE + 0.6 + k * 0.5), z: l.z + (k - 1) * 0.6, side: l.side })));
    return a;
  }, [blds]);
  const looks = useMemo(() => agents.map((_, i) => randomLook(i * 4.1 + 71)), [agents]);
  const update = (i: number, t: number, p: Pose) => {
    const a = agents[i];
    p.visible = true;
    p.y = 0;
    p.speed = 1;
    if (a.kind === "walk") {
      const L = Z0 - (Z1 - 4), s = (((t * a.speed!) / L + a.phase!) % 1 + 1) % 1;
      p.x = a.x;
      p.z = a.dir! < 0 ? Z0 + 2 - s * L : Z1 - 4 + s * L;
      p.yaw = a.dir! < 0 ? Math.PI : 0;
      p.mode = "walk";
    } else if (a.kind === "keeper" || a.kind === "shop" || a.kind === "eat") {
      p.x = a.x;
      p.z = a.z!;
      // Keepers face the lane; shoppers and diners face the shop.
      p.yaw = (a.kind === "keeper" ? -a.side! : a.side!) * (Math.PI / 2);
      p.mode = a.kind === "shop" && i % 2 ? "phone" : "idle";
    } else {
      const v = VEHICLES[a.veh!], z = vehZ(v, t);
      if (a.kind === "driver") {
        // Seated on the rickshaw; legs cycle like pedalling.
        p.x = v.x;
        p.z = z + v.dir * (v.kind === "cycle" ? 0.15 : 0.35);
        p.y = v.kind === "cycle" ? 0.38 : 0.3;
        p.mode = v.kind === "cycle" ? "walk" : "sit";
      } else {
        p.x = v.x;
        p.z = z - v.dir * 1.2;
        p.mode = "walk";
      }
      p.yaw = v.dir < 0 ? Math.PI : 0;
    }
  };
  return <Crowd looks={looks} update={update} scale={0.55} />;
}

/** Overhead: irregular bundled wires, junction boxes, festoon bulbs, marigold strings, and the cyber cable pulse. */
function Overhead() {
  const m = useMats();
  const { wires, bulbs, flowers, boxes } = useMemo(() => {
    const pairs: [V3, V3, number][] = [];
    const bulbs: Item[] = [], flowers: Item[] = [], boxes: Item[] = [];
    for (let k = 0; k < 30; k++) {
      const z = Z0 - 2 - rand(k) * (Z0 - ZR - 4), z2 = z + (rand(k + 1) - 0.5) * 7;
      const y = 6.0 + rand(k + 2) * 2.4, y2 = 6.0 + rand(k + 3) * 2.4;
      // A span is a bundle of 2–4 wires with slightly different sag
      const n = 2 + Math.floor(rand(k + 4) * 3);
      for (let j = 0; j < n; j++) pairs.push([[-LANE + 0.05, y + j * 0.06, z + j * 0.05], [LANE - 0.05, y2 + j * 0.07, z2 - j * 0.04], 0.25 + rand(k + j + 5) * 0.55]);
      boxes.push({ p: [-LANE + 0.08, y, z] }, { p: [LANE - 0.08, y2, z2] });
      if (k % 3 === 0) {
        for (let i = 0; i <= 26; i++) {
          const t = i / 26;
          const p: V3 = [-LANE + t * LANE * 2, y - 0.15 + (y2 - y) * t - Math.sin(Math.PI * t) * 0.6, z + (z2 - z) * t];
          if (k % 2) flowers.push({ p, c: ["#ff8a00", "#ffc21a", "#ff6a00"][i % 3] });
          else bulbs.push({ p, c: new THREE.Color(["#ffcf7a", "#ff2a45", "#ffe9b0", "#ff8a3a"][(i + k) % 4]).multiplyScalar(2.4) });
        }
      }
    }
    [-1, 1].forEach((s) => [5.7, 5.85, 6.05, 6.3].forEach((y, j) => pairs.push([[s * (LANE - 0.25), y, Z0], [s * (LANE - 0.25), y + 0.2, s > 0 ? ZR : Z1], 0.35 + j * 0.15])));
    return { wires: wiresGeometry(pairs, 0.018), bulbs, flowers, boxes };
  }, []);
  const glow = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), []);
  return (
    <group>
      <mesh geometry={wires} material={m.wire} />
      <Inst items={bulbs} material={glow}>
        <sphereGeometry args={[0.045, 6, 6]} />
      </Inst>
      <Inst items={flowers} material={m.marigold}>
        <icosahedronGeometry args={[0.1, 0]} />
      </Inst>
      <Inst items={boxes} material={m.darkMetal}>
        <boxGeometry args={[0.12, 0.2, 0.16]} />
      </Inst>
      <CablePulse />
    </group>
  );
}

/** A crimson data pulse racing along the left cable bundle — the bazaar's network waking up. Click it for a burst. */
function CablePulse() {
  const N = 6;
  const ref = useRef<THREE.InstancedMesh>(null);
  const burst = useRef(0);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(NEON).multiplyScalar(4), toneMapped: false }), []);
  const o = useMemo(() => new THREE.Object3D(), []);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += Math.min(dt, 0.1) * (1 + burst.current * 3);
    burst.current = Math.max(0, burst.current - dt * 0.4);
    const on = THREE.MathUtils.clamp(1 - Math.abs(scrollState.chapter - 4) * 1.5, 0, 1);
    for (let i = 0; i < N; i++) {
      const f = ((t.current * 0.12 + i / N) % 1);
      o.position.set(-(LANE - 0.25), 5.78 - Math.sin(Math.PI * f) * 0.45, Z0 - f * (Z0 - Z1));
      o.scale.setScalar(on * (1 + burst.current));
      o.updateMatrix();
      ref.current?.setMatrixAt(i, o.matrix);
    }
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, mat, N]} frustumCulled={false} onClick={(e) => (e.stopPropagation(), (burst.current = 1), sfx("chime"))} {...hover}>
      <sphereGeometry args={[0.09, 10, 10]} />
    </instancedMesh>
  );
}

/** Fictional "Cipher Chai" sign: click and it flips to an encrypted clue. */
function CipherSign({ position }: { position: V3 }) {
  const m = useMats();
  const a = useMemo(() => signTexture("साइबर चाय", "Cipher Chai", { w: 512, h: 192, fg: "#ff2a45", bg: "#0b0b0e", border: NEON, sub: "#f2f2f2" }), []);
  const b = useMemo(() => signTexture("ROT13", "ybbx ng gur pnoyrf", { w: 512, h: 192, fg: "#3cff8a", bg: "#020604", border: "#3cff8a", sub: "#3cff8a" }), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: a, toneMapped: false }), [a]);
  const flip = useRef(0);
  useFrame((_, dt) => {
    flip.current = Math.max(0, flip.current - dt);
    const want = flip.current > 0 ? b : a;
    if (mat.map !== want) {
      mat.map = want;
      mat.needsUpdate = true;
    }
  });
  return (
    <group position={position}>
      <mesh material={m.darkMetal} position={[0.5, 0.3, 0]}>
        <boxGeometry args={[0.04, 0.04, 0.9]} />
      </mesh>
      <mesh material={mat} rotation={[0, 0, 0]} onClick={(e) => (e.stopPropagation(), (flip.current = 6), sfx("chime"))} {...hover}>
        <planeGeometry args={[1.3, 0.5]} />
      </mesh>
    </group>
  );
}

/** Fictional shop security dashboard in Gupta Electronics: click to capture a hidden flag. */
function ShopTerminal({ b }: { b: B }) {
  const find = useFlags((s) => s.find);
  const done = useFlags((s) => s.found.includes("bazaar"));
  const { tex, draw } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 192;
    const g = c.getContext("2d")!;
    const tex = new THREE.CanvasTexture(c);
    const draw = (t: number, ok: boolean) => {
      g.fillStyle = "#03070a";
      g.fillRect(0, 0, 256, 192);
      g.font = "15px ui-monospace, Consolas, monospace";
      g.fillStyle = "#3cff8a";
      ["SHOP-SEC v2.3  GUPTA ELEC.", "cam1 ● cam2 ● cam3 ○", `ports: 22 80 ${Math.floor(t) % 2 ? "8080" : "    "}`, ok ? "> flag captured ✔" : "> audit pending_"].forEach((l, i) => g.fillText(l, 10, 30 + i * 30));
      g.fillStyle = ok ? "#3cff8a" : "#ff2a45";
      g.fillRect(10, 150, 236 * ((t * 0.2) % 1), 8);
      tex.needsUpdate = true;
    };
    return { tex, draw };
  }, []);
  const last = useRef(0);
  useFrame(({ clock }) => {
    if (clock.elapsedTime - last.current < 0.5) return;
    last.current = clock.elapsedTime;
    draw(clock.elapsedTime, done);
  });
  const p = F(b, b.len * 0.18, 0.75, 0.2);
  return (
    <group position={p} rotation={ry(b.side)} onClick={(e) => (e.stopPropagation(), find("bazaar"), sfx("chime"))} {...hover}>
      <mesh position={[0, 0, -0.12]}>
        <boxGeometry args={[0.5, 0.4, 0.22]} />
        <meshStandardMaterial color="#d9d4c6" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.02, 0.005]}>
        <planeGeometry args={[0.4, 0.3]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Hardware-village vendor cart: boards and parts on a handcart; links to the CTF section. */
function HardwareCart({ position }: { position: V3 }) {
  const m = useMats();
  const pcb = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0f5a2a", roughness: 0.5, metalness: 0.2 }), []);
  const sign = useMemo(() => signTexture("हार्डवेयर विलेज", "Hardware Village · CTF", { w: 512, h: 128, fg: "#ff2a45", bg: "#0b0b0e", border: NEON, sub: "#ffffff" }), []);
  return (
    <group position={position} onClick={(e) => (e.stopPropagation(), sfx("chime"), document.querySelector<HTMLAnchorElement>('a[href="#villages"]')?.click())} {...hover}>
      <mesh material={m.darkMetal} position={[0, 0.5, 0]}>
        <boxGeometry args={[0.7, 0.05, 1.2]} />
      </mesh>
      {Array.from({ length: 8 }, (_, k) => (
        <mesh key={k} material={pcb} position={[(k % 2 - 0.5) * 0.3, 0.55, -0.45 + Math.floor(k / 2) * 0.3]} rotation={[0, k * 0.4, 0]}>
          <boxGeometry args={[0.22, 0.02, 0.16]} />
        </mesh>
      ))}
      {[[-0.3, -0.5], [0.3, -0.5], [-0.3, 0.5], [0.3, 0.5]].map(([x, z]) => (
        <mesh key={`${x}${z}`} material={m.darkMetal} position={[x, 0.25, z]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 6]} />
        </mesh>
      ))}
      <mesh position={[0, 1.05, 0]}>
        <planeGeometry args={[1.0, 0.25]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      <Node position={[0, 0.75, 0]} onClick={() => undefined} />
    </group>
  );
}

/** Red sandstone paving (as relaid in the 2021 redevelopment), with a darker worn strip down the middle. */
function Paving() {
  const pbr = usePbr();
  return (
    <mesh material={pbr.paving} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, (Z0 + Z1) / 2]}>
      <planeGeometry args={[LANE * 2, Z0 - Z1]} />
    </mesh>
  );
}

export function ChandniChowk() {
  return (
    <Suspense fallback={null}>
      <Bazaar />
    </Suspense>
  );
}

function Bazaar() {
  const blds = useBuildings();
  const villageSigns = useMemo(() => VILLAGES.map((v) => signTexture(v.hi, v.name)), []);
  const big = useMemo(() => signTexture("चाँदनी चौक", "Chandni Chowk", { w: 1024, h: 384, bg: "#1a0306" }), []);
  const elec = blds.find((b) => b.shop === "electronics")!;
  return (
    <group>
      <Paving />
      <Buildings blds={blds} />
      {SIDE_LANES.map((l) => (
        <SideLane key={l.z} {...l} />
      ))}
      <Gurdwara />
      <Stalls />
      <Overhead />
      <Vehicles />
      <BazaarCrowd blds={blds} />
      {/* Projecting neon village signs on brackets, facing down the lane */}
      {villageSigns.map((map, i) => {
        const side = i % 2 ? 1 : -1;
        return (
          <group key={i} position={[side * (LANE - 0.95), 3.3 + (i % 3) * 0.35, Z0 - 6 - i * 6.5]} scale={0.55}>
            <FlickerSign seed={i} map={map} position={[0, 0, 0]} rotation={[0, 0, 0]} />
          </group>
        );
      })}
      <mesh position={[-(LANE - 0.08), 4.6, -330]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4.2, 1.6]} />
        <meshBasicMaterial map={big} toneMapped={false} />
      </mesh>
      <CipherSign position={[LANE - 0.85, 2.75, -331]} />
      {elec && <ShopTerminal b={elec} />}
      <HardwareCart position={[-2.6, 0, -345]} />
      <Flag id="chowk" position={[-1.4, 8.6, -347]} />
      <JamaMasjid />
    </group>
  );
}
