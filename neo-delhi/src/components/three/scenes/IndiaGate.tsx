"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Flag } from "../Flag";
import { Flame, Kites, Traffic } from "../atmosphere";
import { along, Bollards, HoloRing, Lanterns, NeonLine, People, Trees } from "../props";
import { useMats } from "../materials";
import { PLACES } from "../path";
import { boxUV, rand, uv, type V3 } from "../util";

// India Gate (1931, Lutyens). Real: 42 m tall, one great arch, smaller arches through each pier,
// "INDIA" on the attic flanked by MCMXIV / MCMXIX, a shallow dome bowl on top. Here 1 unit ≈ 2 m.
const W = 16, H = 14, D = 5.6, PIER = 5.4, ARCH = W - PIER * 2, SPRING = 8.6;

function inscription() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 220;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgba(40,22,14,0.82)";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = '600 150px "Times New Roman", Georgia, serif';
  g.fillText("INDIA", 512, 118);
  g.font = '500 62px "Times New Roman", Georgia, serif';
  g.fillText("MCMXIV", 150, 118);
  g.fillText("MCMXIX", 874, 118);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function IndiaGate() {
  const m = useMats();
  const geo = useMemo(() => {
    // Pier with a small arch running through it (north–south), extruded along x.
    const pierShape = new THREE.Shape();
    pierShape.moveTo(-D / 2, 0);
    pierShape.lineTo(D / 2, 0);
    pierShape.lineTo(D / 2, H);
    pierShape.lineTo(-D / 2, H);
    pierShape.closePath();
    const hole = new THREE.Path();
    hole.moveTo(-1.25, 0.05);
    hole.lineTo(-1.25, 4.4);
    hole.absarc(0, 4.4, 1.25, Math.PI, 0, true);
    hole.lineTo(1.25, 0.05);
    hole.lineTo(-1.25, 0.05);
    pierShape.holes.push(hole);
    const pier = new THREE.ExtrudeGeometry(pierShape, { depth: PIER, bevelEnabled: false, curveSegments: 20 });
    pier.rotateY(Math.PI / 2);
    boxUV(pier);

    // Spandrel above the main opening, with the round arch cut into its underside.
    const sp = new THREE.Shape();
    const r = ARCH / 2;
    sp.moveTo(-r, 0);
    sp.lineTo(-r, H - SPRING);
    sp.lineTo(r, H - SPRING);
    sp.lineTo(r, 0);
    sp.absarc(0, 0, r, 0, Math.PI, false);
    const spandrel = new THREE.ExtrudeGeometry(sp, { depth: D, bevelEnabled: false, curveSegments: 32 });
    spandrel.translate(0, SPRING, -D / 2);
    boxUV(spandrel);
    return { pier, spandrel };
  }, []);
  const ins = useMemo(() => inscription(), []);

  const lampPts = useMemo<V3[]>(() => Array.from({ length: 22 }, (_, i) => [i % 2 ? 6.8 : -6.8, 0, 11 + Math.floor(i / 2) * 9]), []);
  const bollardPts = useMemo(() => [...along([-5.5, 9], [-5.5, 70], 4.5), ...along([5.5, 9], [5.5, 70], 4.5), ...along([-11, 6], [11, 6], 3.6)], []);
  const treePts = useMemo<V3[]>(() => Array.from({ length: 26 }, (_, i) => [(i % 2 ? 1 : -1) * (9.5 + rand(i) * 5), 0, 8 + Math.floor(i / 2) * 8 + rand(i + 4) * 3]), []);
  const P = PLACES.indiaGate;

  return (
    <group position={P}>
      {/* Plinth steps (red sandstone) */}
      <mesh material={m.gateStoneRed} position={[0, 0.25, 0]}>
        <boxGeometry args={[21, 0.5, 10.5]} ref={uv} />
      </mesh>
      <mesh material={m.gateStoneRed} position={[0, 0.65, 0]}>
        <boxGeometry args={[19, 0.3, 8.6]} ref={uv} />
      </mesh>

      <group position={[0, 0.8, 0]}>
        <mesh geometry={geo.pier} material={m.gateStone} position={[-W / 2, 0, 0]} />
        <mesh geometry={geo.pier} material={m.gateStone} position={[W / 2 - PIER, 0, 0]} />
        <mesh geometry={geo.spandrel} material={m.gateStone} />

        {/* Impost bands at the springing line and plinth course */}
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh material={m.gateStoneRed} position={[s * (W / 2 - PIER / 2), SPRING, 0]}>
              <boxGeometry args={[PIER + 0.3, 0.35, D + 0.3]} ref={uv} />
            </mesh>
            <mesh material={m.gateStoneRed} position={[s * (W / 2 - PIER / 2), 0.6, 0]}>
              <boxGeometry args={[PIER + 0.25, 1.2, D + 0.25]} ref={uv} />
            </mesh>
            {/* Shallow pilasters on the faces */}
            {[-1, 1].map((f) => (
              <mesh key={f} material={m.gateStone} position={[s * (W / 2 - 0.6), 6.5, f * (D / 2 + 0.08)]}>
                <boxGeometry args={[0.7, 11.5, 0.16]} ref={uv} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Roundel medallions on the pier faces above the springing line */}
        {[-1, 1].flatMap((x) =>
          [-1, 1].map((f) => (
            <mesh key={`${x}${f}`} material={m.gateStoneRed} position={[x * (W / 2 - PIER / 2), SPRING + 2.6, f * (D / 2 + 0.06)]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.95, 0.95, 0.16, 40]} />
            </mesh>
          )),
        )}

        {/* Cornice, attic with inscription, stepped crown, dome bowl */}
        <mesh material={m.gateStoneRed} position={[0, H - 0.2, 0]}>
          <boxGeometry args={[W + 0.4, 0.4, D + 0.4]} ref={uv} />
        </mesh>
        <mesh material={m.gateStone} position={[0, H + 0.35, 0]}>
          <boxGeometry args={[W + 1, 0.7, D + 1]} ref={uv} />
        </mesh>
        <mesh material={m.gateStone} position={[0, H + 2.3, 0]}>
          <boxGeometry args={[13.2, 3.2, 4.6]} ref={uv} />
        </mesh>
        {[1, -1].map((f) => (
          <mesh key={f} position={[0, H + 2.3, f * 2.31]} rotation={[0, f > 0 ? 0 : Math.PI, 0]}>
            <planeGeometry args={[12.4, 2.66]} />
            <meshStandardMaterial map={ins} transparent roughness={0.9} polygonOffset polygonOffsetFactor={-1} />
          </mesh>
        ))}
        <mesh material={m.gateStoneRed} position={[0, H + 4.1, 0]}>
          <boxGeometry args={[13.8, 0.4, 5.2]} ref={uv} />
        </mesh>
        <mesh material={m.gateStone} position={[0, H + 4.9, 0]}>
          <boxGeometry args={[10.5, 1.2, 3.8]} ref={uv} />
        </mesh>
        <mesh material={m.gateStone} position={[0, H + 6, 0]}>
          <cylinderGeometry args={[2.5, 2.9, 1, 40]} ref={uv} />
        </mesh>
        <mesh material={m.gateStone} position={[0, H + 6.5, 0]} scale={[1, 0.28, 1]}>
          <sphereGeometry args={[2.45, 40, 12, 0, Math.PI * 2, 0, Math.PI / 2]} ref={uv} />
        </mesh>

        {/* Subtle neon accent tracing the main arch, front and back */}
        {[1, -1].map((f) => (
          <mesh key={f} material={m.neon} position={[0, SPRING, f * (D / 2 + 0.03)]}>
            <torusGeometry args={[ARCH / 2 + 0.05, 0.03, 6, 64, Math.PI]} />
          </mesh>
        ))}
      </group>

      {/* Amar Jawan Jyoti: black marble cenotaph with eternal flames at its corners */}
      <mesh material={m.blackStone} position={[0, 1.25, 0]}>
        <boxGeometry args={[2.4, 0.9, 2.4]} />
      </mesh>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z]) => (
        <group key={`${x}${z}`}>
          <mesh material={m.darkMetal} position={[x * 1.6, 1.2, z * 1.6]}>
            <cylinderGeometry args={[0.18, 0.12, 0.8, 12]} />
          </mesh>
          <Flame position={[x * 1.6, 1.62, z * 1.6]} scale={1.3} />
        </group>
      ))}

      {/* Kartavya Path: the wet reflective ground is the road; lawns, hedges, canals either side */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh material={m.grass} rotation={[-Math.PI / 2, 0, 0]} position={[s * 12, 0.015, 70]}>
            <planeGeometry args={[12, 120]} />
          </mesh>
          <mesh material={m.water} rotation={[-Math.PI / 2, 0, 0]} position={[s * 20, 0.03, 70]}>
            <planeGeometry args={[4, 120]} />
          </mesh>
          <mesh material={m.gateStoneRed} position={[s * 6.15, 0.12, 70]}>
            <boxGeometry args={[0.3, 0.24, 120]} ref={uv} />
          </mesh>
          <NeonLine a={[s * 5.85, 10]} b={[s * 5.85, 130]} y={0.05} />
        </group>
      ))}
      <Lanterns points={lampPts} />
      <Bollards points={bollardPts} />
      <Trees points={treePts} />
      <People paths={[[[-2.6, 0, 24], [-2.6, 0, 7]], [[2.6, 0, 23], [2.6, 0, 7]], [[-9, 0, 5], [9, 0, 5]]]} count={18} />
      <HoloRing center={[0, 15.5, 0]} radius={13} />

      {/* C-Hexagon traffic around the monument */}
      <Traffic center={[0, 0, 0]} radius={25} count={46} speed={0.09} />
      <Kites center={[4, 0, -4]} count={6} height={30} />

      <Flag id="gate" position={[-9.6, 1.6, 4.4]} />
    </group>
  );
}
