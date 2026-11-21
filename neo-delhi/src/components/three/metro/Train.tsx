"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollState, sfx, worldState } from "@/lib/scroll";
import { Crowd, randomLook, type Pose } from "../humans";
import { glowTexture } from "../util";
import type { MetroMats } from "./assets";
import { Inst } from "./Inst";
import { CL, DOORS, MODEL, metroTime, NC, STOP, TRACK, TRAIN_CLIP, TRAIN_LEN, trainZ, Z0, Z1, type Item } from "./layout";
import { ledBoard, lineStrip } from "./signs";

// Delhi Metro stainless-steel EMU, built to scale (1 unit ≈ 1.2 m): 2.82 wide, roof at 3.78, floor at platform height.
// Train-local frame: origin at the leading cab face, coaches trailing towards -z; the whole group moves along +z.
const HW = 1.41; // half width over body sides
const BODY = 15.6; // coach body length (16 incl. gangway)
const DOOR_W = 1.3, DOOR_B = 1.15, DOOR_T = 3.0;
const WIN_B = 1.95, WIN_T = 2.9;
const WINDOWS: [number, number][] = [[0.95, 1.0], [4.25, 2.0], [7.95, 2.0], [11.65, 2.0], [14.75, 0.9]]; // [centre u, width], u = distance from coach front
const SEGMENTS: [number, number][] = [[0.25, 1.75], [3.05, 5.45], [6.75, 9.15], [10.45, 12.85], [14.15, 15.4]]; // solid wall between door openings
const BOGIES = [2.8, 12.8];
const coachZ = (c: number) => -c * CL - 0.2; // coach front (local z)

function roundRect<T extends THREE.Path>(p: T, x: number, y: number, w: number, h: number, r: number) {
  p.moveTo(x + r, y);
  p.lineTo(x + w - r, y);
  p.quadraticCurveTo(x + w, y, x + w, y + r);
  p.lineTo(x + w, y + h - r);
  p.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  p.lineTo(x + r, y + h);
  p.quadraticCurveTo(x, y + h, x, y + h - r);
  p.lineTo(x, y + r);
  p.quadraticCurveTo(x, y, x + r, y);
  return p;
}

function useTrainGeometry() {
  return useMemo(() => {
    // Side wall with window and door openings (drawn in u/y, then turned so u runs along -z and thickness along +x).
    const side = new THREE.Shape();
    side.moveTo(0, 0.95);
    side.lineTo(BODY, 0.95);
    side.lineTo(BODY, 3.15);
    side.lineTo(0, 3.15);
    side.closePath();
    DOORS.forEach((d) => side.holes.push(roundRect(new THREE.Path(), -d - DOOR_W / 2, DOOR_B, DOOR_W, DOOR_T - DOOR_B, 0.06)));
    WINDOWS.forEach(([u, w]) => side.holes.push(roundRect(new THREE.Path(), u - w / 2, WIN_B, w, WIN_T - WIN_B, 0.14)));
    const sideGeo = new THREE.ExtrudeGeometry(side, { depth: 0.05, bevelEnabled: false, curveSegments: 6 }).rotateY(Math.PI / 2);

    // Curved roof cross-section, extruded along the coach.
    const roof = new THREE.Shape();
    roof.moveTo(-HW, 3.15);
    roof.splineThru([new THREE.Vector2(-1.33, 3.46), new THREE.Vector2(-0.95, 3.7), new THREE.Vector2(0, 3.79), new THREE.Vector2(0.95, 3.7), new THREE.Vector2(1.33, 3.46), new THREE.Vector2(HW, 3.15)]);
    roof.lineTo(-HW, 3.15);
    const roofGeo = new THREE.ExtrudeGeometry(roof, { depth: BODY, bevelEnabled: false, curveSegments: 24 }).translate(0, 0, -BODY);

    // Black rubber gaskets around windows, one ring per window size.
    const gasket = (w: number) => {
      const s = roundRect(new THREE.Shape(), -w / 2 - 0.06, -(WIN_T - WIN_B) / 2 - 0.06, w + 0.12, WIN_T - WIN_B + 0.12, 0.18);
      s.holes.push(roundRect(new THREE.Path(), -w / 2, -(WIN_T - WIN_B) / 2, w, WIN_T - WIN_B, 0.14));
      return new THREE.ShapeGeometry(s, 6);
    };
    return { sideGeo, roofGeo, gaskets: { 2: gasket(2), 1: gasket(1), 0.9: gasket(0.9) } as Record<number, THREE.ShapeGeometry> };
  }, []);
}

