"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { sfx } from "@/lib/scroll";
import { useMats } from "../materials";
import { PLACES } from "../path";
import { hover, HoloRing } from "../props";
import { arcadeWall, rand, setInstances, uv, type V3 } from "../util";

// Kept from the first Chandni Chowk pass: flickering neon signs, spice stalls, Jama Masjid.
const { start: Z0, rightEnd: ZR } = PLACES.chowk;

/** Neon sign with the occasional faulty-tube flicker; click to make it stutter. */
export function FlickerSign({ seed, map, position, rotation }: { seed: number; map: THREE.Texture; position: V3; rotation: V3 }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map, toneMapped: false }), [map]);
  const st = useRef({ t: rand(seed) * 9, next: 2 + rand(seed + 1) * 6, until: 0 });
  useFrame((_, dt) => {
    const f = st.current;
    f.t += dt;
    if (f.t > f.next) {
      f.until = f.t + 0.15 + rand(f.t) * 0.5;
      f.next = f.t + 3 + rand(f.t + seed) * 9;
    }
    const off = f.t < f.until && Math.sin(f.t * 60) > 0;
    mat.color.setScalar(off ? 0.12 : 1);
  });
  return (
    <mesh
      position={position}
      rotation={rotation}
      material={mat}
      {...hover}
      onClick={(e) => {
        e.stopPropagation();
        st.current.until = st.current.t + 0.8;
        sfx("chime");
      }}
    >
      <planeGeometry args={[3.2, 1.6]} />
    </mesh>
  );
}


/** Market stalls with heaped spices and dry fruit along the lane (as in the reference). */
export function Stalls() {
  const m = useMats();
  const table = useRef<THREE.InstancedMesh>(null);
  const heap = useRef<THREE.InstancedMesh>(null);
  const awning = useRef<THREE.InstancedMesh>(null);
  const awnGeo = useMemo(() => new THREE.PlaneGeometry(1.2, 3.0).rotateX(-Math.PI / 2), []);
  const heapMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true }), []);
  const awnMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#7a0d14", roughness: 0.8, side: THREE.DoubleSide }), []);
  useLayoutEffect(() => {
    const t: { p: V3 }[] = [], h: { p: V3; s: V3; c: THREE.Color }[] = [], a: { p: V3; r: V3 }[] = [];
    const SPICE = ["#c2410c", "#b91c1c", "#d97706", "#a16207", "#7c2d12", "#e5c07b"];
    for (let i = 0; i < 12; i++) {
      const side = i % 2 ? 1 : -1, z = Z0 - 6 - i * 3.6;
      if (side > 0 && z < ZR + 2) continue;
      t.push({ p: [side * 3.15, 0.45, z] });
      a.push({ p: [side * 3.1, 1.55, z], r: [0, 0, side * 0.3] });
      for (let k = 0; k < 4; k++)
        h.push({ p: [side * 3.15, 0.95, z - 1.05 + k * 0.7], s: [1, 0.7 + rand(i * 4 + k) * 0.5, 1], c: new THREE.Color(SPICE[Math.floor(rand(i + k * 3) * SPICE.length)]) });
    }
    setInstances(table.current, t);
    setInstances(heap.current, h);
    setInstances(awning.current, a);
  }, []);
  return (
    <group>
      <instancedMesh ref={table} args={[undefined, m.darkMetal, 12]}>
        <boxGeometry args={[0.9, 0.9, 3]} />
      </instancedMesh>
      <instancedMesh ref={heap} args={[undefined, heapMat, 48]}>
        <coneGeometry args={[0.3, 0.5, 7]} />
      </instancedMesh>
      {/* Canopy lies flat (x across, z along the lane) before the instance tilt slopes it towards the street */}
      <instancedMesh ref={awning} args={[awnGeo, awnMat, 12]}>
      </instancedMesh>
    </group>
  );
}


/** Onion dome profile (lathe), striped white marble like Jama Masjid's domes. */
function onionDome(r: number, h: number) {
  const pts = [[r, 0], [r * 1.12, h * 0.18], [r * 1.16, h * 0.32], [r * 1.05, h * 0.5], [r * 0.75, h * 0.68], [r * 0.38, h * 0.84], [r * 0.12, h * 0.95], [0, h]];
  return new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 40);
}

/** Jama Masjid (1656): red sandstone prayer hall with a central pointed iwan, three striped marble onion domes,
 *  two tall minarets banded in marble and sandstone, chhatris crowning them. Seen at the end of Chandni Chowk. */
