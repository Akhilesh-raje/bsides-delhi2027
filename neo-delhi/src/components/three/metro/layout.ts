import * as THREE from "three";
import { worldState } from "@/lib/scroll";
import { PLACES } from "../path";
import type { V3 } from "../util";

// Rajiv Chowk (underground) at metro scale: 1 unit ≈ 1.2 m. Camera stands on the platform at z ≈ -72 looking -z.
export const { start: Z0, end: Z1 } = PLACES.tunnel; // approach-bore portal (behind India Gate) … far-bore exit (to CP)
export const SH0 = -52, SH1 = -138; // station box ends; circular bores outside
export const PH = 1.1; // platform height above rail
export const EDGE = 0.6; // platform edge (x)
export const BACK = -7; // back wall (x)
export const TWALL = 4.7; // track-side wall (x)
export const CEIL = 5.5; // platform ceiling
export const CEIL_T = 7; // track ceiling
export const TRACK = 2.15; // track centre (x)
export const PSD_X = 0.45; // platform screen doors
export const BORE: { x: number; spring: number; w: number } = { x: 0.5, spring: 2.6, w: 8 }; // horseshoe bore
export const MODEL = 1 / 1.2; // metres → units for imported models and people
export const COLUMNS = [-58, -69, -80, -91, -102, -113, -124, -135];
export const HANGING = [-88, -108, -128]; // hanging sign / display positions (z)
export const ESC = { x0: -6.7, x1: -5.1, z0: -112, z1: -121 }; // escalator footprint, rising towards -z

// Train: three 16-unit coaches, cab front at z = cab, coaches trailing towards -z. Runs towards +z.
export const CL = 16, NC = 3, TRAIN_LEN = CL * NC;
export const DOORS = [-2.4, -6.1, -9.8, -13.5]; // door centres, coach-local (coach front = 0)

// ---- Timetable (one cycle drives train, doors, PSDs, displays, passengers and sound) ----
export const CYCLE = 46, ARRIVE = 14, STOP = 26, OPEN = 27.5, CLOSE = 36, SHUT = 38.5;
export const STOP_Z = -58;
export const metroTime = { s: 4, v: 0 };
const FROM = Z1 - 2, TO = Z0 + TRAIN_LEN + 4;
const ease = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export function trainZ(s: number) {
  if (s < ARRIVE) return FROM;
  if (s < STOP) return FROM + (STOP_Z - FROM) * (1 - (1 - (s - ARRIVE) / (STOP - ARRIVE)) ** 2); // braking in
  if (s < SHUT) return STOP_Z;
  return STOP_Z + (TO - STOP_Z) * ease(clamp01((s - SHUT) / (CYCLE - SHUT))) ** 1.5; // pulling out
}

/** World z of each platform-side door when the train is stopped. */
export const DOOR_Z = Array.from({ length: NC }, (_, c) => DOORS.map((d) => STOP_Z - c * CL + d)).flat();

export function tickMetro(dt: number) {
  const prev = metroTime.s;
  const s = (metroTime.s = (metroTime.s + Math.min(dt, 0.1)) % CYCLE);
  metroTime.v = dt > 0 ? (trainZ(s) - trainZ(prev < s ? prev : s)) / dt : 0;
  const m = worldState.metro;
  m.phase = s < ARRIVE ? "away" : s < OPEN ? "arriving" : s < CLOSE ? "doors-open" : s < SHUT ? "doors-closing" : "departing";
  m.countdown = s < STOP ? STOP - s : 0;
  m.doors = s < OPEN ? 0 : s < CLOSE ? clamp01((s - OPEN) / 1.2) : clamp01(1 - (s - CLOSE) / 1.4);
}

// Train geometry is clipped at both tunnel mouths so it never pokes out into India Gate or Connaught Place.
export const TRAIN_CLIP = [new THREE.Plane(new THREE.Vector3(0, 0, 1), -Z1), new THREE.Plane(new THREE.Vector3(0, 0, -1), Z0)];

export type Item = { p: V3; r?: V3; s?: V3; c?: THREE.ColorRepresentation };
