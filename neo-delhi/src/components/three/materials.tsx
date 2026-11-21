"use client";

import { useTexture } from "@react-three/drei";
import { createContext, useContext, useMemo } from "react";
import * as THREE from "three";
import { NEON } from "./util";

// CC0 photo-scanned textures from Poly Haven, recompressed in /public/assets/textures.
const TEX = ["red_sandstone_wall", "large_sandstone_blocks", "marble_01", "white_stucco", "red_plaster_weathered", "asphalt_02"] as const;
const urls = Object.fromEntries(TEX.flatMap((n) => [[`${n}_d`, `/assets/textures/${n}/diff.jpg`], [`${n}_n`, `/assets/textures/${n}/nor_gl.jpg`]]));

// Tiles per 4 world units (boxUV default), tuned so blocks and cracks read at real-world size.
const REPEAT: Record<string, number> = { red_sandstone_wall: 2.5, large_sandstone_blocks: 2, marble_01: 1.5, white_stucco: 2, red_plaster_weathered: 1.5, asphalt_02: 2 };

function build(t: Record<string, THREE.Texture>) {
  Object.entries(t).forEach(([k, tex]) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    const r = REPEAT[k.slice(0, -2)];
    tex.repeat.set(r, r);
    tex.anisotropy = 8;
    if (k.endsWith("_d")) tex.colorSpace = THREE.SRGBColorSpace;
  });
  const pbr = (name: (typeof TEX)[number], o: THREE.MeshStandardMaterialParameters, normal = 1) =>
    new THREE.MeshStandardMaterial({ map: t[`${name}_d`], normalMap: t[`${name}_n`], normalScale: new THREE.Vector2(normal, normal), ...o });
  const glow = (c: THREE.ColorRepresentation, k: number) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), toneMapped: false });

  return {
    redStone: pbr("red_sandstone_wall", { color: "#c7928a", roughness: 0.9 }, 1.2), // Qutub Minar, Red Fort
    redStoneDark: pbr("red_sandstone_wall", { color: "#8e5a50", roughness: 0.95 }, 1.5), // carved bands
    gateStone: pbr("large_sandstone_blocks", { color: "#d9b79c", roughness: 0.85 }), // India Gate (buff + red sandstone)
    gateStoneRed: pbr("large_sandstone_blocks", { color: "#a8675a", roughness: 0.9 }),
    marble: pbr("marble_01", { color: "#f4f1ec", roughness: 0.22, side: THREE.DoubleSide }, 0.4), // Lotus Temple
    stucco: pbr("white_stucco", { color: "#ebe6dc", roughness: 0.9 }, 0.8), // Connaught Place
    concrete: pbr("white_stucco", { color: "#6e6b68", roughness: 0.95 }, 1.2), // Metro tunnel
    plaster: (tint: string) => pbr("red_plaster_weathered", { color: tint, roughness: 0.95 }, 1.3), // Chandni Chowk
    asphalt: pbr("asphalt_02", { color: "#3a3836", roughness: 0.62 }, 0.8), // damp night road
    granite: pbr("marble_01", { color: "#3a3a3f", roughness: 0.12 }, 0.3), // station floor
    steel: new THREE.MeshStandardMaterial({ color: "#c3c6cc", metalness: 0.9, roughness: 0.28 }),
    darkMetal: new THREE.MeshStandardMaterial({ color: "#2a2b2f", metalness: 0.7, roughness: 0.45 }),
    iron: new THREE.MeshStandardMaterial({ color: "#3d342d", metalness: 0.75, roughness: 0.55 }),
    blackStone: new THREE.MeshStandardMaterial({ color: "#121214", roughness: 0.15 }),
    glass: new THREE.MeshStandardMaterial({ color: "#0a0d12", metalness: 0.6, roughness: 0.08 }),
    water: new THREE.MeshStandardMaterial({ color: "#04070b", metalness: 0.3, roughness: 0.03 }),
    grass: new THREE.MeshStandardMaterial({ color: "#0f1a10", roughness: 1 }),
    wire: new THREE.MeshStandardMaterial({ color: "#0c0c0d", roughness: 0.8 }),
    // Emissive (bloom) materials. Values > 1 so only real light sources glow.
    neon: glow(NEON, 3.2),
    neonSoft: glow(NEON, 1.4),
    sodium: glow("#ffab5e", 2.4), // street lamps
    tungsten: glow("#ffc58a", 1.25), // shop and window light
    cool: glow("#e8f0ff", 2), // tube lights
    marigold: new THREE.MeshStandardMaterial({ color: "#ff8a00", roughness: 0.8, emissive: "#7a2a00", emissiveIntensity: 0.4 }),
  };
}

export type Mats = ReturnType<typeof build>;
const Ctx = createContext<Mats | null>(null);

export function MaterialsProvider({ children }: { children: React.ReactNode }) {
  const tex = useTexture(urls) as unknown as Record<string, THREE.Texture>;
  const mats = useMemo(() => build(tex), [tex]);
  return <Ctx.Provider value={mats}>{children}</Ctx.Provider>;
}

export function useMats() {
  const m = useContext(Ctx);
  if (!m) throw new Error("useMats outside MaterialsProvider");
  return m;
}