export function JamaMasjid() {
  const m = useMats();
  const P = PLACES.masjid;
  const kiosks = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(
    () => ({
      hall: arcadeWall(24, 10, 7, [
        { x: 0, w: 6, spring: 5, pointed: true },
        ...[-1, 1].flatMap((s) => [4.6, 7.4, 10.2].map((x) => ({ x: s * x, w: 2, spring: 3.4, pointed: true }))),
      ]),
      iwan: arcadeWall(9.4, 14, 1.6, [{ x: 0, w: 6.2, spring: 5.4, pointed: true }]),
      big: onionDome(4.2, 9),
      small: onionDome(2.8, 6),
    }),
    [],
  );
  const domeMat = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 16;
    const g = c.getContext("2d")!;
    g.fillStyle = "#f2efe9";
    g.fillRect(0, 0, 512, 16);
    g.fillStyle = "#2a2626";
    for (let x = 0; x < 512; x += 32) g.fillRect(x, 0, 6, 16);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.3 });
  }, []);
  const gold = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c9a24a", metalness: 0.85, roughness: 0.3 }), []);
  useLayoutEffect(() => {
    setInstances(kiosks.current, [-9, -6, -3, 3, 6, 9].map((x) => ({ p: [x, 12.4, -10.6] as V3 })));
  }, []);
  const H0 = 2.4; // plinth height
  return (
    <group position={P}>
      <mesh material={m.redStone} position={[0, H0 / 2, -12]}>
        <boxGeometry args={[30, H0, 26]} ref={uv} />
      </mesh>
      <mesh material={m.redStone} position={[0, H0 / 4, 2.2]}>
        <boxGeometry args={[14, H0 / 2, 3]} ref={uv} />
      </mesh>
      <group position={[0, H0, 0]}>
        <mesh geometry={geo.hall} material={m.redStone} position={[0, 0, -14]} />
        <mesh geometry={geo.iwan} material={m.redStone} position={[0, 0, -9.7]} />
        {/* Marble trim lines on the iwan */}
        {[13.7, 6.2 + 5.4].map((y) => (
          <mesh key={y} material={m.marble} position={[0, y, -8.88]}>
            <boxGeometry args={[9.4, 0.18, 0.05]} />
          </mesh>
        ))}
        <instancedMesh ref={kiosks} args={[undefined, m.marble, 6]}>
          <sphereGeometry args={[0.6, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </instancedMesh>
        {/* Drums + onion domes + gold finials */}
        {([[0, 4.2, 9, 1.8], [-8.2, 2.8, 6, 1.2], [8.2, 2.8, 6, 1.2]] as const).map(([x, r, h, drum], i) => (
          <group key={i} position={[x, 10, -15]}>
            <mesh material={m.redStone} position={[0, drum / 2, 0]}>
              <cylinderGeometry args={[r, r, drum, 32]} ref={uv} />
            </mesh>
            <mesh geometry={i ? geo.small : geo.big} material={domeMat} position={[0, drum, 0]} />
            <mesh material={gold} position={[0, drum + h + 0.6, 0]}>
              <coneGeometry args={[0.18, 1.4, 8]} />
            </mesh>
          </group>
        ))}
        {/* Minarets: banded marble and sandstone, three balconies, chhatri on top */}
        {[-12.5, 12.5].map((x) => (
          <group key={x} position={[x, 0, -9]}>
            {Array.from({ length: 6 }, (_, k) => (
              <mesh key={k} material={k % 2 ? m.marble : m.redStone} position={[0, k * 4.2 + 2.1, 0]}>
                <cylinderGeometry args={[1 - (k + 1) * 0.05, 1 - k * 0.05, 4.2, 16]} ref={uv} />
              </mesh>
            ))}
            {[8.4, 16.8, 25.2].map((y) => (
              <mesh key={y} material={m.redStone} position={[0, y, 0]}>
                <cylinderGeometry args={[1.45, 1.2, 0.35, 16]} ref={uv} />
              </mesh>
            ))}
            <group scale={0.55}>
              <ChhatriPavilion position={[0, 25.2 / 0.55, 0]} />
            </group>
          </group>
        ))}
      </group>
      <HoloRing center={[0, 21, -14]} radius={16} tilt={0.15} />
    </group>
  );
}

export function ChhatriPavilion({ position }: { position: V3 }) {
  const m = useMats();
  return (
    <group position={position}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} material={m.redStone} position={[Math.cos(a) * 1.6, 1.1, Math.sin(a) * 1.6]}>
            <cylinderGeometry args={[0.12, 0.12, 2.2, 8]} />
          </mesh>
        );
      })}
      <mesh material={m.redStone} position={[0, 2.3, 0]}>
        <cylinderGeometry args={[2.2, 2.2, 0.25, 8]} />
      </mesh>
      <mesh material={m.marble} position={[0, 2.4, 0]} scale={[1, 1.2, 1]}>
        <sphereGeometry args={[1.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={m.redStone} position={[0, 4.4, 0]}>
        <coneGeometry args={[0.12, 0.9, 8]} />
      </mesh>
    </group>
  );
}
