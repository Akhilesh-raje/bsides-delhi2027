"use client";

import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { sfx, weight, worldState } from "@/lib/scroll";
import { Flag } from "../Flag";
import { Crowd, randomLook, staffLook, type Pose } from "../humans";
import { arcadeWall, uv, type V3 } from "../util";
import { MODELS, type MetroMats, POSTERS, useMetroMaterials, useModelPart, usePosterImages } from "./assets";
import { Inst } from "./Inst";
import {
  BACK, BORE, CEIL, CEIL_T, COLUMNS, CYCLE, DOOR_Z, EDGE, ESC, HANGING, MODEL, metroTime, OPEN, PH, PSD_X, SH0, SH1, tickMetro, TRACK, TWALL, Z0, Z1, type Item,
} from "./layout";
import { aoGradient, columnBoard, DIRECTORY, directionBoard, directoryBoard, doorDecal, exitSign, muralBoard, notice, pidsBoard, posterTexture, stationBoard } from "./signs";
import { Train } from "./Train";

const HALL = SH0 - SH1; // 86
const HZ = (SH0 + SH1) / 2;
const hover = { onPointerOver: () => (document.body.style.cursor = "pointer"), onPointerOut: () => (document.body.style.cursor = "") };
const go = (id: string) => document.querySelector<HTMLAnchorElement>(`a[href="#${id}"]`)?.click();
const along = (z0: number, z1: number, step: number, fn: (z: number, i: number) => Item | Item[] | null) => {
  const out: Item[] = [];
  for (let z = z0, i = 0; z > z1; z -= step, i++) {
    const r = fn(z, i);
    if (r) out.push(...(Array.isArray(r) ? r : [r]));
  }
  return out;
};

/** Circular-ish TBM bores at both ends of the station: lining with ring joints, slab track, walkway, cables, lights. */
const BORE_SEGS: [number, number][] = [[Z0, SH0], [SH1, Z1]];

/** Renders every mesh of a model part as one InstancedMesh per material. */
function Model({ parts, items }: { parts: ReturnType<typeof useModelPart>; items: Item[] }) {
  return (
    <>
      {parts.map((pt, i) => (
        <Inst key={i} items={items} geometry={pt.geometry} material={pt.material} />
      ))}
    </>
  );
}

function Bores({ m }: { m: MetroMats }) {
  const tube = useModelPart(MODELS.tube, "mounted_fluorescent_lights_a", m.env, tubeGlow);
  const geo = useMemo(() => {
    const hole = [{ x: BORE.x, w: BORE.w, spring: BORE.spring, y: 0.02 }];
    return {
      near: arcadeWall(10.5, 8.5, Z0 - SH0, hole),
      far: arcadeWall(10.5, 8.5, SH1 - Z1, hole),
      ring: arcadeWall(10.5, 8.5, 0.16, [{ x: BORE.x, w: BORE.w - 0.18, spring: BORE.spring, y: 0.02 }]),
    };
  }, []);
  const items = useMemo(() => {
    const per = (fn: (z: number, i: number) => Item | Item[] | null, step: number) => BORE_SEGS.flatMap(([a, b]) => along(a - 0.5, b, step, fn));
    return {
      rings: per((z) => ({ p: [0, 0, z] }), 1.5),
      posts: per((z) => ({ p: [-2.35, 1.35, z] }), 2),
      brackets: per((z) => [1.5, 1.8, 2.1].map((y) => ({ p: [-3.42, y, z] }) as Item), 1.5),
      lights: per((z) => ({ p: [4.42, 2.3, z], r: [0, Math.PI / 2, 0], s: [MODEL * 1.8, MODEL * 1.8, MODEL * 1.8] }), 5),
    };
  }, []);
  return (
    <group>
      <mesh geometry={geo.near} material={m.concrete} position={[0, 0, (Z0 + SH0) / 2]} />
      <mesh geometry={geo.far} material={m.concrete} position={[0, 0, (SH1 + Z1) / 2]} />
      <Inst items={items.rings} geometry={geo.ring} material={m.concreteDark} />
      {BORE_SEGS.map(([a, b]) => (
        <group key={a}>
          <mesh material={m.painted} rotation={[-Math.PI / 2, 0, 0]} position={[BORE.x, 0.01, (a + b) / 2]}>
            <planeGeometry args={[BORE.w, a - b]} ref={uv} />
          </mesh>
          {/* Maintenance walkway with handrail, cable run on the wall */}
          <mesh material={m.painted} position={[-2.85, 0.42, (a + b) / 2]}>
            <boxGeometry args={[1.1, 0.85, a - b]} ref={uv} />
          </mesh>
          <mesh material={m.amber} position={[-2.35, 1.85, (a + b) / 2]}>
            <boxGeometry args={[0.04, 0.04, a - b]} />
          </mesh>
          {[1.5, 1.8, 2.1].map((y) => (
            <mesh key={y} material={m.rubber} position={[-3.36, y + 0.04, (a + b) / 2]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.045, 0.045, a - b, 8]} />
            </mesh>
          ))}
        </group>
      ))}
      <Inst items={items.posts} material={m.steel}>
        <boxGeometry args={[0.05, 1.0, 0.05]} />
      </Inst>
      <Inst items={items.brackets} material={m.panelDark}>
        <boxGeometry args={[0.22, 0.03, 0.06]} />
      </Inst>
      <Model parts={tube} items={items.lights} />
      <Signal m={m} z={SH0 + 3} watch="departing" />
      <Signal m={m} z={SH1 - 3} watch="arriving" />
    </group>
  );
}
const tubeGlow = (mat: THREE.MeshStandardMaterial) => {
  if (!mat.name.includes("glass")) return;
  mat.emissive.set("#ffe8c8");
  mat.emissiveIntensity = 3.5;
  mat.toneMapped = false;
};

