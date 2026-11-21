"use client";

import { Environment, MeshReflectorMaterial, PerformanceMonitor, useProgress } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, ChromaticAberration, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { SECTIONS } from "@/lib/content";
import { scrollState, startScrollLoop } from "@/lib/scroll";
import { Dust, Sky } from "./atmosphere";
import { MaterialsProvider, useMats } from "./materials";
import { lookCurve, posCurve, STOPS } from "./path";
import { ChandniChowk } from "./scenes/ChandniChowk";
import { ConnaughtPlace, CpFill } from "./scenes/ConnaughtPlace";
import { IndiaGate } from "./scenes/IndiaGate";
import { JantarMantar } from "./scenes/JantarMantar";
import { LightRig } from "./lights";
import { MetroStation, MetroTunnel, TrainLight, TunnelLight } from "./scenes/Metro";
import { QutubMinar } from "./scenes/Qutub";
import { CrimsonGrade } from "./grade";
import { uv } from "./util";

// Scratch objects reused every frame (only one Rig exists).
const look = new THREE.Vector3(...STOPS[0].look);
const p = new THREE.Vector3(), target = new THREE.Vector3(), tan = new THREE.Vector3(), tan2 = new THREE.Vector3();
const fringe = new THREE.Vector2(0.0004, 0.0003);
const rig = { roll: 0, fov: 48, time: 0 };
// Touch screens: a tap teleports the pointer, which would jerk the camera. Parallax is mouse-only.
const parallax = matchMedia("(pointer: coarse)").matches ? 0 : 1;

/** Camera on rails with physical feel: spring damping, banking into turns, handheld sway, speed-reactive FOV. */
function Rig() {
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    rig.time += dt;
    const N = SECTIONS.length - 1;
    const t = THREE.MathUtils.clamp(scrollState.chapter / N, 0, 1);
    const speed = Math.min(1, Math.abs(scrollState.velocity) * 1.4);
    posCurve.getPoint(t, p);
    lookCurve.getPoint(t, target);

    // Handheld: slow incommensurate sines per axis, stronger while moving.
    const tm = rig.time, h = 0.06 + speed * 0.1;
    p.x += (Math.sin(tm * 0.63) + Math.sin(tm * 1.37) * 0.4) * h + state.pointer.x * 0.7 * parallax;
    p.y += (Math.sin(tm * 0.81 + 1.3) + Math.sin(tm * 1.9) * 0.3) * h * 0.7 + state.pointer.y * 0.35 * parallax;
    target.x += state.pointer.x * 0.4 * parallax;

    const cam = state.camera as THREE.PerspectiveCamera;
    cam.position.lerp(p, 1 - Math.exp(-dt * 3.2));
    look.lerp(target, 1 - Math.exp(-dt * 4));
    cam.lookAt(look);

    // Bank into turns: sign of the path's turning (cross product of tangents), scaled by scroll speed.
    posCurve.getTangent(Math.min(t, 0.995), tan);
    posCurve.getTangent(Math.min(t + 0.005, 1), tan2);
    const turn = tan.x * tan2.z - tan.z * tan2.x;
    rig.roll += (THREE.MathUtils.clamp(-turn * 60, -0.1, 0.1) * speed - rig.roll) * (1 - Math.exp(-dt * 3));
    cam.rotateZ(rig.roll + Math.sin(tm * 0.5) * 0.004);

    rig.fov += (48 + speed * 9 - rig.fov) * (1 - Math.exp(-dt * 3));
    cam.fov = rig.fov;
    cam.updateProjectionMatrix();
    fringe.set(0.0004 + speed * 0.0025, 0.0003 + speed * 0.0018);
  });
  return null;
}

/** Small "loading the city" pill while textures stream in (sits behind page content). */
function Loader() {
  const { active, progress } = useProgress();
  return (
    <div
      className={`pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 rounded-full border border-gunmetal bg-obsidian/80 px-4 py-2 font-mono text-xs text-muted transition-opacity duration-700 ${active ? "opacity-100" : "opacity-0"}`}
    >
      <span className="text-signal">◆</span> Building Neo-Delhi… {Math.round(progress)}%
      <span className="mt-1.5 block h-px bg-gunmetal">
        <span className="block h-px bg-signal transition-all" style={{ width: `${progress}%` }} />
      </span>
    </div>
  );
}

/**
 * Scenes download and build lazily, when the visitor scrolls within ~1.5 sections of them (building one takes a frame
 * or several, so building them all up front stalls the first screen; scenes skipped by a jump are never built).
 * Once mounted a scene is only shown while its chapter is near: every monument sits ahead of the camera, so frustum
 * culling alone would draw them all.
 */
