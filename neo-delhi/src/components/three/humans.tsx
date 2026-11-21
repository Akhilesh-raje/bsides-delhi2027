"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { glowTexture, rand } from "./util";

// Articulated people: every body part is one InstancedMesh shared by the whole crowd, posed per frame
// from a tiny skeleton (hips → torso → head/arms, hips → thighs → shins → shoes). Units are metres;
// `scale` maps them into a scene's world units.

export type Look = {
  skin: string; top: string; bottom: string; hair: string; shoes: string; bag: string;
  tunic: boolean; backpack: boolean; longHair: boolean; height: number;
};
export type Mode = "walk" | "idle" | "phone" | "sit" | "wave";
export type Pose = { x: number; y: number; z: number; yaw: number; mode: Mode; speed: number; visible: boolean };

const SKIN = ["#8d5524", "#a0673a", "#c68642", "#7a4a26", "#b07448", "#6b4226", "#9c6b45"];
const TOPS = ["#e8e4dc", "#1f2a44", "#7a1520", "#2f4f3a", "#c9a55a", "#3b3b42", "#9a4a1f", "#f2f2f2", "#355c8a", "#6b2d5c", "#b0b7c0", "#141414"];
const BOTTOMS = ["#1c2233", "#2b2b30", "#3d3a33", "#14171f", "#4a3b2a", "#d8d2c4", "#20283a"];
const HAIR = ["#0d0b0a", "#1a1310", "#241a14", "#0a0a0a", "#3a2a20"];
const BAGS = ["#1b1b1f", "#2d3a52", "#5a1a1a", "#3e3a2f"];

const pick = <T,>(a: T[], s: number) => a[Math.floor(rand(s) * a.length) % a.length];

export function randomLook(seed: number, opts: Partial<Look> = {}): Look {
  return {
    skin: pick(SKIN, seed + 0.1), top: pick(TOPS, seed + 0.2), bottom: pick(BOTTOMS, seed + 0.3),
    hair: pick(HAIR, seed + 0.4), shoes: rand(seed + 0.5) > 0.7 ? "#e6e2da" : "#151515", bag: pick(BAGS, seed + 0.6),
    tunic: rand(seed + 0.7) > 0.72, backpack: rand(seed + 0.8) > 0.6, longHair: rand(seed + 0.9) > 0.62,
    height: 0.9 + rand(seed + 1.1) * 0.13, ...opts,
  };
}

/** DMRC-style staff: navy shirt, dark trousers. */
export const staffLook = (seed: number) => randomLook(seed, { top: "#1d2b4f", bottom: "#23252b", tunic: false, backpack: false, longHair: false, shoes: "#111" });

// ---- Part geometry (metres; limbs hang from their pivot along -y) ----
const cap = (r: number, len: number, drop = true) => {
  const g = new THREE.CapsuleGeometry(r, len, 4, 10);
  return drop ? g.translate(0, -(len / 2 + r), 0) : g;
};
const GEO = {
  hips: () => new THREE.SphereGeometry(0.15, 14, 10).scale(1.12, 0.75, 0.82),
  torso: () => mergeGeometries([cap(0.15, 0.28, false).scale(1.2, 1, 0.72).translate(0, 0.3, 0), new THREE.CylinderGeometry(0.048, 0.055, 0.12, 10).translate(0, 0.6, 0)])!,
  head: () => mergeGeometries([new THREE.SphereGeometry(0.105, 18, 14).scale(0.9, 1.12, 1).translate(0, 0.12, 0), new THREE.SphereGeometry(0.02, 6, 6).translate(0, 0.1, 0.1)])!,
  hair: () => new THREE.SphereGeometry(0.112, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.55).scale(0.92, 1.12, 1.02).translate(0, 0.14, -0.008),
  longHair: () => new THREE.BoxGeometry(0.2, 0.26, 0.06).translate(0, 0.02, -0.09),
  upperArm: () => cap(0.046, 0.19),
  forearm: () => mergeGeometries([cap(0.04, 0.2), new THREE.SphereGeometry(0.045, 8, 8).scale(0.8, 1.1, 0.5).translate(0, -0.31, 0)])!,
  thigh: () => cap(0.075, 0.3),
  shin: () => cap(0.058, 0.32),
  shoe: () => new THREE.BoxGeometry(0.1, 0.07, 0.25).translate(0, -0.035, 0.05),
  tunic: () => new THREE.CylinderGeometry(0.17, 0.25, 0.52, 14, 1, true).translate(0, -0.18, 0),
  backpack: () => new THREE.BoxGeometry(0.3, 0.38, 0.15).translate(0, 0.32, -0.17),
  phone: () => new THREE.BoxGeometry(0.075, 0.15, 0.012).translate(0, -0.33, 0.04),
};
type Part = keyof typeof GEO;
const PARTS: Part[] = ["hips", "torso", "head", "hair", "longHair", "upperArm", "forearm", "thigh", "shin", "shoe", "tunic", "backpack"];
const PAIRED: Part[] = ["upperArm", "forearm", "thigh", "shin", "shoe"];
const colorOf = (p: Part, l: Look) =>
  p === "hips" || p === "thigh" || p === "shin" ? l.bottom : p === "torso" || p === "upperArm" || p === "tunic" ? l.top : p === "head" || p === "forearm" ? l.skin : p === "hair" || p === "longHair" ? l.hair : p === "shoe" ? l.shoes : l.bag;

