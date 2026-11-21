import * as THREE from "three";

type V3 = [number, number, number];

// World layout (1 unit ≈ 2 m). Every landmark is placed relative to these, and the camera has one stop per page section.
export const PLACES = {
  indiaGate: [0, 0, 0] as V3,
  tunnel: { start: -26, end: -150 }, // Metro tube with Rajiv Chowk platform
  cp: [0, 0, -195] as V3,
  qutub: [0, 0, -282] as V3,
  chowk: { start: -318, end: -364, rightEnd: -352 }, // right row ends early so Jama Masjid is visible down the lane
  masjid: [16, 0, -446] as V3,
  jantar: [-20, 0, -500] as V3,
  metroGate: [0, 0, -566] as V3,
};

export const STOPS: { pos: V3; look: V3 }[] = [
  { pos: [0, 4.5, 34], look: [0, 9, 0] }, // hero: India Gate from Kartavya Path
  { pos: [-1.8, 2.9, -72], look: [0.6, 2.7, -108] }, // about: on the Metro platform
  { pos: [0, 4.6, -153], look: [0, 3.6, -190] }, // speakers: Connaught Place, above the outer circle looking down a radial road
  { pos: [8, 11, -266], look: [0, 20, -282] }, // agenda: Qutub Minar
  { pos: [0.4, 3.2, -326], look: [6, 8, -410] }, // villages: Chandni Chowk → Jama Masjid
  { pos: [0, 6.5, -470], look: [-20, 5.5, -500] }, // sponsors: Jantar Mantar
  { pos: [0, 3, -545], look: [0, 2.6, -566] }, // tickets: Metro station gates
];

export const posCurve = new THREE.CatmullRomCurve3(STOPS.map((s) => new THREE.Vector3(...s.pos)), false, "centripetal");
export const lookCurve = new THREE.CatmullRomCurve3(STOPS.map((s) => new THREE.Vector3(...s.look)), false, "centripetal");

/** Angles (radians, atan2(z, x) around `center`) where the camera path crosses a circle of radius r. Used to leave road gaps in Connaught Place. */
export function pathCrossings(center: V3, r: number) {
  const out: number[] = [];
  let prev: number | null = null;
  for (let i = 0; i <= 2000; i++) {
    const p = posCurve.getPoint(i / 2000);
    const d = Math.hypot(p.x - center[0], p.z - center[2]) - r;
    if (prev !== null && Math.sign(d) !== Math.sign(prev)) out.push(Math.atan2(p.z - center[2], p.x - center[0]));
    prev = d;
  }
  return out;
}

const samples = Array.from({ length: 1200 }, (_, i) => posCurve.getPoint(i / 1199));
/** True if world point (x, z) is at least d units from the camera path — for placing trees, props, people. */
export const clearOfPath = (x: number, z: number, d = 4) => samples.every((p) => Math.hypot(p.x - x, p.z - z) > d);
