"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { sfx } from "@/lib/scroll";
import { Flag } from "../Flag";
import { Crowd, randomLook, type Pose } from "../humans";
import { useMats } from "../materials";
import { clearOfPath, PLACES } from "../path";
import { clickable, Lanterns, Trees } from "../props";
import { boxUV, NEON, rand, type V3 } from "../util";

// Jantar Mantar (1724, Sawai Jai Singh II): masonry astronomical instruments in lime plaster washed salmon-red,
// edged in white. Outside the wall, Jantar Mantar Road is Delhi's protest street: here, a digital-rights sit-in.
// Local frame: +z faces the camera stop, so the Samrat Yantra's triangle is seen side-on. Units: 1 = 2 m.
export const CHANT = 4.8; // seconds per call-and-response cycle (shared with the audio)

const PLACARDS = ["PRIVACY IS\nA RIGHT", "हमारा डेटा\nहमारा हक़", "NO\nBACKDOORS", "ENCRYPT\nEVERYTHING", "OPEN SOURCE\nOPEN SOCIETY", "डिजिटल\nआज़ादी", "SECURE BY\nDEFAULT", "PATCH\nYOUR SYSTEMS"];

function placard(text: string, red: boolean) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 192;
  const g = c.getContext("2d")!;
  g.fillStyle = red ? "#b3121f" : "#efe9dc";
  g.fillRect(0, 0, 256, 192);
  g.strokeStyle = red ? "#efe9dc" : "#b3121f";
  g.lineWidth = 8;
  g.strokeRect(8, 8, 240, 176);
  g.fillStyle = red ? "#fff" : "#151515";
  g.font = "bold 38px 'Noto Sans Devanagari', Arial, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  const lines = text.split("\n");
  lines.forEach((l, i) => g.fillText(l, 128, 96 + (i - (lines.length - 1) / 2) * 46, 232));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function banner() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#efe9dc";
  g.fillRect(0, 0, 1024, 128);
  g.fillStyle = "#b3121f";
  g.fillRect(0, 0, 1024, 14);
  g.fillRect(0, 114, 1024, 14);
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = "bold 44px 'Noto Sans Devanagari', Arial, sans-serif";
  g.fillStyle = "#151515";
  g.fillText("डिजिटल अधिकार · DIGITAL RIGHTS ARE HUMAN RIGHTS", 512, 66, 990);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function stripes() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 16;
  const g = c.getContext("2d")!;
  for (let i = 0; i < 8; i++) {
    g.fillStyle = i % 2 ? "#e9e1d0" : "#8f101b";
    g.fillRect(i * 32, 0, 32, 16);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Samrat Yantra: the 21 m gnomon (a right triangle whose hypotenuse points at the pole star) with a quadrant on each side. */
function SamratYantra({ red, white }: { red: THREE.Material; white: THREE.Material }) {
  const geo = useMemo(() => {
    const tri = new THREE.Shape([new THREE.Vector2(-9, 0), new THREE.Vector2(7, 0), new THREE.Vector2(7, 10.5)]);
    const gnomon = boxUV(new THREE.ExtrudeGeometry(tri, { depth: 1.6, bevelEnabled: false }).translate(0, 0, -0.8), 0.5);
    // Quadrant wing in the (z, y) plane: solid below a concave quarter circle centred on the gnomon edge.
    const wing = new THREE.Shape();
    wing.moveTo(0.8, 0);
    wing.lineTo(6.8, 0);
    wing.lineTo(6.8, 7.2);
    wing.absarc(0.8, 7.2, 6, 0, -Math.PI / 2, true);
    wing.lineTo(0.8, 0);
    const w = boxUV(new THREE.ExtrudeGeometry(wing, { depth: 1.6, bevelEnabled: false }).rotateY(-Math.PI / 2).translate(2.8, 0, 0), 0.5);
    const arc = new THREE.ArcCurve(0.8, 7.2, 6.02, 0, -Math.PI / 2, true);
    const trim = (x: number) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arc.getPoints(24).map((p) => new THREE.Vector3(x, p.y, p.x))), 24, 0.06, 5);
    return { gnomon, wing: w, trimA: trim(2.8), trimB: trim(1.2) };
  }, []);
  const steps = useMemo(() => Array.from({ length: 34 }, (_, i) => i), []);
  const slope = Math.atan2(10.5, 16);
  return (
    <group {...clickable(() => sfx("chime"))}>
      <mesh geometry={geo.gnomon} material={red} />
      {/* White lime edging and the staircase climbing the hypotenuse */}
      <mesh material={white} position={[-1, 5.25 + 0.06, 0]} rotation={[0, 0, slope]}>
        <boxGeometry args={[Math.hypot(16, 10.5), 0.1, 1.7]} />
      </mesh>
      {steps.map((i) => {
        const f = (i + 0.5) / steps.length;
        return (
          <mesh key={i} material={white} position={[-9 + f * 16, f * 10.5 + 0.12, 0]}>
            <boxGeometry args={[0.18, 0.14, 0.9]} />
          </mesh>
        );
      })}
      <mesh material={white} position={[7.02, 5.25, 0]}>
        <boxGeometry args={[0.06, 10.5, 1.7]} />
      </mesh>
      {[1, -1].map((s) => (
        <group key={s} scale={[1, 1, s]}>
          <mesh geometry={geo.wing} material={red} />
          <mesh geometry={geo.trimA} material={white} />
          <mesh geometry={geo.trimB} material={white} />
        </group>
      ))}
    </group>
  );
}