/** Two-aspect track signal: green while a train is cleared through it, red otherwise. */
function Signal({ m, z, watch }: { m: MetroMats; z: number; watch: "arriving" | "departing" }) {
  const red = useMemo(() => m.neon.clone(), [m]);
  const green = useMemo(() => m.green.clone(), [m]);
  useFrame(() => {
    const clear = worldState.metro.phase === watch;
    red.color.set(clear ? "#200304" : "#ff2030").multiplyScalar(clear ? 1 : 3);
    green.color.set(clear ? "#25e07a" : "#03140a").multiplyScalar(clear ? 2.6 : 1);
  });
  return (
    <group position={[4.0, 2.5, z]}>
      <mesh material={m.black}>
        <boxGeometry args={[0.32, 0.72, 0.2]} />
      </mesh>
      <mesh material={red} position={[0, 0.16, 0.105]}>
        <circleGeometry args={[0.09, 16]} />
      </mesh>
      <mesh material={green} position={[0, -0.16, 0.105]}>
        <circleGeometry args={[0.09, 16]} />
      </mesh>
      <mesh material={m.steel} position={[0, -1.4, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 2.1, 8]} />
      </mesh>
    </group>
  );
}

/** Station box: platform, walls, ceilings, columns, track, overhead conductor, services. */
function Hall({ m }: { m: MetroMats }) {
  const pipe = useModelPart(MODELS.pipes, "modular_industrial_pipes_01_pipe02", m.env);
  const endWall = useMemo(() => arcadeWall(TWALL - BACK, CEIL_T, 0.6, [{ x: BORE.x - (BACK + TWALL) / 2, w: BORE.w, spring: BORE.spring, y: 0.02 }]), []);
  const ao = useMemo(() => {
    const t = aoGradient();
    return new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false });
  }, []);
  const paint = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e9e6df", roughness: 0.6 }), []);
  const items = useMemo(() => {
    const plen = 1.95 * MODEL;
    return {
      columns: COLUMNS.map((z) => ({ p: [-4.2, (PH + CEIL) / 2, z] }) as Item),
      plinths: COLUMNS.map((z) => ({ p: [-4.2, PH + 0.2, z] }) as Item),
      beams: COLUMNS.map((z) => ({ p: [(BACK + 0.9) / 2, CEIL - 0.18, z] }) as Item),
      slots: along(SH0 - 1.5, SH1 + 1, 2.4, (z) =>
        [-5.7, -3.3, -1.0].filter((x) => !(x < -4.8 && z < -115 && z > -124)).map((x) => ({ p: [x, CEIL - 0.02, z] }) as Item),
      ),
      pipes: [3.6, 4.15].flatMap((x) => along(SH0, SH1, plen, (z) => ({ p: [x, 6.5, z - plen / 2], r: [Math.PI / 2, 0, 0], s: [MODEL, MODEL, MODEL] }))),
      borePipes: [[Z0, SH0], [SH1, Z1]].flatMap(([a, b]) => along(a, b, plen, (z) => ({ p: [-1.0, 5.7, z - plen / 2], r: [Math.PI / 2, 0, 0], s: [MODEL, MODEL, MODEL] }))),
      droppers: along(Z0 - 2, Z1, 6, (z) => ({ p: [TRACK, (4.38 + (z < SH0 && z > SH1 ? CEIL_T : 6.2)) / 2, z], s: [1, (z < SH0 && z > SH1 ? CEIL_T : 6.2) - 4.38, 1] })),
      clips: [TRACK - 0.6, TRACK + 0.6].flatMap((x) => along(Z0, Z1, 0.7, (z) => ({ p: [x, 0.2, z] }))),
    };
  }, []);
  const ceilPieces: [number, number, number, number][] = [
    // [x0, x1, z0, z1] — leaves an opening over the escalator
    [BACK, 0.9, SH0, -116],
    [BACK, 0.9, -123, SH1],
    [ESC.x1 + 0.1, 0.9, -116, -123],
  ];
  return (
    <group>
      {/* Platform block and finishes */}
      <mesh material={m.painted} position={[(BACK + EDGE) / 2, PH / 2, HZ]}>
        <boxGeometry args={[EDGE - BACK, PH, HALL]} ref={uv} />
      </mesh>
      <mesh material={m.floor} rotation={[-Math.PI / 2, 0, 0]} position={[(BACK + EDGE) / 2, PH + 0.004, HZ]}>
        <planeGeometry args={[EDGE - BACK, HALL]} ref={uv} />
      </mesh>
      <mesh material={m.tactile} rotation={[-Math.PI / 2, 0, 0]} position={[EDGE - 0.6, PH + 0.007, HZ]}>
        <planeGeometry args={[0.5, HALL]} ref={uv} />
      </mesh>
      <mesh material={paint} rotation={[-Math.PI / 2, 0, 0]} position={[EDGE - 0.12, PH + 0.008, HZ]}>
        <planeGeometry args={[0.1, HALL]} />
      </mesh>
      <mesh material={m.concreteDark} position={[EDGE - 0.15, PH - 0.02, HZ]}>
        <boxGeometry args={[0.32, 0.06, HALL]} />
      </mesh>
      <mesh material={m.concreteDark} position={[EDGE + 0.001, PH / 2, HZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[HALL, PH]} ref={uv} />
      </mesh>
      <mesh material={m.dark} position={[EDGE + 0.005, 0.4, HZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[HALL, 0.45]} />
      </mesh>
      {/* Back wall: tiles, granite dado, crimson LED line, contact shadow */}
      <mesh material={m.wall} position={[BACK, (PH + CEIL) / 2, HZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[HALL, CEIL - PH]} ref={uv} />
      </mesh>
      <mesh material={m.dado} position={[BACK + 0.03, PH + 0.3, HZ]}>
        <boxGeometry args={[0.06, 0.6, HALL]} ref={uv} />
      </mesh>
      <mesh material={m.neon} position={[BACK + 0.04, PH + 3.75, HZ]}>
        <boxGeometry args={[0.03, 0.03, HALL]} />
      </mesh>
      <mesh material={ao} position={[BACK + 0.08, PH + 0.5, HZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[HALL, 1.0]} />
      </mesh>
      <mesh material={ao} position={[BACK + 0.6, PH + 0.012, HZ]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
        <planeGeometry args={[HALL, 1.2]} />
      </mesh>
      {/* Track-side wall and track bed */}
      <mesh material={m.concreteDark} position={[TWALL, 0.6, HZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[HALL, 1.2]} ref={uv} />
      </mesh>
      <mesh material={m.wallLong} position={[TWALL, (1.2 + CEIL_T) / 2, HZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[HALL, CEIL_T - 1.2]} ref={uv} />
      </mesh>
      <mesh material={m.painted} rotation={[-Math.PI / 2, 0, 0]} position={[(EDGE + TWALL) / 2, 0.01, HZ]}>
        <planeGeometry args={[TWALL - EDGE, HALL]} ref={uv} />
      </mesh>
      {/* Ceilings: metal panels over the platform (opening above the escalator), concrete soffit over the track */}
      {ceilPieces.map(([x0, x1, z0, z1]) => (
        <mesh key={`${x0}${z0}`} material={m.panel} rotation={[Math.PI / 2, 0, 0]} position={[(x0 + x1) / 2, CEIL, (z0 + z1) / 2]}>
          <planeGeometry args={[x1 - x0, z0 - z1]} ref={uv} />
        </mesh>
      ))}
      <mesh material={m.warm} position={[(ESC.x0 + ESC.x1) / 2, CEIL + 1.8, -119.5]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 7]} />
      </mesh>
      <mesh material={m.panelDark} position={[0.9, (CEIL + CEIL_T) / 2, HZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[HALL, CEIL_T - CEIL]} ref={uv} />
      </mesh>
      <mesh material={m.neon} position={[0.93, CEIL + 0.04, HZ]}>
        <boxGeometry args={[0.03, 0.03, HALL]} />
      </mesh>
      <mesh material={m.concreteDark} rotation={[Math.PI / 2, 0, 0]} position={[(0.9 + TWALL) / 2, CEIL_T, HZ]}>
        <planeGeometry args={[TWALL - 0.9, HALL]} ref={uv} />
      </mesh>
      <Inst items={items.slots} material={m.warm}>
        <boxGeometry args={[1.5, 0.03, 0.18]} />
      </Inst>
      <Inst items={items.beams} material={m.panelDark}>
        <boxGeometry args={[0.9 - BACK, 0.36, 0.4]} />
      </Inst>
      {/* Columns clad in brushed panels on granite plinths */}
      <Inst items={items.columns} material={m.panel}>
        <boxGeometry args={[0.9, CEIL - PH, 0.9]} />
      </Inst>
      <Inst items={items.plinths} material={m.dado}>
        <boxGeometry args={[0.98, 0.4, 0.98]} />
      </Inst>
      {/* Station end walls around the bores */}
      {[SH0, SH1].map((z) => (
        <mesh key={z} geometry={endWall} material={m.wallLong} position={[(BACK + TWALL) / 2, 0, z]} />
      ))}
      {/* Track: slab, rails, fastening clips; rigid overhead conductor with droppers; service pipes */}
      <mesh material={m.concreteDark} position={[TRACK, 0.09, (Z0 + Z1) / 2]}>
        <boxGeometry args={[2.4, 0.18, Z0 - Z1]} ref={uv} />
      </mesh>
      {[TRACK - 0.6, TRACK + 0.6].map((x) => (
        <mesh key={x} material={m.rail} position={[x, 0.25, (Z0 + Z1) / 2]}>
          <boxGeometry args={[0.07, 0.14, Z0 - Z1]} />
        </mesh>
      ))}
      <Inst items={items.clips} material={m.black}>
        <boxGeometry args={[0.22, 0.05, 0.1]} />
      </Inst>
      <mesh material={m.rail} position={[TRACK, 4.32, (Z0 + Z1) / 2]}>
        <boxGeometry args={[0.1, 0.12, Z0 - Z1]} />
      </mesh>
      <Inst items={items.droppers} material={m.panelDark}>
        <cylinderGeometry args={[0.02, 0.02, 1, 6]} />
      </Inst>
      <Model parts={pipe} items={items.pipes} />
      <Model parts={pipe} items={items.borePipes} />
    </group>
  );
}

/** Half-height platform screen doors, synchronised with the train doors. */
function ScreenDoors({ m }: { m: MetroMats }) {
  const leaves = useRef<THREE.InstancedMesh>(null);
  const frames = useRef<THREE.InstancedMesh>(null);
  const status = useMemo(() => new THREE.MeshBasicMaterial({ color: "#000", toneMapped: false }), []);
  const glass = useMemo(() => {
    const g = m.glass.clone();
    g.side = THREE.DoubleSide;
    return g;
  }, [m]);
  const decal = useMemo(() => new THREE.MeshBasicMaterial({ map: doorDecal(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), []);
  const H = 1.3, W = 1.6;
  const { panels, posts, lamps, decals } = useMemo(() => {
    const doors = [...DOOR_Z].sort((a, b) => b - a);
    const edges = [SH0 - 1, ...doors.flatMap((z) => [z + W / 2, z - W / 2]), SH1 + 1];
    const panels: Item[] = [];
    for (let i = 0; i < edges.length; i += 2) panels.push({ p: [PSD_X, PH + H / 2, (edges[i] + edges[i + 1]) / 2], r: [0, Math.PI / 2, 0], s: [edges[i] - edges[i + 1], 1, 1] });
    return {
      panels,
      posts: edges.map((z) => ({ p: [PSD_X, PH + (H + 0.15) / 2, z] }) as Item),
      lamps: doors.map((z) => ({ p: [PSD_X - 0.08, PH + H + 0.06, z] }) as Item),
      decals: doors.map((z) => ({ p: [EDGE - 1.2, PH + 0.01, z], r: [-Math.PI / 2, 0, -Math.PI / 2] }) as Item),
    };
  }, []);
  const o = useMemo(() => new THREE.Object3D(), []);
  useFrame(() => {
    const open = worldState.metro.doors, phase = worldState.metro.phase;
    DOOR_Z.forEach((z, i) =>
      [-1, 1].forEach((k, j) => {
        o.position.set(PSD_X - 0.05, PH + (H - 0.05) / 2, z + k * (W / 4 + (W / 2) * open));
        o.rotation.set(0, Math.PI / 2, 0);
        o.updateMatrix();
        leaves.current?.setMatrixAt(i * 2 + j, o.matrix);
        o.position.set(PSD_X - 0.05, PH + (H - 0.05) / 2, z + k * (0.02 + (W / 2) * open));
        o.rotation.set(0, 0, 0);
        o.updateMatrix();
        frames.current?.setMatrixAt(i * 2 + j, o.matrix);
      }),
    );
    if (leaves.current) leaves.current.instanceMatrix.needsUpdate = true;
    if (frames.current) frames.current.instanceMatrix.needsUpdate = true;
    status.color.set(phase === "doors-closing" ? (Math.floor(metroTime.s * 4) % 2 ? "#000" : "#ffa21a") : phase === "doors-open" ? "#25e07a" : "#ff2030").multiplyScalar(2.2);
  });
  return (
    <group>
      <Inst items={panels} material={glass}>
        <planeGeometry args={[1, H]} />
      </Inst>
      <Inst items={posts} material={m.steel}>
        <boxGeometry args={[0.1, H + 0.15, 0.08]} />
      </Inst>
      <mesh material={m.steel} position={[PSD_X, PH + H + 0.06, HZ]}>
        <boxGeometry args={[0.16, 0.12, HALL - 2]} />
      </mesh>
      <mesh material={m.neon} position={[PSD_X, PH + H + 0.125, HZ]}>
        <boxGeometry args={[0.03, 0.015, HALL - 2]} />
      </mesh>
      <Inst items={lamps} material={status}>
        <boxGeometry args={[0.02, 0.05, 0.3]} />
      </Inst>
      <Inst items={decals} material={decal}>
        <planeGeometry args={[W, 1.6]} />
      </Inst>
      <instancedMesh ref={leaves} args={[undefined, glass, DOOR_Z.length * 2]} frustumCulled={false}>
        <planeGeometry args={[W / 2 - 0.02, H - 0.05]} />
      </instancedMesh>
      <instancedMesh ref={frames} args={[undefined, m.steel, DOOR_Z.length * 2]} frustumCulled={false}>
        <boxGeometry args={[0.05, H - 0.05, 0.04]} />
      </instancedMesh>
    </group>
  );
}

/** Up escalator to the concourse: moving steps, glass balustrades, black handrails. Click to reverse it. */
const ESC_ANGLE = 0.524; // 30°
const ESC_RUN = (ESC.z0 - ESC.z1) / Math.cos(ESC_ANGLE) + 4; // incline length, overshooting through the ceiling opening
const escalator = { dir: 1 };
export const escalatorPoint = (f: number): V3 => [(ESC.x0 + ESC.x1) / 2, PH + 0.15 + f * ESC_RUN * Math.sin(ESC_ANGLE), ESC.z0 - f * ESC_RUN * Math.cos(ESC_ANGLE)];

function Escalator({ m }: { m: MetroMats }) {
  const steps = useRef<THREE.InstancedMesh>(null);
  const N = Math.ceil(ESC_RUN / 0.42);
  const t = useRef(0);
  const o = useMemo(() => new THREE.Object3D(), []);
  useFrame((_, dt) => {
    t.current += Math.min(dt, 0.1) * 0.5 * escalator.dir;
    for (let i = 0; i < N; i++) {
      const d = (((i * 0.42 + t.current) % ESC_RUN) + ESC_RUN) % ESC_RUN;
      o.position.set(0, 0.1, -d);
      o.updateMatrix();
      steps.current?.setMatrixAt(i, o.matrix);
    }
    if (steps.current) steps.current.instanceMatrix.needsUpdate = true;
  });
  const w = ESC.x1 - ESC.x0;
  return (
    <group
      position={[(ESC.x0 + ESC.x1) / 2, PH, ESC.z0]}
      onClick={(e) => {
        e.stopPropagation();
        escalator.dir *= -1;
        sfx("escalator");
      }}
      {...hover}
    >
      <mesh material={m.steel} position={[0, 0.02, 0.6]}>
        <boxGeometry args={[w, 0.04, 1.2]} />
      </mesh>
      <group rotation={[ESC_ANGLE, 0, 0]}>
        <instancedMesh ref={steps} args={[undefined, m.panelDark, N]} frustumCulled={false}>
          <boxGeometry args={[w - 0.3, 0.12, 0.4]} />
        </instancedMesh>
        {[-1, 1].map((s) => (
          <group key={s} position={[s * (w / 2 - 0.08), 0, -ESC_RUN / 2]}>
            <mesh material={m.steel} position={[0, 0.25, 0]}>
              <boxGeometry args={[0.12, 0.5, ESC_RUN]} />
            </mesh>
            <mesh material={m.glass} position={[0, 0.85, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[ESC_RUN, 0.75]} />
            </mesh>
            <mesh material={m.rubber} position={[0, 1.25, 0]}>
              <boxGeometry args={[0.1, 0.07, ESC_RUN]} />
            </mesh>
          </group>
        ))}
        <mesh material={m.panelDark} position={[0, -0.25, -ESC_RUN / 2]}>
          <boxGeometry args={[w, 0.4, ESC_RUN]} />
        </mesh>
      </group>
    </group>
  );
}

/** Imported fixtures: benches, bins, extinguishers, CCTV (CC0 models from Poly Haven). */
function Fixtures({ m }: { m: MetroMats }) {
  const seat = useModelPart(MODELS.bench, "seat_bench", m.env);
  const legs = useModelPart(MODELS.bench, "legs_double", m.env);
  const bin = useModelPart(MODELS.bin, "metal_trash_can", m.env);
  const lid = useModelPart(MODELS.bin, "metal_trash_can_lid", m.env);
  const ext = useModelPart(MODELS.extinguisher, "korean_fire_extinguisher_01", m.env);
  const items = useMemo(() => {
    const S: V3 = [MODEL, MODEL, MODEL];
    const benches = [-85.5, -96.5, -107.5, -130];
    return {
      seats: benches.map((z) => ({ p: [BACK + 0.62, PH + 0.45 * MODEL, z], r: [0, Math.PI / 2, 0], s: S }) as Item),
      legs: benches.flatMap((z) => [-0.75, 0.75].map((d) => ({ p: [BACK + 0.62, PH, z + d], r: [0, Math.PI / 2, 0], s: S }) as Item)),
      bins: [-91, -102, -126].map((z) => ({ p: [BACK + 0.45, PH, z], s: S }) as Item),
      lids: [-91, -102, -126].map((z) => ({ p: [BACK + 0.45, PH + 0.91 * MODEL, z], s: S }) as Item),
      exts: COLUMNS.slice(2).map((z) => ({ p: [-4.2, PH, z + 0.62], r: [0, 0, 0], s: S }) as Item),
    };
  }, []);
  return (
    <group>
      <Model parts={seat} items={items.seats} />
      <Model parts={legs} items={items.legs} />
      <Model parts={bin} items={items.bins} />
      <Model parts={lid} items={items.lids} />
      <Model parts={ext} items={items.exts} />
      {[-78, -100, -129].map((z) => (
        <Cctv key={z} m={m} position={[BACK + 0.25, CEIL - 0.45, z]} />
      ))}
    </group>
  );
}

/** Wall-mounted CCTV camera that slowly pans; click it and it turns to look straight at you. */
function Cctv({ m, position }: { m: MetroMats; position: V3 }) {
  const parts = useModelPart(MODELS.camera, "security_camera_01", m.env);
  const ref = useRef<THREE.Group>(null);
  const led = useMemo(() => m.neon.clone(), [m]);
  const st = useRef({ t: position[2], stare: 0 });
  useFrame(({ camera }, dt) => {
    const g = ref.current;
    if (!g) return;
    const s = st.current;
    s.t += dt;
    s.stare = Math.max(0, s.stare - dt);
    const target = s.stare > 0 ? Math.atan2(camera.position.x - position[0], camera.position.z - position[2]) : Math.PI / 2 + Math.sin(s.t * 0.35) * 0.55;
    g.rotation.y += (target - g.rotation.y) * Math.min(1, dt * (s.stare > 0 ? 6 : 1.5));
    led.color.set(s.stare > 0 && Math.floor(s.t * 6) % 2 ? "#ff2030" : "#3a0508").multiplyScalar(3);
  });
  return (
    <group
      ref={ref}
      position={position}
      rotation={[0, Math.PI / 2, 0]}
      onClick={(e) => {
        e.stopPropagation();
        st.current.stare = 4;
        sfx("cctv");
      }}
      {...hover}
    >
      <group rotation={[0.3, 0, 0]} scale={MODEL * 1.2}>
        {parts.map((pt, i) => (
          <mesh key={i} geometry={pt.geometry} material={pt.material} />
        ))}
        <mesh material={led} position={[0.05, 0.24, 0.12]}>
          <sphereGeometry args={[0.012, 8, 8]} />
        </mesh>
      </group>
    </group>
  );
}

/** Mounted boards: frame box + face. */
function Board({ m, position, rotation = [0, 0, 0], size, map, lit = true, onClick, rods }: { m: MetroMats; position: V3; rotation?: V3; size: [number, number]; map: THREE.Texture; lit?: boolean; onClick?: (e: ThreeEvent<MouseEvent>) => void; rods?: number }) {
  const face = useMemo(() => (lit ? new THREE.MeshBasicMaterial({ map, toneMapped: false, color: "#e8e8e8" }) : new THREE.MeshStandardMaterial({ map, roughness: 0.5, envMap: m.env, envMapIntensity: 0.4 })), [map, lit, m]);
  return (
    <group position={position} rotation={rotation}>
      <mesh material={m.panelDark} position={[0, 0, -0.05]}>
        <boxGeometry args={[size[0] + 0.1, size[1] + 0.1, 0.09]} />
      </mesh>
      <mesh material={face} position={[0, 0, 0.001]} {...(onClick ? { onClick, ...hover } : {})}>
        <planeGeometry args={size} />
      </mesh>
      {rods !== undefined &&
        [-size[0] / 2 + 0.2, size[0] / 2 - 0.2].map((x) => (
          <mesh key={x} material={m.steel} position={[x, size[1] / 2 + rods / 2, -0.05]}>
            <cylinderGeometry args={[0.02, 0.02, rods, 6]} />
          </mesh>
        ))}
    </group>
  );
}

const POSTER_COPY: Record<(typeof POSTERS)[number], [string, string, string]> = {
  "india-gate": ["SECURE · BUILD · DEFEND", "Get your pass →", "tickets"],
  qutub: ["A LEGACY OF INNOVATION", "Talks & workshops · Agenda →", "agenda"],
  lotus: ["COMMUNITY FIRST", "Partner with us →", "sponsors"],
  masjid: ["CAPTURE THE FLAG", "24h CTF · Villages →", "villages"],
};

function Signage({ m }: { m: MetroMats }) {
  const imgs = usePosterImages();
  const tex = useMemo(
    () => ({
      station: stationBoard(),
      platform: directionBoard("platform"),
      exit: directionBoard("exit"),
      exitSign: exitSign(),
      column: columnBoard(),
      line: notice("line"),
      smoke: notice("smoke"),
      help: notice("help"),
      directory: directoryBoard(),
      mural: muralBoard(),
      posters: Object.fromEntries(POSTERS.map((p) => [p, posterTexture(imgs[p].image as HTMLImageElement, POSTER_COPY[p][0], POSTER_COPY[p][1])])) as unknown as Record<(typeof POSTERS)[number], THREE.Texture>,
    }),
    [imgs],
  );
  const RY_IN = Math.PI / 2, RY_OUT = -Math.PI / 2; // faces +x (back wall) / -x (track wall)
  const trackPosters: [(typeof POSTERS)[number], number][] = [["india-gate", -79], ["qutub", -97], ["masjid", -115], ["lotus", -131]];
  return (
    <group>
      {/* Across the track: lit event posters between station name boards */}
      {trackPosters.map(([p, z]) => (
        <Board key={p} m={m} position={[TWALL - 0.08, 2.75, z]} rotation={[0, RY_OUT, 0]} size={[1.7, 2.26]} map={tex.posters[p]} onClick={(e) => (e.stopPropagation(), go(POSTER_COPY[p][2]))} />
      ))}
      {[-88, -106, -123].map((z) => (
        <Board key={z} m={m} position={[TWALL - 0.08, 3.1, z]} rotation={[0, RY_OUT, 0]} size={[4.4, 1.1]} map={tex.station} />
      ))}
      {/* Back wall: posters over benches, route mural */}
      {([["lotus", -80], ["india-gate", -102]] as const).map(([p, z]) => (
        <Board key={z} m={m} position={[BACK + 0.08, PH + 2.2, z]} rotation={[0, RY_IN, 0]} size={[1.4, 1.86]} map={tex.posters[p]} onClick={(e) => (e.stopPropagation(), go(POSTER_COPY[p][2]))} />
      ))}
      <Board m={m} position={[BACK + 0.08, PH + 2.3, -132]} rotation={[0, RY_IN, 0]} size={[6.4, 2.8]} map={tex.mural} lit={false} />
      {/* Hanging signs */}
      <Board m={m} position={[-1.8, 4.75, HANGING[1]]} size={[3.2, 0.8]} map={tex.platform} rods={CEIL - 4.75 - 0.4} />
      <Board m={m} position={[-1.8, 4.75, HANGING[2]]} size={[3.2, 0.8]} map={tex.exit} rods={CEIL - 4.75 - 0.4} />
      <Board m={m} position={[(ESC.x0 + ESC.x1) / 2, CEIL - 0.3, -115.9]} size={[1.3, 0.48]} map={tex.exitSign} />
      {/* Columns: vertical name boards, notices, directory, help point */}
      {COLUMNS.slice(1).map((z) => (
        <Board key={z} m={m} position={[-4.2 + 0.47, PH + 2.3, z]} rotation={[0, RY_IN, 0]} size={[0.6, 1.8]} map={tex.column} />
      ))}
      <Board
        m={m}
        position={[-4.2, PH + 1.9, -80 + 0.47]}
        size={[0.84, 0.52]}
        map={tex.directory}
        onClick={(e) => {
          e.stopPropagation();
          const row = Math.floor(((1 - (e.uv?.y ?? 0)) * 320 - 25) / 70);
          const target = DIRECTORY[row];
          if (target) go(target[1]);
        }}
      />
      {([["line", -91], ["help", -102], ["smoke", -113]] as const).map(([k, z]) => (
        <Board key={z} m={m} position={[-4.2, PH + 2.2, z + 0.47]} size={[0.5, 0.66]} map={tex[k]} lit={false} />
      ))}
      <HelpPoint m={m} position={[-4.2, PH + 1.2, -102 + 0.47]} />
    </group>
  );
}

/** Passenger help point: press for the station controller. */
function HelpPoint({ m, position }: { m: MetroMats; position: V3 }) {
  const btn = useMemo(() => m.green.clone(), [m]);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current = Math.max(0, t.current - dt);
    btn.color.set(t.current > 0 && Math.floor(t.current * 5) % 2 ? "#ffffff" : "#25e07a").multiplyScalar(2);
  });
  return (
    <group position={position}>
      <mesh material={m.steel} position={[0, 0, -0.04]}>
        <boxGeometry args={[0.32, 0.5, 0.08]} />
      </mesh>
      <mesh
        material={btn}
        position={[0, -0.08, 0.005]}
        onClick={(e) => {
          e.stopPropagation();
          t.current = 3;
          sfx("help");
        }}
        {...hover}
      >
        <circleGeometry args={[0.05, 20]} />
      </mesh>
      <mesh material={m.black} position={[0, 0.1, 0.005]}>
        <circleGeometry args={[0.08, 20]} />
      </mesh>
    </group>
  );
}

/** Live passenger information display hanging over the platform; click to switch language. */
function Pids({ m }: { m: MetroMats }) {
  const board = useMemo(() => pidsBoard(), []);
  const st = useRef({ last: -1, hindi: false, manual: 0, now: 0 });
  useFrame(({ clock }) => {
    const s = st.current, t = (s.now = clock.elapsedTime);
    if (t - s.last < 0.5) return;
    s.last = t;
    if (t > s.manual) s.hindi = Math.floor(t / 4) % 2 === 1; // alternates like the real boards
    const { phase, countdown } = worldState.metro;
    board.draw(phase, countdown, s.hindi);
  });
  return (
    <Board
      m={m}
      position={[-1.8, 4.7, HANGING[0]]}
      size={[2.6, 0.87]}
      map={board.tex}
      rods={CEIL - 4.7 - 0.43}
      onClick={(e) => {
        e.stopPropagation();
        st.current.hindi = !st.current.hindi;
        st.current.manual = st.current.now + 8;
        st.current.last = -1;
      }}
    />
  );
}

// ---- Platform crowd, choreographed by the timetable ----
const VISIBLE_DOORS = DOOR_Z.filter((z) => z <= -79);
type Agent = { kind: "board" | "alight" | "stroll" | "sit" | "phone" | "staff"; door?: number; k: number; x?: number; z?: number };
const AGENTS: Agent[] = [
  ...Array.from({ length: 10 }, (_, k) => ({ kind: "board" as const, door: VISIBLE_DOORS[k % VISIBLE_DOORS.length], k })),
  ...Array.from({ length: 10 }, (_, k) => ({ kind: "alight" as const, door: VISIBLE_DOORS[(k * 3) % VISIBLE_DOORS.length], k })),
  ...Array.from({ length: 6 }, (_, k) => ({ kind: "stroll" as const, k })),
  ...[-85.5, -96.5, -130].map((z, k) => ({ kind: "sit" as const, z, k })),
  { kind: "phone", x: -3.25, z: -86, k: 0 },
  { kind: "phone", x: -3.0, z: -99, k: 1 },
  { kind: "staff", x: -1.25, z: -90, k: 0 },
];
const local = (s: number, start: number) => (((s - start) % CYCLE) + CYCLE) % CYCLE;
const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.min(1, Math.max(0, t));

function walkTo(p: Pose, ax: number, az: number, bx: number, bz: number, f: number) {
  p.x = lerp(ax, bx, f);
  p.z = lerp(az, bz, f);
  p.yaw = Math.atan2(bx - ax, bz - az);
  p.mode = f >= 1 ? "idle" : "walk";
}

function PlatformCrowd() {
  const looks = useMemo(() => AGENTS.map((a, i) => (a.kind === "staff" ? staffLook(i) : randomLook(i * 2.9 + 17))), []);
  const update = (i: number, t: number, p: Pose) => {
    const a = AGENTS[i], s = metroTime.s;
    p.y = PH;
    p.visible = true;
    p.speed = 1;
    if (a.kind === "board") {
      const side = a.k % 2 ? 1 : -1, spotX = -0.95, spotZ = a.door! + side * 0.85;
      const start = (a.k * 1.6) % 12; // stagger arrivals on the platform
      const tau = local(s, start), board = local(OPEN + 1 + a.k * 0.35, start);
      if (tau < 10) walkTo(p, -3.3, spotZ - 18, spotX, spotZ, tau / 10);
      else if (tau < board) {
        p.x = spotX;
        p.z = spotZ;
        p.yaw = Math.PI / 2;
        p.mode = a.k % 3 ? "idle" : "phone";
      } else if (tau < board + 1.8) walkTo(p, spotX, spotZ, TRACK - 0.6, a.door!, (tau - board) / 1.8);
      else p.visible = false;
    } else if (a.kind === "alight") {
      const tau = local(s, OPEN + 0.7 + a.k * 0.45);
      const out: V3 = [-0.7, PH, a.door! - 0.3];
      const foot = escalatorPoint(0);
      const walk = Math.hypot(foot[0] - out[0], foot[2] - out[2]) / 1.5;
      if (tau < 1.3) walkTo(p, TRACK - 0.6, a.door!, out[0], out[2], tau / 1.3);
      else if (tau < 1.3 + walk) walkTo(p, out[0], out[2], foot[0], foot[2], (tau - 1.3) / walk);
      else if (tau < 1.3 + walk + 16) {
        const [x, y, z] = escalatorPoint((tau - 1.3 - walk) / 16);
        p.x = x;
        p.y = y;
        p.z = z;
        p.yaw = Math.PI;
        p.mode = a.k % 2 ? "phone" : "idle";
        p.visible = y < CEIL + 0.6;
      } else p.visible = false;
      if (tau > 1.3 + walk + 16) p.visible = false;
    } else if (a.kind === "stroll") {
      // Back-and-forth along the rear of the platform, clear of benches, columns and the escalator.
      const len = 40, f = ((t * 0.015 + a.k / 6) % 1) * 2, back = f > 1;
      const zA = -62 - a.k * 1.5, zB = zA - len, x = -5.6 + (a.k % 3) * 0.25;
      walkTo(p, x, back ? zB : zA, x, back ? zA : zB, back ? f - 1 : f);
      if (p.mode === "idle") p.mode = "walk";
    } else if (a.kind === "sit") {
      p.x = BACK + 0.75;
      p.z = a.z! + (a.k - 1) * 0.3;
      p.yaw = Math.PI / 2;
      p.mode = "sit";
    } else {
      p.x = a.x!;
      p.z = a.z!;
      p.yaw = a.kind === "staff" ? Math.PI / 2 : Math.PI * 0.8;
      // Station staff signals with a raised arm while the doors close.
      p.mode = a.kind === "staff" ? (worldState.metro.phase === "doors-closing" ? "wave" : "idle") : "phone";
    }
  };
  return <Crowd looks={looks} update={update} scale={MODEL} />;
}

function Clock() {
  useFrame((_, dt) => tickMetro(dt));
  return null;
}

/** The whole Rajiv Chowk chapter. Loads its own textures and models (streams in without blocking other scenes). */
export function MetroTunnel() {
  return (
    <>
      <Clock />
      <Suspense fallback={null}>
        <MetroWorld />
      </Suspense>
      <Flag id="tunnel" position={[-6.2, 4.6, -96]} />
    </>
  );
}

function MetroWorld() {
  const m = useMetroMaterials();
  return (
    <group>
      <Bores m={m} />
      <Hall m={m} />
      <ScreenDoors m={m} />
      <Escalator m={m} />
      <Fixtures m={m} />
      <Signage m={m} />
      <Pids m={m} />
      <Train mats={m} />
      <PlatformCrowd />
    </group>
  );
}

/** Lights for this chapter live outside the chapter groups (toggling light visibility recompiles shaders). */
export function TunnelLight() {
  const ref = useRef<THREE.PointLight>(null);
  const fill = useRef<THREE.HemisphereLight>(null);
  useFrame(({ camera }) => {
    const l = ref.current;
    if (l) {
      const inside = camera.position.z < Z0 && camera.position.z > Z1;
      l.position.set(-1.5, CEIL - 0.6, camera.position.z - 6);
      const train = Math.max(0, 1 - worldState.trainDist / 30);
      l.intensity = inside ? 32 + train * 18 : 0;
    }
    if (fill.current) fill.current.intensity = 0.55 * weight(1);
  });
  return (
    <>
      <pointLight ref={ref} color="#ffe2c0" distance={30} decay={1.3} />
      <hemisphereLight ref={fill} args={["#f2ead8", "#3a3632", 0]} />
    </>
  );
}