function Near({ ch, children }: { ch: number; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const [mount, setMount] = useState(ch === 0);
  useFrame(() => {
    const c = scrollState.chapter;
    if (!mount && c > ch - 1.6 && c < ch + 1) setMount(true);
    if (ref.current) ref.current.visible = c > ch - 1.05 && c < ch + 0.8;
  });
  return (
    <group ref={ref}>
      {mount && <Suspense fallback={null}>{children}</Suspense>}
    </group>
  );
}

/** Rain-wet ground. High tier: a real blurred mirror (the red reflections in every reference image). */
function Ground({ wet }: { wet: boolean }) {
  const m = useMats();
  return (
    <mesh material={wet ? undefined : m.asphalt} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -260]}>
      <planeGeometry args={[900, 900]} ref={uv} />
      {wet && (
        <MeshReflectorMaterial
          resolution={512}
          blur={[300, 80]}
          mixBlur={0.8}
          mixStrength={9}
          mixContrast={1.15}
          mirror={0.85}
          depthScale={0.6}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.4}
          color="#2a2524"
          roughness={0.6}
          metalness={0.35}
          map={m.asphalt.map}
          normalMap={m.asphalt.normalMap}
          normalScale={new THREE.Vector2(0.35, 0.35)}
        />
      )}
    </mesh>
  );
}

// Haze per chapter: lighter in the Chandni Chowk square so Jama Masjid reads from the lane.
const FOG_BASE = new THREE.Color("#13080a"), FOG_NAVY = new THREE.Color("#1c060b");
const FOG = [0.0105, 0.012, 0.0105, 0.009, 0.0062, 0.0095, 0.01];

function FogByChapter() {
  useFrame(({ scene }) => {
    const fog = scene.fog as THREE.FogExp2 | null;
    if (!fog) return;
    const c = THREE.MathUtils.clamp(scrollState.chapter, 0, FOG.length - 1), i = Math.floor(c), f = c - i;
    fog.density = FOG[i] + ((FOG[i + 1] ?? FOG[i]) - FOG[i]) * f;
    // Blue hour over Connaught Place: fog shifts from smoky red-black to deep navy.
    fog.color.copy(FOG_BASE).lerp(FOG_NAVY, Math.max(0, 1 - Math.abs(c - 2)) * 0.85);
  });
  return null;
}

export default function Experience({ quality }: { quality: "high" | "low" }) {
  // Starts from the GPU-tier guess, then steps down for real if the frame rate stays low.
  const [high, setHigh] = useState(quality === "high");
  const [dpr, setDpr] = useState(quality === "high" ? 1.5 : 1);
  startScrollLoop();
  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      <Canvas
        dpr={dpr}
        camera={{ position: STOPS[0].pos, fov: 48, near: 0.1, far: 600 }}
        gl={{ antialias: !high, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        onCreated={({ gl }) => void (gl.localClippingEnabled = true)}
        eventSource={document.body}
        eventPrefix="client"
      >
        <fogExp2 attach="fog" args={["#13080a", 0.0105]} />
        <FogByChapter />
        <ambientLight intensity={0.08} color="#ffd9c2" />
        <hemisphereLight args={["#3a2a3a", "#120806", 0.25]} />
        <Suspense fallback={null}>
          {/* 2 MB HDR at 0.14 intensity: not worth the download on phones / low tier. */}
          {quality === "high" && (
            <Suspense fallback={null}>
              <Environment files="/assets/hdri/night.hdr" environmentIntensity={0.14} />
            </Suspense>
          )}
          <MaterialsProvider>
            <Sky />
            <Ground wet={high} />
            <Near ch={0}>
              <IndiaGate />
            </Near>
            <Near ch={1}>
              <MetroTunnel />
            </Near>
            <Near ch={2}>
              <ConnaughtPlace />
            </Near>
            <Near ch={3}>
              <QutubMinar />
            </Near>
            <Near ch={4}>
              <ChandniChowk />
            </Near>
            <Near ch={5}>
              <JantarMantar />
            </Near>
            <Near ch={6}>
              <MetroStation />
            </Near>
            <Dust count={high ? 900 : 350} />
          </MaterialsProvider>
        </Suspense>
        <LightRig />
        <TunnelLight />
        <TrainLight />
        <CpFill />
        <Rig />
        <PerformanceMonitor
          onDecline={() => {
            if (dpr > 1) setDpr(1);
            else if (high) setHigh(false);
            else setDpr(0.75);
          }}
        />
        {high ? (
          <EffectComposer multisampling={0}>
            <Bloom mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.2} intensity={0.9} radius={0.75} />
            <ChromaticAberration offset={fringe} radialModulation modulationOffset={0.3} />
            <Vignette darkness={0.62} offset={0.28} />
            <Noise opacity={0.045} premultiply />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            <CrimsonGrade />
          </EffectComposer>
        ) : (
          <EffectComposer multisampling={0}>
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            <CrimsonGrade />
          </EffectComposer>
        )}
      </Canvas>
      <Loader />
    </div>
  );
}