/** Jai Prakash: sunken hemispherical bowls whose inner surface maps the sky. */
function JaiPrakash({ position, red, white }: { position: V3; red: THREE.Material; white: THREE.Material }) {
  return (
    <group position={position}>
      <mesh material={red}>
        <cylinderGeometry args={[2.35, 2.45, 1.2, 40, 1, true]} ref={(g) => void (g && boxUV(g, 0.5))} />
      </mesh>
      <mesh material={white} position={[0, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.38, 0.08, 6, 48]} />
      </mesh>
      <mesh material={white} position={[0, 1.2, 0]}>
        <sphereGeometry args={[2.3, 40, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      </mesh>
      {/* Meridian and hour lines engraved in the bowl */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} material={red} position={[0, 1.2, 0]} rotation={[0, (i / 6) * Math.PI, 0]}>
          <torusGeometry args={[2.28, 0.025, 4, 40, Math.PI]} />
        </mesh>
      ))}
    </group>
  );
}

/** Ram Yantra: a roofless cylinder of pillars around a central pole, with radial stone sectors at mid height. */
function RamYantra({ position, red, white }: { position: V3; red: THREE.Material; white: THREE.Material }) {
  const n = 12;
  return (
    <group position={position}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh material={red} position={[0, 1.5, 3]}>
              <boxGeometry args={[0.9, 3, 0.5]} />
            </mesh>
            <mesh material={white} position={[0, 0.9, 1.6]} rotation={[0.18, 0, 0]}>
              <boxGeometry args={[0.7, 0.08, 2.6]} />
            </mesh>
          </group>
        );
      })}
      <mesh material={white} position={[0, 3.05, 0]}>
        <cylinderGeometry args={[3.3, 3.3, 0.12, 48, 1, true]} />
      </mesh>
      <mesh material={red} position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 3, 12]} />
      </mesh>
    </group>
  );
}