/** Static instance lists (train-local). */
function useTrainItems() {
  return useMemo(() => {
    const L = (fn: (c: number, z0: number) => Item[]) => Array.from({ length: NC }, (_, c) => fn(c, coachZ(c))).flat();
    const bothSides = (fn: (side: number) => Item[]) => [-1, 1].flatMap(fn);
    const yawOut = (side: number): [number, number, number] => [0, side < 0 ? -Math.PI / 2 : Math.PI / 2, 0];
    return {
      sides: L((_, z0) => [{ p: [-HW, 0, z0] }, { p: [HW - 0.05, 0, z0] }]),
      roofs: L((_, z0) => [{ p: [0, 0, z0] }]),
      windows: L((_, z0) => bothSides((side) => WINDOWS.map(([u, w]) => ({ p: [side * (HW + 0.005), (WIN_B + WIN_T) / 2, z0 - u], r: yawOut(side), s: [w, WIN_T - WIN_B, 1] }) as Item))),
      gaskets: Object.fromEntries([2, 1, 0.9].map((w) => [w, L((_, z0) => bothSides((side) => WINDOWS.filter(([, ww]) => ww === w).map(([u]) => ({ p: [side * (HW + 0.008), (WIN_B + WIN_T) / 2, z0 - u], r: yawOut(side) }) as Item)))])) as Record<number, Item[]>,
      stripes: L((_, z0) => bothSides((side) => SEGMENTS.map(([a, b]) => ({ p: [side * (HW + 0.012), 1.72, z0 - (a + b) / 2], s: [1, 1, b - a] }) as Item))),
      skirts: L((_, z0) => [{ p: [0, 0.8, z0 - 7.8] }]),
      ends: L((_, z0) => [{ p: [0, 2.05, z0 - 0.02] }, { p: [0, 2.05, z0 - BODY + 0.02] }]),
      bellows: Array.from({ length: NC - 1 }, (_, c) => ({ p: [0, 2.25, -(c + 1) * CL] }) as Item),
      lining: L((_, z0) => [{ p: [0, 2.15, z0 - BODY / 2] }]),
      floors: L((_, z0) => [{ p: [0, 1.16, z0 - BODY / 2], r: [-Math.PI / 2, 0, 0] }]),
      lights: L((_, z0) => [-0.55, 0.55].map((x) => ({ p: [x, 3.1, z0 - BODY / 2] }) as Item)),
      seats: L((_, z0) => bothSides((side) => SEGMENTS.slice(1, 4).map(([a, b]) => ({ p: [side * 1.12, 1.6, z0 - (a + b) / 2] }) as Item))),
      seatBacks: L((_, z0) => bothSides((side) => SEGMENTS.slice(1, 4).map(([a, b]) => ({ p: [side * 1.33, 1.88, z0 - (a + b) / 2] }) as Item))),
      poles: L((_, z0) => DOORS.flatMap((d) => [-0.85, 0.85].flatMap((x) => [-0.9, 0.9].map((o) => ({ p: [x, 2.15, z0 + d + o] }) as Item)))),
      rails: L((_, z0) => [-0.75, 0.75].map((x) => ({ p: [x, 2.95, z0 - BODY / 2], r: [Math.PI / 2, 0, 0] }) as Item)),
      handles: L((_, z0) => [-0.75, 0.75].flatMap((x) => Array.from({ length: 24 }, (_, k) => ({ p: [x, 2.82, z0 - 0.9 - k * 0.6] }) as Item))),
      strips: L((_, z0) => bothSides((side) => WINDOWS.slice(1, 4).map(([u]) => ({ p: [side * 1.355, 3.02, z0 - u], r: yawOut(-side) }) as Item))),
      under: L((_, z0) => [5.2, 6.8, 8.6, 10.2].map((u, k) => ({ p: [k % 2 ? 0.35 : -0.3, 0.48, z0 - u], s: [1 + (k % 3) * 0.2, 1, 1] }) as Item)),
      bogies: L((_, z0) => BOGIES.map((u) => ({ p: [0, 0.55, z0 - u] }) as Item)),
      trackDoors: L((_, z0) => DOORS.flatMap((d) => [-1, 1].map((k) => ({ p: [HW + 0.03, (DOOR_B + DOOR_T) / 2, z0 + d + k * 0.325] }) as Item))),
      indicators: L((_, z0) => DOORS.map((d) => ({ p: [-HW - 0.025, 3.08, z0 + d] }) as Item)),
    };
  }, []);
}

