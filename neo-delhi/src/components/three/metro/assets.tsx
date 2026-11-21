"use client";

import { useGLTF, useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { NEON } from "../util";
import { TRAIN_CLIP } from "./layout";

// CC0 photo-scanned materials and models from Poly Haven (polyhaven.com), resized in /public/assets.
const SURF = ["square_tiled_wall", "long_white_tiles", "granite_tile", "concrete_wall_006", "metal_plate", "rubber_tiles", "painted_concrete"] as const;
const SURF_URLS = Object.fromEntries(SURF.flatMap((n) => (["diff", "nor_gl", "arm"] as const).map((k) => [`${n}:${k}`, `/assets/textures/metro/${n}/${k}.webp`])));
// Draco-compressed GLBs; the decoder is self-hosted in /public/draco (drei's default fetches it from gstatic).
const MODEL = (n: string) => `/assets/3d/metro/${n}.glb`;
const DRACO = "/draco/";
export const MODELS = {
  camera: MODEL("security_camera_01"),
  extinguisher: MODEL("korean_fire_extinguisher_01"),
  bin: MODEL("metal_trash_can"),
  bench: MODEL("modular_street_seating"),
  pipes: MODEL("modular_industrial_pipes_01"),
  tube: MODEL("mounted_fluorescent_lights"),
};
export const POSTERS = ["india-gate", "qutub", "lotus", "masjid"] as const;
const POSTER_URLS = Object.fromEntries(POSTERS.map((p) => [p, `/assets/textures/metro/posters/${p}.webp`]));


/** Bright neutral "room" reflections for everything indoors (steel, glass, polished floor). */
function useStationEnv() {
  const gl = useThree((s) => s.gl);
  return useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
    pmrem.dispose();
    return env;
  }, [gl]);
}