/** Sit-in on Jantar Mantar Road: placards, a banner, a striped shamiana with a speaker, fists raised on each response. */
function Protest() {
  const m = useMats();
  const people = useMemo(() => {
    const out: { x: number; z: number; yaw: number; sign: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const x = -13 + rand(i * 2.3) * 15, z = 13.6 + rand(i * 5.1) * 2.6;
      out.push({ x, z, yaw: Math.PI + (rand(i) - 0.5) * 0.8, sign: i % 3 === 0 ? -1 : i % PLACARDS.length });
    }
    out.push({ x: -13.2, z: 18.2, yaw: 0, sign: -1 }); // speaker on the stage, facing the crowd
    return out;
  }, []);
  const looks = useMemo(() => people.map((_, i) => randomLook(i * 4.1 + 7)), [people]);
  const update = (i: number, t: number, p: Pose) => {
    const q = people[i], c = (t + rand(i) * 0.15) % CHANT;
    p.x = q.x;
    p.z = q.z;
    p.y = i === people.length - 1 ? 0.5 : 0;
    p.yaw = q.yaw;
    p.visible = true;
    // Speaker gestures on the call; the crowd answers with fists up.
    p.mode = i === people.length - 1 ? (c < 2.2 ? "wave" : "idle") : c > 2.4 && c < 4.2 && rand(i + 3) > 0.25 ? "wave" : "idle";
  };
  const mats = useMemo(
    () => PLACARDS.map((t, i) => new THREE.MeshStandardMaterial({ map: placard(t, i % 3 === 1), roughness: 0.9, side: THREE.DoubleSide })),
    [],
  );
  const signs = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    signs.current?.children.forEach((g, k) => {
      const c = (t + k * 0.13) % CHANT, up = c > 2.4 && c < 4.2 ? 1 : 0;
      g.position.y = THREE.MathUtils.lerp(g.position.y, 1.45 + up * 0.35, 0.15);
      g.rotation.z = Math.sin(t * 1.3 + k) * 0.08;
    });
  });
  const stripe = useMemo(() => new THREE.MeshStandardMaterial({ map: stripes(), roughness: 0.85, side: THREE.DoubleSide }), []);
  const cloth = useMemo(() => new THREE.MeshStandardMaterial({ map: banner(), roughness: 0.9, side: THREE.DoubleSide }), []);
  const ledRed = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(NEON).multiplyScalar(2.2), toneMapped: false }), []);
  const held = people.flatMap((q, i) => (q.sign >= 0 ? [{ ...q, i }] : []));
  return (
    <group>
      <Crowd looks={looks} update={update} scale={0.55} />
      <group ref={signs}>
        {held.map((q) => (
          <group key={q.i} position={[q.x + 0.15, 1.45, q.z]} rotation={[0, q.yaw + Math.PI, 0]}>
            <mesh material={mats[q.sign]} position={[0, 0.35, 0]}>
              <planeGeometry args={[0.75, 0.56]} />
            </mesh>
            <mesh material={m.iron} position={[0, -0.05, -0.01]}>
              <boxGeometry args={[0.03, 0.6, 0.03]} />
            </mesh>
          </group>
        ))}
      </group>
      {/* Banner strung between two bamboo poles */}
      <mesh material={cloth} position={[-5, 1.7, 16.6]}>
        <planeGeometry args={[9, 1.1]} />
      </mesh>
      {[-9.5, -0.5].map((x) => (
        <mesh key={x} material={m.iron} position={[x, 1.2, 16.62]}>
          <cylinderGeometry args={[0.05, 0.05, 2.4, 6]} />
        </mesh>
      ))}
      {/* Shamiana and stage */}
      <group position={[-13.2, 0, 18]} {...clickable(() => sfx("chant"))}>
        <mesh material={stripe} position={[0, 3.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5, 4]} />
        </mesh>
        {[[-2.4, -1.9], [2.4, -1.9], [-2.4, 1.9], [2.4, 1.9]].map(([x, z]) => (
          <mesh key={`${x}${z}`} material={m.iron} position={[x, 1.6, z]}>
            <cylinderGeometry args={[0.05, 0.05, 3.2, 6]} />
          </mesh>
        ))}
        <mesh material={stripe} position={[0, 2.7, -2]}>
          <planeGeometry args={[5, 1]} />
        </mesh>
        <mesh material={m.darkMetal} position={[0, 0.25, 0.3]}>
          <boxGeometry args={[3.8, 0.5, 2.2]} />
        </mesh>
        {/* PA speakers on tripods, mic stand */}
        {[-1.9, 1.9].map((x) => (
          <group key={x} position={[x, 0.5, -0.8]}>
            <mesh material={m.darkMetal} position={[0, 1.2, 0]}>
              <boxGeometry args={[0.45, 0.7, 0.4]} />
            </mesh>
            <mesh material={ledRed} position={[0, 1.5, -0.21]}>
              <boxGeometry args={[0.05, 0.05, 0.01]} />
            </mesh>
            <mesh material={m.iron} position={[0, 0.45, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.9, 5]} />
            </mesh>
          </group>
        ))}
        <mesh material={m.iron} position={[0.3, 1.1, -0.2]}>
          <cylinderGeometry args={[0.02, 0.02, 1.2, 5]} />
        </mesh>
      </group>
      {/* Steel barricades along the kerb */}
      {Array.from({ length: 6 }, (_, i) => (
        <group key={i} position={[-14 + i * 3, 0, 12.6]}>
          <mesh material={m.steel} position={[0, 0.55, 0]}>
            <boxGeometry args={[2.6, 0.06, 0.06]} />
          </mesh>
          <mesh material={m.steel} position={[0, 0.25, 0]}>
            <boxGeometry args={[2.6, 0.05, 0.05]} />
          </mesh>
          {[-1.25, 1.25].map((x) => (
            <mesh key={x} material={m.steel} position={[x, 0.3, 0]}>
              <boxGeometry args={[0.05, 0.6, 0.4]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export function JantarMantar() {
  const m = useMats();
  const red = useMemo(() => m.plaster("#e0806a"), [m]);
  const white = m.stucco;
  const J = PLACES.jantar;
  const yaw = Math.atan2(-J[0], -470 - J[2]);
  const toWorld = (x: number, z: number): [number, number] => [J[0] + x * Math.cos(yaw) + z * Math.sin(yaw), J[2] - x * Math.sin(yaw) + z * Math.cos(yaw)];
  const trees = useMemo<V3[]>(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const x = -22 + rand(i * 1.9) * 44, z = -16 + rand(i * 3.3) * 6;
        return [x, 0, z] as V3;
      }).filter(([x, , z]) => clearOfPath(...toWorld(x, z), 5)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toWorld depends only on J and yaw
    [J, yaw],
  );
  return (
    <group position={J} rotation={[0, yaw, 0]}>
      <mesh material={m.grass} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[48, 24]} />
      </mesh>
      {/* Garden paths */}
      {[[0, 6, 40, 2.2], [-12, 0, 2, 22]].map(([x, z, w, d]) => (
        <mesh key={`${x}${z}`} material={white} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.03, z]}>
          <planeGeometry args={[w, d]} />
        </mesh>
      ))}
      <group position={[0, 0, -4]}>
        <SamratYantra red={red} white={white} />
      </group>
      <JaiPrakash position={[-11, 0, 4]} red={red} white={white} />
      <JaiPrakash position={[-16.5, 0, 3]} red={red} white={white} />
      <RamYantra position={[12, 0, 3]} red={red} white={white} />
      <RamYantra position={[18, 0, -5]} red={red} white={white} />
      {/* Compound wall and railing, then the road */}
      <mesh material={red} position={[0, 0.35, 11.5]}>
        <boxGeometry args={[48, 0.7, 0.4]} ref={(g) => void (g && boxUV(g, 0.5))} />
      </mesh>
      <mesh material={m.iron} position={[0, 1.05, 11.5]}>
        <boxGeometry args={[48, 0.05, 0.05]} />
      </mesh>
      <mesh material={m.asphalt} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 15]}>
        <planeGeometry args={[60, 7]} />
      </mesh>
      <Lanterns points={[[-18, 0, 12.4], [-6, 0, 12.4], [6, 0, 12.4]]} />
      <Protest />
      <Trees points={trees} />
      {/* Hidden in the eastern Jai Prakash bowl */}
      <Flag id="jantar" position={[-16.5, 0.9, 3]} />
    </group>
  );
}
