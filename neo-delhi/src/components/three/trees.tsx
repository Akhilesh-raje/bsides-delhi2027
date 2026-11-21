"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { rand, type V3 } from "./util";

// Broadleaf trees (neem / jamun / peepal-like): a branching trunk plus clusters of alpha-tested leaf cards,
// the standard real-time foliage technique. Leaves sway with a tiny vertex-shader wind. Units: 1 = 2 m.

let leafTex: THREE.Texture | null = null;
function leafTexture() {
  if (leafTex) return leafTex;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const greens = ["#24381a", "#2f4a22", "#3d5c2a", "#4b6b30", "#1d2e15", "#56773a"];
  // Dense centre, sparse ragged edges, like a real leaf cluster seen from a distance.
  for (let i = 0; i < 900; i++) {
    const a = rand(i) * Math.PI * 2, r = Math.pow(rand(i + 0.5), 0.6) * 118;
    const x = 128 + Math.cos(a) * r, y = 128 + Math.sin(a) * r * 0.85;
    g.save();
    g.translate(x, y);
    g.rotate(rand(i + 0.3) * Math.PI * 2);
    g.fillStyle = greens[Math.floor(rand(i + 0.7) * greens.length)];
    g.beginPath();
    g.ellipse(0, 0, 3 + rand(i + 0.9) * 4, 1.6 + rand(i + 1.1) * 2, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  leafTex = new THREE.CanvasTexture(c);
  leafTex.colorSpace = THREE.SRGBColorSpace;
  return leafTex;
}

function trunkGeometry() {
  const parts: THREE.BufferGeometry[] = [new THREE.CylinderGeometry(0.11, 0.2, 2.6, 8, 4).translate(0, 1.3, 0)];
  // Four main limbs splaying up and out from the crown of the trunk.
  for (let k = 0; k < 4; k++) {
    const len = 1.3 + rand(k + 3) * 0.5;
    const b = new THREE.CylinderGeometry(0.045, 0.09, len, 6).translate(0, len / 2, 0);
    b.rotateZ(0.55 + rand(k) * 0.35);
    b.rotateY((k / 4) * Math.PI * 2 + rand(k + 7) * 0.6);
    b.translate(0, 2.3, 0);
    parts.push(b);
  }
  const g = mergeGeometries(parts)!;
  // Bark irregularity
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const n = Math.sin(p.getY(i) * 7.1 + p.getX(i) * 13.3) * 0.012;
    p.setXYZ(i, p.getX(i) * (1 + n * 8), p.getY(i), p.getZ(i) * (1 + n * 8));
  }
  g.computeVertexNormals();
  return g;
}

const CARDS = 22;

export function Trees({ points, scale = 1 }: { points: V3[]; scale?: number }) {
  const trunk = useRef<THREE.InstancedMesh>(null);
  const leaves = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => ({ trunk: trunkGeometry(), card: new THREE.PlaneGeometry(1.5, 1.5) }), []);
  const wind = useMemo(() => ({ value: 0 }), []);
  const mats = useMemo(() => {
    const leaf = new THREE.MeshStandardMaterial({ map: leafTexture(), alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.85 });
    leaf.onBeforeCompile = (sh) => {
      sh.uniforms.uWind = wind;
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nuniform float uWind;")
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
           vec4 wp = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
           float sway = sin(uWind * 1.3 + wp.x * 0.7 + wp.z * 0.5) * 0.06 + sin(uWind * 3.1 + wp.x * 2.0) * 0.02;
           transformed.x += sway * (uv.y + 0.3);
           transformed.z += sway * 0.6 * (uv.y + 0.3);`,
        );
    };
    return { bark: new THREE.MeshStandardMaterial({ color: "#3a2c22", roughness: 0.95 }), leaf };
  }, [wind]);

  useLayoutEffect(() => {
    const o = new THREE.Object3D(), c = new THREE.Color();
    points.forEach((p, i) => {
      const s = scale * (0.8 + rand(i * 3.1) * 0.55);
      o.position.set(...p);
      o.rotation.set(0, rand(i) * Math.PI * 2, 0);
      o.scale.set(s, s * (0.9 + rand(i + 2) * 0.25), s);
      o.updateMatrix();
      trunk.current?.setMatrixAt(i, o.matrix);
      // Canopy: cards scattered in a flattened, slightly lopsided ellipsoid around the limbs.
      for (let k = 0; k < CARDS; k++) {
        const a = rand(i * 31 + k) * Math.PI * 2, e = rand(i * 17 + k + 0.5) * 2 - 1, r = 0.6 + rand(i * 7 + k) * 1.1;
        o.position.set(p[0] + Math.cos(a) * r * s * Math.sqrt(1 - e * e) * 1.15, p[1] + (3.3 + e * 0.9) * s, p[2] + Math.sin(a) * r * s * Math.sqrt(1 - e * e));
        o.rotation.set(rand(k + i) * Math.PI, rand(k * 2 + i) * Math.PI, rand(k * 3 + i) * Math.PI);
        o.scale.setScalar(s * (0.8 + rand(k + i * 5) * 0.6));
        o.updateMatrix();
        leaves.current?.setMatrixAt(i * CARDS + k, o.matrix);
        leaves.current?.setColorAt(i * CARDS + k, c.setHSL(0.24 + rand(i + k * 0.1) * 0.06, 0.35, 0.55 + rand(k * 1.3 + i) * 0.35));
      }
    });
    [trunk.current, leaves.current].forEach((m) => {
      if (!m) return;
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
      m.computeBoundingSphere();
    });
  }, [points, scale]);

  useFrame((_, dt) => void (wind.value += dt));

  return (
    <group>
      <instancedMesh ref={trunk} args={[geo.trunk, mats.bark, points.length]} />
      <instancedMesh ref={leaves} args={[geo.card, mats.leaf, points.length * CARDS]} />
    </group>
  );
}