/** Driver's cab: wraps the coach end. `lead` = headlamps lit (else red tail lamps). */
function Cab({ m, lead, display }: { m: MetroMats["train"]; lead: boolean; display: THREE.Texture }) {
  const glow = useMemo(
    () => new THREE.MeshBasicMaterial({ map: glowTexture(), color: new THREE.Color(lead ? "#fff6ea" : "#ff2030").multiplyScalar(lead ? 2.4 : 1.6), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, clippingPlanes: TRAIN_CLIP }),
    [lead],
  );
  const lamp = lead ? m.head : m.steelDark;
  const tail = lead ? m.steelDark : m.tail;
  const F = 0.215; // front face z
  return (
    <group>
      <RoundedBox args={[2.84, 2.72, 1.3]} radius={0.38} smoothness={5} position={[0, 2.42, -0.45]} material={m.steel} />
      <mesh material={m.black} position={[0, 2.58, F]} rotation={[-0.06, 0, 0]}>
        <planeGeometry args={[2.3, 1.2]} />
      </mesh>
      <mesh position={[0, 3.4, F + 0.005]}>
        <planeGeometry args={[1.36, 0.25]} />
        <meshBasicMaterial map={display} toneMapped={false} clippingPlanes={TRAIN_CLIP} />
      </mesh>
      <mesh material={m.black} position={[0, 1.56, F]}>
        <planeGeometry args={[2.55, 0.42]} />
      </mesh>
      <mesh material={m.red} position={[0, 1.9, F + 0.002]}>
        <planeGeometry args={[2.76, 0.17]} />
      </mesh>
      {/* Evacuation door outline and wipers */}
      {[-0.46, 0.46].map((x) => (
        <mesh key={x} material={m.rubber} position={[x, 2.1, F + 0.01]}>
          <boxGeometry args={[0.025, 1.9, 0.01]} />
        </mesh>
      ))}
      {[-0.42, 0.42].map((x) => (
        <mesh key={x} material={m.rubber} position={[x, 2.1, F + 0.03]} rotation={[0, 0, x < 0 ? 0.55 : -0.55]}>
          <boxGeometry args={[0.85, 0.025, 0.02]} />
        </mesh>
      ))}
      {[-0.88, -0.62, 0.62, 0.88].map((x) => (
        <mesh key={x} material={lamp} position={[x, 1.57, F + 0.01]}>
          <circleGeometry args={[0.075, 20]} />
        </mesh>
      ))}
      {[-1.1, 1.1].map((x) => (
        <mesh key={x} material={tail} position={[x, 1.57, F + 0.01]}>
          <circleGeometry args={[0.065, 20]} />
        </mesh>
      ))}
      {(lead ? [-0.75, 0.75] : [-1.1, 1.1]).map((x) => (
        <mesh key={x} material={glow} position={[x, 1.57, F + 0.08]}>
          <planeGeometry args={[lead ? 1.6 : 0.9, lead ? 1.6 : 0.9]} />
        </mesh>
      ))}
      {/* Anti-climber, coupler, skirt */}
      <mesh material={m.steelDark} position={[0, 1.12, 0.12]}>
        <boxGeometry args={[2.2, 0.22, 0.22]} />
      </mesh>
      <mesh material={m.under} position={[0, 0.82, 0.18]}>
        <boxGeometry args={[0.36, 0.26, 0.55]} />
      </mesh>
      <mesh material={m.under} position={[0, 0.66, 0]}>
        <boxGeometry args={[2.6, 0.32, 0.32]} />
      </mesh>
    </group>
  );
}

