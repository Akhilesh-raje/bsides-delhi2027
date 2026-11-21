import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type V3 = [number, number, number];
export const NEON = "#ff2a45";

// Deterministic 0..1 noise so the city layout is identical on every render.
export const rand = (n: number) => Math.abs(Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1;

/** Box-projected UVs in world units (1 texture tile = 1/s units), so stone/plaster keeps real scale on any shape. */
export function boxUV<T extends THREE.BufferGeometry>(g: T, s = 0.25): T {
  if (!g.attributes.normal) g.computeVertexNormals();
  const p = g.attributes.position, n = g.attributes.normal;
  const uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    const [u, v] = ax >= ay && ax >= az ? [p.getZ(i), p.getY(i)] : ay >= az ? [p.getX(i), p.getZ(i)] : [p.getX(i), p.getY(i)];
    uv[i * 2] = u * s;
    uv[i * 2 + 1] = v * s;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
}

/** Ref callback for JSX geometries: <boxGeometry ref={uv} />. */
export const uv = (g: THREE.BufferGeometry | null) => {
  if (g && !g.userData.boxUV) {
    boxUV(g);
    g.userData.boxUV = true;
  }
};

/** Cylindrical UVs in world units for round things (towers, columns) — avoids box-projection seams. */
export function cylUV<T extends THREE.BufferGeometry>(g: T, r: number, s = 0.25): T {
  const p = g.attributes.position, u = g.attributes.uv;
  for (let i = 0; i < p.count; i++) u.setXY(i, u.getX(i) * Math.PI * 2 * r * s, p.getY(i) * s);
  return g;
}

/** Arch opening path: straight jambs up to `spring`, then a round or pointed (Mughal) head. Origin = bottom centre. */
export function archPath(w: number, spring: number, pointed = false, cx = 0, cy = 0) {
  const h = w / 2;
  const p = new THREE.Path();
  p.moveTo(cx - h, cy);
  p.lineTo(cx - h, cy + spring);
  if (pointed) {
    // Two arcs of radius r centred inside the opening, meeting at an apex on the centre line.
    const r = w * 0.8;
    p.absarc(cx - h + r, cy + spring, r, Math.PI, Math.acos((h - r) / r), true);
    p.absarc(cx + h - r, cy + spring, r, Math.acos((r - h) / r), 0, true);
  } else {
    p.absarc(cx, cy + spring, h, Math.PI, 0, true);
  }
  p.lineTo(cx + h, cy);
  p.lineTo(cx - h, cy);
  return p;
}

/** A wall of width×height with arch openings, extruded `depth` along +z (centred). */
export function arcadeWall(width: number, height: number, depth: number, holes: { x: number; w: number; spring: number; pointed?: boolean; y?: number }[], top?: [number, number][]) {
  const s = new THREE.Shape();
  s.moveTo(-width / 2, 0);
  s.lineTo(width / 2, 0);
  if (top) top.forEach(([x, y]) => s.lineTo(x, y));
  else {
    s.lineTo(width / 2, height);
    s.lineTo(-width / 2, height);
  }
  s.closePath();
  // Holes start 0.05 above the base: a hole touching the outline breaks triangulation, and the sliver is invisible.
  holes.forEach((h) => s.holes.push(archPath(h.w, h.spring, h.pointed, h.x, h.y ?? 0.05)));
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 20 });
  g.translate(0, 0, -depth / 2);
  return boxUV(g);
}

type Flute = "round" | "angular" | "mixed" | "plain";

/** Tapered tower storey with Qutub-style flutes: round lobes, angular star points, or alternating. */
export function flutedStorey(rTop: number, rBot: number, h: number, kind: Flute, flutes = 24, depth = 0.09) {
  const g = new THREE.CylinderGeometry(rTop, rBot, h, kind === "plain" ? 64 : flutes * 8, 8, true);
  if (kind !== "plain") {
    const p = g.attributes.position, u = g.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      const t = u.getX(i) * flutes; // 0..flutes around the ring, continuous across the seam
      const lobe = Math.floor(t) % flutes, f = t - Math.floor(t);
      const k = kind === "mixed" ? (lobe % 2 ? "angular" : "round") : kind;
      const prof = k === "round" ? Math.sqrt(Math.max(0, 1 - (2 * f - 1) ** 2)) : 1 - Math.abs(2 * f - 1);
      const s = 1 + depth * prof;
      p.setXYZ(i, p.getX(i) * s, p.getY(i), p.getZ(i) * s);
    }
    g.computeVertexNormals();
  }
  return cylUV(g, (rTop + rBot) / 2);
}