// Scratch matrices (single-threaded, reused every frame)
const M = { root: new THREE.Matrix4(), hips: new THREE.Matrix4(), torso: new THREE.Matrix4(), tmp: new THREE.Matrix4(), a: new THREE.Matrix4(), b: new THREE.Matrix4() };
const E = new THREE.Euler(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3();
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
const TR = (x: number, y: number, z: number) => new THREE.Matrix4().makeTranslation(x, y, z);
const rot = (out: THREE.Matrix4, x: number, y = 0, z = 0) => out.makeRotationFromEuler(E.set(x, y, z, "YXZ"));
const OFF = { shoulderL: TR(-0.2, 0.47, 0), shoulderR: TR(0.2, 0.47, 0), elbow: TR(0, -0.28, 0), hipL: TR(-0.095, -0.02, 0), hipR: TR(0.095, -0.02, 0), knee: TR(0, -0.45, 0), ankle: TR(0, -0.44, 0), neck: TR(0, 0.62, 0) };

type Joints = { lean: number; headX: number; headY: number; sh: [number, number]; shZ: [number, number]; el: [number, number]; th: [number, number]; kn: [number, number]; pelvis: number };

function joints(p: Pose, t: number, seed: number, waving: boolean): Joints {
  const j: Joints = { lean: 0, headX: 0, headY: 0, sh: [0.05, 0.05], shZ: [0.08, 0.08], el: [-0.15, -0.15], th: [0, 0], kn: [0.03, 0.03], pelvis: 0.93 };
  if (p.mode === "walk") {
    const f = t * 7.2 * Math.max(0.6, p.speed) + seed * 10;
    [0, 1].forEach((k) => {
      const ph = f + k * Math.PI;
      j.th[k] = -0.42 * Math.sin(ph);
      j.kn[k] = 0.08 + 0.75 * Math.max(0, Math.cos(ph)) ** 2;
      j.sh[k] = 0.32 * Math.sin(ph); // arm swings opposite its own leg
      j.el[k] = -0.22 - 0.2 * Math.max(0, -Math.sin(ph));
    });
    j.pelvis = 0.93 + 0.025 * Math.abs(Math.cos(f));
    j.lean = 0.05;
  } else if (p.mode === "sit") {
    j.th = [-1.5, -1.45];
    j.kn = [1.45, 1.5];
    j.sh = [-0.35, -0.3];
    j.el = [-0.7, -0.6];
    j.pelvis = 0.5;
    j.headX = 0.1 + Math.sin(t * 0.4 + seed) * 0.05;
    j.headY = Math.sin(t * 0.23 + seed * 3) * 0.5;
  } else {
    // Standing: weight shift, breathing, glancing around.
    const w = Math.sin(t * 0.5 + seed * 5);
    j.th = [0.03 * w, -0.03 * w];
    j.lean = 0.01 * Math.sin(t * 1.3 + seed);
    j.headY = Math.sin(t * 0.31 + seed * 7) * 0.6;
    if (p.mode === "phone") {
      j.sh[1] = -0.85;
      j.el[1] = -1.55;
      j.headX = 0.42;
      j.headY = 0.05;
    }
  }
  if (waving) {
    j.sh[1] = -2.7;
    j.shZ[1] = 0.45;
    j.el[1] = -0.4 + Math.sin(t * 11) * 0.35;
    j.headY = 0;
  }
  return j;
}

export function Crowd({ looks, update, scale = 1, clip }: { looks: Look[]; update: (i: number, t: number, p: Pose) => void; scale?: number; clip?: THREE.Plane[] }) {
  const n = looks.length;
  const refs = useRef<Partial<Record<Part | "shadow", THREE.InstancedMesh | null>>>({});
  const geos = useMemo(() => Object.fromEntries(PARTS.concat("phone" as Part).map((p) => [p, GEO[p]()])) as Record<Part | "phone", THREE.BufferGeometry>, []);
  const mats = useMemo(() => {
    const body = new THREE.MeshStandardMaterial({ roughness: 0.82, metalness: 0, clippingPlanes: clip ?? null });
    const phone = new THREE.MeshBasicMaterial({ color: new THREE.Color("#9fd2ff").multiplyScalar(1.6), toneMapped: false, clippingPlanes: clip ?? null });
    const shadow = new THREE.MeshBasicMaterial({ map: glowTexture(), color: "#000", transparent: true, opacity: 0.55, depthWrite: false, clippingPlanes: clip ?? null });
    return { body, phone, shadow };
  }, [clip]);
  const poses = useMemo(() => looks.map(() => ({ x: 0, y: 0, z: 0, yaw: 0, mode: "idle", speed: 1, visible: false }) as Pose), [looks]);
  const waveUntil = useRef<number[]>([]);
  const clock = useRef(0);

  useLayoutEffect(() => {
    const c = new THREE.Color();
    PARTS.forEach((p) => {
      const m = refs.current[p];
      if (!m) return;
      const per = PAIRED.includes(p) ? 2 : 1;
      looks.forEach((l, i) => {
        for (let k = 0; k < per; k++) m.setColorAt(i * per + k, c.set(colorOf(p, l)));
      });
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    });
  }, [looks]);

  useFrame((_, dt) => {
    const t = (clock.current += Math.min(dt, 0.1));
    const R = refs.current;
    looks.forEach((l, i) => {
      const p = poses[i];
      update(i, t, p);
      const set = (part: Part | "shadow" | "phone", idx: number, m: THREE.Matrix4) => R[part]?.setMatrixAt(idx, m);
      if (!p.visible) {
        PARTS.forEach((part) => {
          const per = PAIRED.includes(part) ? 2 : 1;
          for (let k = 0; k < per; k++) set(part, i * per + k, ZERO);
        });
        set("phone", i, ZERO);
        set("shadow", i, ZERO);
        return;
      }
      const waving = (waveUntil.current[i] ?? 0) > t || p.mode === "wave";
      const j = joints(p, t, i * 1.37 + 0.5, waving);
      const s = scale * l.height;
      M.root.compose(V.set(p.x, p.y, p.z), Q.setFromEuler(E.set(0, p.yaw, 0)), S.setScalar(s));
      M.hips.multiplyMatrices(M.root, TR(0, j.pelvis, 0));
      set("hips", i, M.hips);
      M.torso.multiplyMatrices(M.hips, rot(M.tmp, j.lean));
      set("torso", i, M.torso);
      M.a.multiplyMatrices(M.torso, OFF.neck).multiply(rot(M.tmp, j.headX, j.headY));
      set("head", i, M.a);
      set("hair", i, M.a);
      set("longHair", i, l.longHair ? M.a : ZERO);
      set("backpack", i, l.backpack ? M.torso : ZERO);
      set("tunic", i, l.tunic ? M.hips : ZERO);
      [0, 1].forEach((k) => {
        const side = k ? 1 : -1;
        M.a.multiplyMatrices(M.torso, k ? OFF.shoulderR : OFF.shoulderL).multiply(rot(M.tmp, j.sh[k], 0, side * j.shZ[k]));
        set("upperArm", i * 2 + k, M.a);
        M.b.multiplyMatrices(M.a, OFF.elbow).multiply(rot(M.tmp, j.el[k]));
        set("forearm", i * 2 + k, M.b);
        if (k === 1) set("phone", i, p.mode === "phone" ? M.b : ZERO);
        M.a.multiplyMatrices(M.hips, k ? OFF.hipR : OFF.hipL).multiply(rot(M.tmp, j.th[k]));
        set("thigh", i * 2 + k, M.a);
        M.b.multiplyMatrices(M.a, OFF.knee).multiply(rot(M.tmp, j.kn[k]));
        set("shin", i * 2 + k, M.b);
        M.a.multiplyMatrices(M.b, OFF.ankle).multiply(rot(M.tmp, -(j.th[k] + j.kn[k])));
        set("shoe", i * 2 + k, M.a);
      });
      // Soft contact shadow under the feet
      M.a.compose(V.set(p.x, p.y + 0.01, p.z), Q.setFromEuler(E.set(-Math.PI / 2, 0, 0)), S.set(s * 0.75, s * 0.75, 1));
      set("shadow", i, M.a);
    });
    Object.values(R).forEach((m) => m && (m.instanceMatrix.needsUpdate = true));
  });

  const wave = (e: { stopPropagation: () => void; instanceId?: number }) => {
    e.stopPropagation();
    if (e.instanceId !== undefined) waveUntil.current[e.instanceId] = clock.current + 2.6;
  };
  const hoverOn = () => (document.body.style.cursor = "pointer"), hoverOff = () => (document.body.style.cursor = "");

  return (
    <group>
      {PARTS.map((p) => (
        <instancedMesh
          key={p}
          ref={(m) => void (refs.current[p] = m)}
          args={[geos[p], mats.body, n * (PAIRED.includes(p) ? 2 : 1)]}
          frustumCulled={false}
          {...(p === "torso" ? { onClick: wave, onPointerOver: hoverOn, onPointerOut: hoverOff } : {})}
        />
      ))}
      <instancedMesh ref={(m) => void (refs.current.phone = m)} args={[geos.phone, mats.phone, n]} frustumCulled={false} />
      <instancedMesh ref={(m) => void (refs.current.shadow = m)} args={[undefined, mats.shadow, n]} frustumCulled={false}>
        <planeGeometry args={[0.9, 0.9]} />
      </instancedMesh>
    </group>
  );
}