const WHEELS = Array.from({ length: NC }, (_, c) => BOGIES.flatMap((u) => [-1, 1].flatMap((ax) => [-0.6, 0.6].map((x) => [x, 0.63, coachZ(c) - u + ax * 0.9] as const)))).flat();
const PLATFORM_DOORS = Array.from({ length: NC }, (_, c) => DOORS.map((d) => coachZ(c) + d)).flat();

export function Train({ mats }: { mats: MetroMats }) {
  const m = mats.train;
  const geo = useTrainGeometry();
  const items = useTrainItems();
  const group = useRef<THREE.Group>(null);
  const leaves = useRef<THREE.InstancedMesh>(null);
  const leafGlass = useRef<THREE.InstancedMesh>(null);
  const seals = useRef<THREE.InstancedMesh>(null);
  const wheels = useRef<THREE.InstancedMesh>(null);
  const roll = useRef(0);
  const lastS = useRef(metroTime.s);
  const strip = useMemo(() => lineStrip(), []);
  const front = useMemo(() => ledBoard(), []);
  const rear = useMemo(() => ledBoard(), []);
  const o = useMemo(() => new THREE.Object3D(), []);
  const stripMat = useMemo(() => new THREE.MeshBasicMaterial({ map: strip, color: "#cfcfcf", toneMapped: false, clippingPlanes: TRAIN_CLIP }), [strip]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const s = metroTime.s, z = trainZ(s);
    g.position.z = z;
    g.visible = scrollState.chapter > 0.35 && z - TRAIN_LEN < Z0 && z > Z1;
    const moving = Math.abs(metroTime.v) > 0.05;
    const cz = state.camera.position.z;
    // Distance from the camera to the nearest point of the train (for the rumble).
    worldState.trainDist = g.visible && moving ? Math.abs(cz - THREE.MathUtils.clamp(cz, z - TRAIN_LEN, z)) : 999;
    if (lastS.current < STOP - 2.4 && s >= STOP - 2.4) sfx("brake");
    lastS.current = s;

    // Destination boards alternate Hindi / English every 3 s (repaint only on change).
    const hindi = Math.floor(state.clock.elapsedTime / 3) % 2 === 0;
    if (front.tex.userData.hindi !== hindi) {
      front.tex.userData.hindi = hindi;
      front.draw(hindi ? "समयपुर बादली" : "SAMAYPUR BADLI", hindi);
      rear.draw(hindi ? "हुडा सिटी सेंटर" : "MILLENNIUM CITY", hindi);
    }

    // Platform-side doors slide apart; indicator lamps: green open, amber blinking while closing.
    const open = worldState.metro.doors, phase = worldState.metro.phase;
    if (leaves.current && leafGlass.current && seals.current) {
      PLATFORM_DOORS.forEach((dz, i) => {
        [-1, 1].forEach((k, j) => {
          const zz = dz + k * (0.325 + 0.62 * open);
          o.position.set(-HW - 0.03, (DOOR_B + DOOR_T) / 2, zz);
          o.rotation.set(0, 0, 0);
          o.updateMatrix();
          leaves.current!.setMatrixAt(i * 2 + j, o.matrix);
          o.position.set(-HW - 0.05, 2.45, zz);
          o.rotation.set(0, -Math.PI / 2, 0);
          o.updateMatrix();
          leafGlass.current!.setMatrixAt(i * 2 + j, o.matrix);
          o.position.set(-HW - 0.045, (DOOR_B + DOOR_T) / 2, zz - k * 0.315);
          o.rotation.set(0, 0, 0);
          o.updateMatrix();
          seals.current!.setMatrixAt(i * 2 + j, o.matrix);
        });
      });
      leaves.current.instanceMatrix.needsUpdate = leafGlass.current.instanceMatrix.needsUpdate = seals.current.instanceMatrix.needsUpdate = true;
    }
    m.indicator.color.set(phase === "doors-closing" ? (Math.floor(s * 4) % 2 ? "#000" : "#ffa21a") : phase === "doors-open" ? "#25e07a" : "#000").multiplyScalar(2.5);

    // Wheels roll with the train.
    roll.current -= (metroTime.v * Math.min(dt, 0.1)) / 0.36;
    if (wheels.current) {
      WHEELS.forEach(([x, y, wz], i) => {
        o.position.set(x, y, wz);
        o.rotation.set(roll.current, 0, Math.PI / 2, "YXZ");
        o.updateMatrix();
        wheels.current!.setMatrixAt(i, o.matrix);
      });
      wheels.current.instanceMatrix.needsUpdate = true;
    }
  });

  // Passengers riding inside (seated and standing), clipped with the train at the tunnel mouths.
  const riders = useMemo(() => {
    const spots: { x: number; z: number; mode: Pose["mode"]; yaw: number }[] = [];
    for (let c = 0; c < NC; c++) {
      const z0 = coachZ(c);
      spots.push({ x: -0.98, z: z0 - 4.6, mode: "sit", yaw: Math.PI / 2 }, { x: 0.98, z: z0 - 8.3, mode: "sit", yaw: -Math.PI / 2 }, { x: -0.98, z: z0 - 11.9, mode: "phone", yaw: Math.PI / 2 });
      spots.push({ x: 0.3, z: z0 - 6.1 + (c % 2) * 3.7, mode: c % 2 ? "phone" : "idle", yaw: c * 1.3 });
    }
    return { spots, looks: spots.map((_, i) => randomLook(200 + i * 5.3)) };
  }, []);
  const ride = (i: number, _t: number, p: Pose) => {
    const sp = riders.spots[i];
    p.x = TRACK + sp.x;
    p.y = 1.16;
    p.z = trainZ(metroTime.s) + sp.z;
    p.yaw = sp.yaw;
    p.mode = sp.mode;
    p.visible = group.current?.visible ?? false;
  };

  return (
    <>
      <group ref={group} position={[TRACK, 0.02, 0]} onClick={(e) => (e.stopPropagation(), sfx("metro-horn"))} onPointerOver={() => (document.body.style.cursor = "pointer")} onPointerOut={() => (document.body.style.cursor = "")}>
        {/* Body */}
        <Inst items={items.sides} geometry={geo.sideGeo} material={m.steel} frustumCulled={false} />
        <Inst items={items.roofs} geometry={geo.roofGeo} material={m.steel} frustumCulled={false} />
        <Inst items={items.windows} material={m.window} frustumCulled={false}>
          <planeGeometry args={[1, 1]} />
        </Inst>
        {[2, 1, 0.9].map((w) => (
          <Inst key={w} items={items.gaskets[w]} geometry={geo.gaskets[w]} material={m.rubber} frustumCulled={false} />
        ))}
        <Inst items={items.stripes} material={m.red} frustumCulled={false}>
          <boxGeometry args={[0.012, 0.18, 1]} />
        </Inst>
        <Inst items={items.skirts} material={m.under} frustumCulled={false}>
          <boxGeometry args={[2.6, 0.3, 6.6]} />
        </Inst>
        <Inst items={items.ends} material={m.steel} frustumCulled={false}>
          <boxGeometry args={[2.82, 2.2, 0.04]} />
        </Inst>
        <Inst items={items.bellows} material={m.rubber} frustumCulled={false}>
          <boxGeometry args={[2.25, 2.55, 0.45]} />
        </Inst>
        {/* Interior: lit lining, floor, seats, poles, grab rails, handles, line maps */}
        <Inst items={items.lining} material={m.interior} frustumCulled={false}>
          <boxGeometry args={[2.72, 2.0, BODY - 0.2]} />
        </Inst>
        <Inst items={items.floors} material={m.floor} frustumCulled={false}>
          <planeGeometry args={[2.7, BODY - 0.2]} />
        </Inst>
        <Inst items={items.lights} material={m.light} frustumCulled={false}>
          <boxGeometry args={[0.14, 0.03, BODY - 1.2]} />
        </Inst>
        <Inst items={items.seats} material={m.seat} frustumCulled={false}>
          <boxGeometry args={[0.46, 0.06, 2.3]} />
        </Inst>
        <Inst items={items.seatBacks} material={m.seat} frustumCulled={false}>
          <boxGeometry args={[0.05, 0.5, 2.3]} />
        </Inst>
        <Inst items={items.poles} material={m.chrome} frustumCulled={false}>
          <cylinderGeometry args={[0.025, 0.025, 2.0, 8]} />
        </Inst>
        <Inst items={items.rails} material={m.chrome} frustumCulled={false}>
          <cylinderGeometry args={[0.02, 0.02, BODY - 0.6, 8]} />
        </Inst>
        <Inst items={items.handles} material={m.rubber} frustumCulled={false}>
          <torusGeometry args={[0.055, 0.012, 6, 14]} />
        </Inst>
        <Inst items={items.strips} material={stripMat} frustumCulled={false}>
          <planeGeometry args={[1.9, 0.12]} />
        </Inst>
        {/* Doors: animated platform side, closed track side, indicator lamps */}
        <instancedMesh ref={leaves} args={[undefined, m.steel, PLATFORM_DOORS.length * 2]} frustumCulled={false}>
          <boxGeometry args={[0.03, DOOR_T - DOOR_B, 0.64]} />
        </instancedMesh>
        <instancedMesh ref={leafGlass} args={[undefined, m.window, PLATFORM_DOORS.length * 2]} frustumCulled={false}>
          <planeGeometry args={[0.42, 0.8]} />
        </instancedMesh>
        <instancedMesh ref={seals} args={[undefined, m.rubber, PLATFORM_DOORS.length * 2]} frustumCulled={false}>
          <boxGeometry args={[0.035, DOOR_T - DOOR_B, 0.03]} />
        </instancedMesh>
        <Inst items={items.trackDoors} material={m.steel} frustumCulled={false}>
          <boxGeometry args={[0.03, DOOR_T - DOOR_B, 0.64]} />
        </Inst>
        <Inst items={items.indicators} material={m.indicator} frustumCulled={false}>
          <boxGeometry args={[0.03, 0.06, 0.26]} />
        </Inst>
        {/* Running gear */}
        <Inst items={items.bogies} material={m.under} frustumCulled={false}>
          <boxGeometry args={[2.0, 0.24, 2.7]} />
        </Inst>
        <Inst items={items.under} material={m.under} frustumCulled={false}>
          <boxGeometry args={[0.9, 0.36, 1.2]} />
        </Inst>
        <instancedMesh ref={wheels} args={[undefined, m.steelDark, WHEELS.length]} frustumCulled={false}>
          <cylinderGeometry args={[0.36, 0.36, 0.1, 22]} />
        </instancedMesh>
        {/* Pantograph on the middle coach, touching the rigid overhead conductor */}
        <group position={[0, 3.8, coachZ(1) - 8]}>
          <mesh material={m.steelDark}>
            <boxGeometry args={[0.9, 0.08, 1.0]} />
          </mesh>
          <mesh material={m.steelDark} position={[0, 0.2, -0.25]} rotation={[0.9, 0, 0]}>
            <boxGeometry args={[0.05, 0.05, 0.75]} />
          </mesh>
          <mesh material={m.steelDark} position={[0, 0.36, 0.05]} rotation={[-0.7, 0, 0]}>
            <boxGeometry args={[0.04, 0.04, 0.55]} />
          </mesh>
          <mesh material={m.steelDark} position={[0, 0.47, 0.2]}>
            <boxGeometry args={[1.3, 0.04, 0.08]} />
          </mesh>
        </group>
        <group position={[0, 0, coachZ(0)]}>
          <Cab m={m} lead display={front.tex} />
        </group>
        <group position={[0, 0, coachZ(NC - 1) - BODY]} rotation={[0, Math.PI, 0]}>
          <Cab m={m} lead={false} display={rear.tex} />
        </group>
      </group>
      <Crowd looks={riders.looks} update={ride} scale={MODEL} clip={TRAIN_CLIP} />
    </>
  );
}

/** Headlight beam that lights the tunnel ahead of the arriving train. Lives outside the chapter groups
 *  (changing light visibility recompiles every shader), so it is dimmed instead of hidden. */
export function TrainLight() {
  const light = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  useFrame(() => {
    const l = light.current;
    if (!l) return;
    const z = trainZ(metroTime.s);
    const on = scrollState.chapter > 0.35 && scrollState.chapter < 1.8 && z > Z1 && z < Z0;
    l.intensity = on ? 160 : 0;
    l.position.set(TRACK, 1.6, z + 0.4);
    target.position.set(TRACK, 0.6, z + 14);
    target.updateMatrixWorld();
  });
  return (
    <>
      <primitive object={target} />
      <spotLight ref={light} target={target} color="#fff4e4" angle={0.45} penumbra={0.6} distance={40} decay={1.4} />
    </>
  );
}
