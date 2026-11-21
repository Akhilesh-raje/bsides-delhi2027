import { SECTIONS } from "./content";

// Shared scroll state, read every frame by the 3D camera and the sound engine (no React re-renders).
// chapter: fractional section index (2.5 = halfway from section 2 to 3). velocity: chapters per second, smoothed.
export const scrollState = { chapter: 0, velocity: 0 };
// Written by the 3D scene, read by the sound engine and the platform display.
// trainDist: camera to train front. metro: the platform's live timetable (phase, seconds until arrival, door opening 0..1).
export type MetroPhase = "away" | "arriving" | "doors-open" | "doors-closing" | "departing";
export const worldState = { trainDist: 999, metro: { phase: "away" as MetroPhase, countdown: 0, doors: 0 } };

/** Fire a one-shot sound effect (handled by the sound engine if sound is on). */
export const sfx = (name: string) => window.dispatchEvent(new CustomEvent("neo:sfx", { detail: name }));

let running = false;

function measure() {
  const y = window.scrollY;
  const tops = SECTIONS.map((id) => (document.getElementById(id)?.getBoundingClientRect().top ?? 0) + y);
  for (let i = tops.length - 2; i >= 0; i--) {
    if (y >= tops[i]) return Math.min(i + (y - tops[i]) / Math.max(1, tops[i + 1] - tops[i]), tops.length - 1);
  }
  return 0;
}

export function startScrollLoop() {
  if (running) return;
  running = true;
  let last = performance.now();
  scrollState.chapter = measure();
  const tick = (now: number) => {
    const dt = Math.max(1e-3, (now - last) / 1000);
    last = now;
    const c = measure();
    const v = (c - scrollState.chapter) / dt;
    scrollState.velocity += (v - scrollState.velocity) * Math.min(1, dt * 6);
    scrollState.chapter = c;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** 0..1 weight of chapter i at the current scroll position. */
export const weight = (i: number) => Math.max(0, 1 - Math.abs(scrollState.chapter - i));