/** Sagging wires between pairs of points, merged into one geometry. */
export function wiresGeometry(pairs: [V3, V3, number][], radius = 0.025) {
  const parts = pairs.map(([a, b, sag]) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const mid = A.clone().lerp(B, 0.5);
    mid.y -= sag;
    return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(A, mid, B), 16, radius, 4, false);
  });
  return mergeGeometries(parts)!;
}

/** Canvas texture with Hindi + English text, for shop and station signs. */
export function signTexture(hi: string, en: string, opts: { w?: number; h?: number; fg?: string; bg?: string; border?: string; sub?: string } = {}) {
  const { w = 512, h = 256, fg = NEON, bg = "#0b0c10", border = fg, sub = "#E5E1DF" } = opts;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  if (border !== "none") {
    g.strokeStyle = border;
    g.lineWidth = Math.max(4, h * 0.03);
    g.strokeRect(h * 0.05, h * 0.05, w - h * 0.1, h - h * 0.1);
  }
  g.textAlign = "center";
  g.fillStyle = fg;
  g.font = `bold ${h * 0.36}px "Nirmala UI", "Noto Sans Devanagari", "Mangal", sans-serif`;
  g.fillText(hi, w / 2, h * (en ? 0.5 : 0.64), w * 0.9);
  if (en) {
    g.fillStyle = sub;
    g.font = `600 ${h * 0.17}px "Segoe UI", system-ui, sans-serif`;
    g.fillText(en.toUpperCase(), w / 2, h * 0.82, w * 0.9);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Soft radial glow texture used for fake light pools on the ground and dust sprites. */
let glowTex: THREE.Texture | null = null;
export function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.35, "rgba(255,255,255,0.35)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}

/** Fill an InstancedMesh from a list of transforms (+ optional per-instance colour). */
export function setInstances(mesh: THREE.InstancedMesh | null, items: { p: V3; r?: V3; s?: V3; c?: THREE.ColorRepresentation }[]) {
  if (!mesh) return;
  const o = new THREE.Object3D(), col = new THREE.Color();
  items.forEach((it, i) => {
    o.position.set(...it.p);
    o.rotation.set(...(it.r ?? [0, 0, 0]));
    o.scale.set(...(it.s ?? [1, 1, 1]));
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
    if (it.c !== undefined) mesh.setColorAt(i, col.set(it.c));
  });
  mesh.count = items.length;
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingSphere();
}

/**
 * Texture by world position (box projection in the shader) so stretched/instanced boxes keep real-world texel size.
 * `scale` = texture tiles per world unit. Works for instanced and regular meshes.
 */
export function worldUV<T extends THREE.Material>(mat: T, scale: number): T {
  const s = scale.toFixed(4);
  mat.onBeforeCompile = (sh) => {
    const set = ["MAP", "NORMALMAP", "ROUGHNESSMAP", "METALNESSMAP", "AOMAP"]
      .map((d) => `#ifdef USE_${d}\n v${{ MAP: "Map", NORMALMAP: "NormalMap", ROUGHNESSMAP: "RoughnessMap", METALNESSMAP: "MetalnessMap", AOMAP: "AoMap" }[d]}Uv = wuv;\n#endif`)
      .join("\n");
    sh.vertexShader = sh.vertexShader.replace(
      "#include <project_vertex>",
      `#include <project_vertex>
      {
        mat4 im = mat4(1.0);
        #ifdef USE_INSTANCING
          im = instanceMatrix;
        #endif
        vec4 wpos = modelMatrix * im * vec4(transformed, 1.0);
        vec3 wn = normalize(mat3(modelMatrix * im) * objectNormal);
        vec2 wuv = (abs(wn.x) > 0.5 ? wpos.zy : (abs(wn.y) > 0.5 ? wpos.xz : wpos.xy)) * ${s};
        ${set}
      }`,
    );
  };
  mat.customProgramCacheKey = () => `worldUV${s}`;
  return mat;
}