function useMetroMaterials() {
  const tex = useTexture(SURF_URLS) as unknown as Record<string, THREE.Texture>;
  const texKey = Object.values(tex).map((t) => t.uuid).join();
  const env = useStationEnv();
  return useMemo(() => {
    const t = (n: (typeof SURF)[number], repeat: number) => {
      const get = (k: string) => {
        const x = tex[`${n}:${k}`].clone();
        x.wrapS = x.wrapT = THREE.RepeatWrapping;
        x.repeat.set(repeat, repeat);
        x.anisotropy = 8;
        if (k === "diff") x.colorSpace = THREE.SRGBColorSpace;
        x.needsUpdate = true;
        return x;
      };
      const arm = get("arm");
      return { map: get("diff"), normalMap: get("nor_gl"), roughnessMap: arm, metalnessMap: arm, aoMap: arm };
    };
    const pbr = (n: (typeof SURF)[number], repeat: number, o: THREE.MeshStandardMaterialParameters) =>
      new THREE.MeshStandardMaterial({ ...t(n, repeat), envMap: env, envMapIntensity: 0.55, ...o });
    const glow = (c: THREE.ColorRepresentation, k: number) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), toneMapped: false });
    const clip = TRAIN_CLIP;
    return {
      env,
      wall: pbr("square_tiled_wall", 2.6, { color: "#d6d2ca", roughness: 0.55 }),
      wallLong: pbr("long_white_tiles", 1.6, { color: "#cfccc6", roughness: 0.5 }),
      floor: pbr("granite_tile", 2.2, { color: "#7b7671", roughness: 0.42, envMapIntensity: 0.9 }),
      dado: pbr("granite_tile", 2.2, { color: "#2a2828", roughness: 0.3, envMapIntensity: 0.9 }),
      concrete: pbr("concrete_wall_006", 1.1, { color: "#8d8880" }),
      concreteDark: pbr("concrete_wall_006", 1.1, { color: "#4b4844" }),
      painted: pbr("painted_concrete", 1.4, { color: "#6a6762" }),
      panel: pbr("metal_plate", 1.6, { color: "#b4b7bc", metalness: 0.8, roughness: 0.45, envMapIntensity: 0.8 }),
      panelDark: pbr("metal_plate", 1.6, { color: "#3c3e44", metalness: 0.75, roughness: 0.5 }),
      tactile: pbr("rubber_tiles", 5, { color: "#e3a600", roughness: 0.7 }),
      steel: new THREE.MeshStandardMaterial({ color: "#c8ccd2", metalness: 0.92, roughness: 0.28, envMap: env, envMapIntensity: 1 }),
      black: new THREE.MeshStandardMaterial({ color: "#0b0b0d", roughness: 0.6, envMap: env, envMapIntensity: 0.3 }),
      rubber: new THREE.MeshStandardMaterial({ color: "#111112", roughness: 0.9 }),
      rail: new THREE.MeshStandardMaterial({ color: "#8f8c88", metalness: 0.9, roughness: 0.35, envMap: env, envMapIntensity: 0.8 }),
      glass: new THREE.MeshPhysicalMaterial({ color: "#c9d6dc", metalness: 0, roughness: 0.04, transparent: true, opacity: 0.16, envMap: env, envMapIntensity: 1.4, depthWrite: false }),
      warm: glow("#ffe6c4", 2.2), // ceiling light diffusers
      cool: glow("#eef3ff", 1.8),
      neon: glow(NEON, 3.2), // crimson accents — LED strips only
      neonSoft: glow(NEON, 1.5),
      green: glow("#25e07a", 2.2),
      amber: glow("#ffa21a", 2.2),
      white: glow("#ffffff", 4),
      dark: new THREE.MeshBasicMaterial({ color: "#020203" }),
      // Train materials are clipped at the tunnel mouths.
      train: {
        steel: new THREE.MeshPhysicalMaterial({ color: "#cfd3d8", metalness: 0.95, roughness: 0.26, anisotropy: 0.7, envMap: env, envMapIntensity: 1.25, clippingPlanes: clip }),
        steelDark: new THREE.MeshStandardMaterial({ color: "#4a4d53", metalness: 0.85, roughness: 0.4, envMap: env, envMapIntensity: 0.8, clippingPlanes: clip }),
        under: new THREE.MeshStandardMaterial({ color: "#1d1e21", metalness: 0.6, roughness: 0.6, envMap: env, envMapIntensity: 0.3, clippingPlanes: clip }),
        red: new THREE.MeshPhysicalMaterial({ color: "#b3121e", metalness: 0.3, roughness: 0.3, clearcoat: 1, envMap: env, envMapIntensity: 0.9, clippingPlanes: clip }),
        black: new THREE.MeshPhysicalMaterial({ color: "#060708", roughness: 0.12, clearcoat: 1, envMap: env, envMapIntensity: 1.4, clippingPlanes: clip }),
        rubber: new THREE.MeshStandardMaterial({ color: "#0d0d0e", roughness: 0.9, clippingPlanes: clip }),
        window: new THREE.MeshPhysicalMaterial({ color: "#1a2228", roughness: 0.05, transparent: true, opacity: 0.42, envMap: env, envMapIntensity: 1.6, depthWrite: false, clippingPlanes: clip }),
        interior: new THREE.MeshStandardMaterial({ color: "#d9d4ca", roughness: 0.7, emissive: "#3b362e", side: THREE.BackSide, clippingPlanes: clip }),
        floor: new THREE.MeshStandardMaterial({ color: "#5a5a60", roughness: 0.8, emissive: "#151516", clippingPlanes: clip }),
        seat: new THREE.MeshStandardMaterial({ color: "#9aa4ae", metalness: 0.85, roughness: 0.3, envMap: env, clippingPlanes: clip }),
        chrome: new THREE.MeshStandardMaterial({ color: "#e6e8ea", metalness: 1, roughness: 0.12, envMap: env, envMapIntensity: 1.4, clippingPlanes: clip }),
        light: new THREE.MeshBasicMaterial({ color: new THREE.Color("#fff3e2").multiplyScalar(1.8), toneMapped: false, clippingPlanes: clip }),
        head: new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffffff").multiplyScalar(6), toneMapped: false, clippingPlanes: clip }),
        tail: new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff1a2a").multiplyScalar(5), toneMapped: false, clippingPlanes: clip }),
        indicator: new THREE.MeshBasicMaterial({ color: "#000", toneMapped: false, clippingPlanes: clip }),
      },
    };
      // eslint-disable-next-line react-hooks/exhaustive-deps -- useTexture returns a new wrapper object each render; key on the textures
  }, [env, texKey]);
}

export type MetroMats = ReturnType<typeof useMetroMaterials>;

/** Meshes (geometry + material) under one named node of a glTF model, with the station reflections applied. */
export function useModelPart(url: string, node: string, env: THREE.Texture | null, tweak?: (m: THREE.MeshStandardMaterial) => void) {
  const { nodes } = useGLTF(url, DRACO) as unknown as { nodes: Record<string, THREE.Object3D> };
  return useMemo(() => {
    const parts: { geometry: THREE.BufferGeometry; material: THREE.MeshStandardMaterial }[] = [];
    nodes[node].traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
      mat.envMap = env;
      mat.envMapIntensity = 0.7;
      tweak?.(mat);
      parts.push({ geometry: mesh.geometry, material: mat });
    });
    return parts;
  }, [nodes, node, env, tweak]);
}

export function usePosterImages() {
  return useTexture(POSTER_URLS) as unknown as Record<(typeof POSTERS)[number], THREE.Texture>;
}

export { useMetroMaterials };
