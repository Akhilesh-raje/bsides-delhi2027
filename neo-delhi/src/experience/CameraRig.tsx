'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from './store';
import { interpolateCamera } from './chapters';

interface CameraRigProps {
  /**
   * Sensitivity of mouse parallax tilt (default 0.12)
   */
  parallaxIntensity?: number;
  /**
   * Camera smoothing factor per frame (0.01 - 0.2, default 0.065)
   */
  smoothing?: number;
  /**
   * Whether to include subtle cyber breathing motion when idle
   */
  enableBreathing?: boolean;
}

/**
 * CameraRig
 * Controls the 3D perspective camera inside the R3F Canvas.
 * Interpolates along the 6-chapter journey path driven by normalized scroll progress,
 * applying cinematic dampening, subtle mouse parallax, and responsive viewport adjustments.
 */
export function CameraRig({
  parallaxIntensity = 0.12,
  smoothing = 0.065,
  enableBreathing = true,
}: CameraRigProps) {
  const { camera, size, pointer } = useThree();

  // Scratch vectors to prevent memory allocation in useFrame render loop
  const targetPosRef = useRef(new THREE.Vector3());
  const currentPosRef = useRef(new THREE.Vector3());
  const targetLookAtRef = useRef(new THREE.Vector3());
  const currentLookAtRef = useRef(new THREE.Vector3());
  const mouseOffsetRef = useRef(new THREE.Vector2());

  const progress = useExperienceStore((state) => state.progress);
  const isMobile = useExperienceStore((state) => state.isMobile);
  const setCameraTelemetry = useExperienceStore((state) => state.setCameraTelemetry);

  // Initialize camera position on mount
  useEffect(() => {
    const waypoint = interpolateCamera(0);
    camera.position.set(waypoint.position[0], waypoint.position[1], waypoint.position[2]);
    currentPosRef.current.copy(camera.position);

    const initialTarget = new THREE.Vector3(
      waypoint.target[0],
      waypoint.target[1],
      waypoint.target[2]
    );
    currentLookAtRef.current.copy(initialTarget);
    camera.lookAt(initialTarget);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = waypoint.fov;
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  useFrame((state, delta) => {
    // 1. Calculate waypoint based on continuous scroll progress
    const waypoint = interpolateCamera(progress);

    // 2. Adjust target position with subtle mouse parallax (dampened on mobile)
    const effectiveParallax = isMobile ? parallaxIntensity * 0.2 : parallaxIntensity;
    mouseOffsetRef.current.x = THREE.MathUtils.lerp(
      mouseOffsetRef.current.x,
      pointer.x * effectiveParallax * 4.0,
      0.05
    );
    mouseOffsetRef.current.y = THREE.MathUtils.lerp(
      mouseOffsetRef.current.y,
      pointer.y * effectiveParallax * 2.5,
      0.05
    );

    // Subtle atmospheric breathing motion when idle
    let breathX = 0;
    let breathY = 0;
    if (enableBreathing) {
      const time = state.clock.getElapsedTime();
      breathX = Math.sin(time * 0.8) * 0.12;
      breathY = Math.cos(time * 0.6) * 0.15;
    }

    targetPosRef.current.set(
      waypoint.position[0] + mouseOffsetRef.current.x + breathX,
      waypoint.position[1] + mouseOffsetRef.current.y + breathY,
      waypoint.position[2]
    );

    targetLookAtRef.current.set(
      waypoint.target[0] + mouseOffsetRef.current.x * 0.5,
      waypoint.target[1] + mouseOffsetRef.current.y * 0.5,
      waypoint.target[2]
    );

    // 3. Smoothly damp camera position towards target
    // Clamp delta to prevent huge jumps when tab loses focus
    const safeDelta = Math.min(delta, 0.1);
    const dampFactor = 1 - Math.exp(-smoothing * 60 * safeDelta);

    currentPosRef.current.lerp(targetPosRef.current, dampFactor);
    currentLookAtRef.current.lerp(targetLookAtRef.current, dampFactor);

    camera.position.copy(currentPosRef.current);
    camera.lookAt(currentLookAtRef.current);

    // 4. Handle responsive FOV (wider on portrait/mobile viewports)
    if (camera instanceof THREE.PerspectiveCamera) {
      const isPortrait = size.width < size.height;
      const targetFov = waypoint.fov + (isPortrait ? 8 : 0);

      if (Math.abs(camera.fov - targetFov) > 0.1) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, dampFactor);
        camera.updateProjectionMatrix();
      }
    }

    // 5. Broadcast camera telemetry to Zustand store (throttled)
    if (Math.random() < 0.05) {
      setCameraTelemetry(
        [currentPosRef.current.x, currentPosRef.current.y, currentPosRef.current.z],
        [currentLookAtRef.current.x, currentLookAtRef.current.y, currentLookAtRef.current.z]
      );
    }
  });

  return null;
}
