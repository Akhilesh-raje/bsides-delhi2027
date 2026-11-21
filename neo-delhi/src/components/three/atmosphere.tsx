"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollState, sfx } from "@/lib/scroll";
import { useMats } from "./materials";
import { hover } from "./props";
import { glowTexture, rand, type V3 } from "./util";

/** Night sky: near-black zenith, sodium-orange haze at the horizon (Delhi light pollution), a hazy moon. */
export function Sky() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { moonDir: { value: new THREE.Vector3(0.55, 0.42, -1).normalize() }, uBlue: { value: 0 } },
        vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position.z = gl_Position.w; }`,
        fragmentShader: `
          uniform vec3 moonDir; uniform float uBlue; varying vec3 vDir;
          void main(){
            float h = clamp(vDir.y, -0.2, 1.0);
            vec3 zenith = vec3(0.012, 0.013, 0.02);
            vec3 haze = mix(vec3(0.11, 0.025, 0.035), vec3(0.06, 0.08, 0.16), uBlue);
            zenith = mix(zenith, vec3(0.01, 0.02, 0.06), uBlue);
            vec3 col = mix(haze, zenith, smoothstep(-0.02, 0.35, h));
            col += vec3(0.12, 0.01, 0.02) * exp(-abs(h) * 14.0) * 0.6; // faint red neon glow at the skyline
            float m = max(dot(normalize(vDir), moonDir), 0.0);
            col += vec3(0.85, 0.22, 0.2) * (smoothstep(0.9997, 0.99975, m) * 0.55 + pow(m, 900.0) * 0.12); // red moon through smog
            gl_FragColor = vec4(col, 1.0);
          }`,
      }),
    [],
  );
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ camera }) => {
    ref.current?.position.copy(camera.position);
    mat.uniforms.uBlue.value = Math.max(0, 1 - Math.abs(scrollState.chapter - 2));
  });
  return (
    <mesh ref={ref} material={mat} frustumCulled={false} renderOrder={-1}>
      <sphereGeometry args={[500, 32, 16]} />
    </mesh>
  );
}

/** Smog particles drifting around the camera, catching the light. */
export function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (rand(i) - 0.5) * 50;
      a[i * 3 + 1] = rand(i + 0.31) * 18;
      a[i * 3 + 2] = (rand(i + 0.73) - 0.5) * 50;
    }
    return a;
  }, [count]);
  useFrame(({ camera }, dt) => {
    const pts = ref.current;
    if (!pts) return;
    const attr = pts.geometry.attributes.position;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      // Drift, then wrap around the camera so the cloud always surrounds it.
      arr[i] += dt * 0.25;
      arr[i + 1] += Math.sin(i + arr[i] * 0.3) * dt * 0.05;
      const dx = arr[i] - camera.position.x, dz = arr[i + 2] - camera.position.z;
      if (dx > 25) arr[i] -= 50;
      else if (dx < -25) arr[i] += 50;
      if (dz > 25) arr[i + 2] -= 50;
      else if (dz < -25) arr[i + 2] += 50;
    }
    attr.needsUpdate = true;
  });
  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial map={glowTexture()} size={0.12} color="#d8a27a" transparent opacity={0.28} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/** Headlight / tail-light streaks circling a roundabout (clockwise: Delhi drives on the left). */
export function Traffic({ center, radius, count = 40, speed = 0.12 }: { center: V3; radius: number; count?: number; speed?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), []);
  const cars = useMemo(
    () => Array.from({ length: count }, (_, i) => ({ a: rand(i + radius) * Math.PI * 2, lane: (i % 3) * 0.7, v: speed * (0.7 + rand(i * 3) * 0.6), head: i % 2 === 0 })),
    [count, radius, speed],
  );
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const c = new THREE.Color();
    cars.forEach((car, i) => m.setColorAt(i, car.head ? c.setRGB(2.4, 2.1, 1.7) : c.setRGB(2.6, 0.08, 0.1)));
    m.instanceColor!.needsUpdate = true;
  }, [cars]);
  const o = useMemo(() => new THREE.Object3D(), []);
  useFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    cars.forEach((car, i) => {
      car.a -= car.v * dt;
      const r = radius + car.lane;
      o.position.set(center[0] + Math.cos(car.a) * r, 0.45, center[2] + Math.sin(car.a) * r);
      o.rotation.set(0, -car.a, 0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, mat, count]} frustumCulled={false}>
      <boxGeometry args={[0.07, 0.05, 1.6]} />
    </instancedMesh>
  );
}

/** Black kites (cheel) gliding in slow circles: a fixture of Delhi's sky. */
export function Kites({ center, count = 7, height = 36 }: { center: V3; count?: number; height?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => {
    // Simple glider silhouette: two swept wings + forked tail.
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0.3, -0.9, 0.05, -0.1, 0, 0, -0.15, 0, 0, 0.3, 0, 0, -0.15, 0.9, 0.05, -0.1, 0, 0, -0.15, -0.15, 0, -0.55, 0.15, 0, -0.55], 3));
    g.computeVertexNormals();
    return g;
  }, []);
  const birds = useMemo(() => Array.from({ length: count }, (_, i) => ({ a: rand(i) * 6.28, r: 8 + rand(i + 9) * 14, h: height + rand(i + 4) * 10, v: 0.12 + rand(i + 2) * 0.1 })), [count, height]);
  const o = useMemo(() => new THREE.Object3D(), []);
  const t = useRef(0);
  useFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    t.current += dt;
    birds.forEach((b, i) => {
      b.a += b.v * dt;
      o.position.set(center[0] + Math.cos(b.a) * b.r, b.h + Math.sin(t.current * 0.4 + i) * 1.5, center[2] + Math.sin(b.a) * b.r);
      o.rotation.set(0, -b.a, 0.35); // banked into the turn
      o.scale.setScalar(1.6);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[geo, undefined, count]} frustumCulled={false}>
      <meshBasicMaterial color="#050506" side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

/** Flickering flame (eternal flame, diyas). */
export function Flame({ position, scale = 1 }: { position: V3; scale?: number }) {
  const outer = useRef<THREE.Mesh>(null);
  const t = useRef(rand(position[0] + position[2]) * 10);
  const burst = useRef(0); // click to flare
  const mats = useMemo(
    () => [
      new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff6a1a").multiplyScalar(2.5), transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
      new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffd27a").multiplyScalar(3), toneMapped: false }),
    ],
    [],
  );
  useFrame((_, dt) => {
    t.current += dt;
    burst.current = Math.max(0, burst.current - dt * 1.5);
    const f = (1 + Math.sin(t.current * 17) * 0.08 + Math.sin(t.current * 7.3) * 0.12) * (1 + burst.current * 1.6);
    outer.current?.scale.set(scale * (1.1 - f * 0.1), scale * f, scale * (1.1 - f * 0.1));
  });
  return (
    <group
      position={position}
      {...hover}
      onClick={(e) => {
        e.stopPropagation();
        burst.current = 1;
        sfx("flame");
      }}
    >
      <mesh ref={outer} material={mats[0]} position={[0, 0.18 * scale, 0]}>
        <sphereGeometry args={[0.13, 10, 10]} />
      </mesh>
      <mesh material={mats[1]} position={[0, 0.1 * scale, 0]} scale={scale}>
        <sphereGeometry args={[0.06, 8, 8]} />
      </mesh>
    </group>
  );
}

/** Indian national flag, waving (vertex animation on a plane). */
export function NationalFlag({ position, size = [9, 6], pole = 30 }: { position: V3; size?: [number, number]; pole?: number }) {
  const m = useMats();
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 600;
    c.height = 400;
    const g = c.getContext("2d")!;
    [["#FF9933", 0], ["#FFFFFF", 1], ["#138808", 2]].forEach(([col, i]) => {
      g.fillStyle = col as string;
      g.fillRect(0, (i as number) * 133.3, 600, 134);
    });
    // Ashoka Chakra: navy wheel with 24 spokes.
    g.strokeStyle = g.fillStyle = "#000080";
    g.lineWidth = 4;
    g.beginPath();
    g.arc(300, 200, 57, 0, Math.PI * 2);
    g.stroke();
    g.lineWidth = 2;
    for (let s = 0; s < 24; s++) {
      const a = (s / 24) * Math.PI * 2;
      g.beginPath();
      g.moveTo(300, 200);
      g.lineTo(300 + Math.cos(a) * 55, 200 + Math.sin(a) * 55);
      g.stroke();
    }
    g.beginPath();
    g.arc(300, 200, 10, 0, Math.PI * 2);
    g.fill();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(size[0], size[1], 24, 12);
    g.translate(size[0] / 2, 0, 0);
    return g;
  }, [size]);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo]);
  const cloth = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const gust = useRef(0); // click for a gust of wind
  useFrame((_, dt) => {
    gust.current = Math.max(0, gust.current - dt * 0.6);
    t.current += dt * (1 + gust.current * 1.8);
    if (!cloth.current) return;
    const g = cloth.current.geometry;
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3], y = base[i * 3 + 1];
      const k = x / size[0]; // fixed at the pole, free at the fly end
      p.setZ(i, Math.sin(x * 0.9 - t.current * 3.2 + y * 0.15) * 0.45 * k + Math.sin(x * 2.1 - t.current * 5) * 0.08 * k);
    }
    p.needsUpdate = true;
    g.computeVertexNormals();
  });
  return (
    <group position={position}>
      <mesh material={m.steel} position={[0, pole / 2, 0]}>
        <cylinderGeometry args={[0.12, 0.3, pole, 12]} />
      </mesh>
      <mesh
        ref={cloth}
        geometry={geo}
        position={[0.1, pole - size[1] / 2 - 0.3, 0]}
        {...hover}
        onClick={(e) => {
          e.stopPropagation();
          gust.current = 1;
          sfx("flag");
        }}
      >
        <meshStandardMaterial map={tex} side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
    </group>
  );
}
