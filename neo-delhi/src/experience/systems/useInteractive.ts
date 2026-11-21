/**
 * Neo-Delhi 3D Cybersecurity Conference Experience
 * Interactive Object Hook (useInteractive)
 *
 * Provides pointer interaction, hover states, neon glow pulses, and cursor management
 * for 3D meshes in React Three Fiber scenes across all 6 journey chapters.
 *
 * Features:
 * - Integrates with interactions.ts registry & Zustand store
 * - Smooth pointer cursor styling and focus reticle
 * - Emissive neon glow parameters (signal red #D62E42 / crimson #9D071A)
 * - Event bubbling isolation (stopPropagation)
 * - Touch & mobile-friendly pointer handling
 */

"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import {
  useInteractionsStore,
  INTERACTIONS_REGISTRY,
  type InteractionItem,
} from "./interactions";

export interface UseInteractiveOptions {
  /** Identifier matching an entry in INTERACTIONS_REGISTRY */
  id: string;
  /** Whether the object is currently interactive */
  enabled?: boolean;
  /** Custom cursor style when hovered (defaults to 'pointer') */
  cursor?: string;
  /** Custom base emissive color (defaults to interaction item color or signal #D62E42) */
  emissiveColor?: string;
  /** Base glow intensity when not hovered */
  baseIntensity?: number;
  /** Hover glow intensity multiplier */
  hoverIntensity?: number;
  /** Optional custom click callback (executed before default registry action) */
  onClick?: (event: ThreeEvent<MouseEvent | PointerEvent>) => void;
  /** Optional custom hover callback */
  onHoverChange?: (isHovered: boolean) => void;
}

export interface UseInteractiveReturn {
  /** Whether this object is currently hovered */
  isHovered: boolean;
  /** Whether this object is currently selected / inspected in the modal */
  isSelected: boolean;
  /** Associated interaction item metadata from registry */
  item?: InteractionItem;
  /** Computed dynamic emissive color (hex) */
  glowColor: string;
  /** Computed dynamic emissive intensity for Three.js material */
  glowIntensity: number;
  /** Props spreadable directly onto any R3F <mesh> or <group> */
  bind: {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => void;
    onPointerOut: (e: ThreeEvent<PointerEvent>) => void;
    onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
    onClick: (e: ThreeEvent<MouseEvent | PointerEvent>) => void;
  };
}

export function useInteractive({
  id,
  enabled = true,
  cursor = "pointer",
  emissiveColor,
  baseIntensity = 0.2,
  hoverIntensity = 1.6,
  onClick: customOnClick,
  onHoverChange,
}: UseInteractiveOptions): UseInteractiveReturn {
  const [isLocalHovered, setIsLocalHovered] = useState(false);

  const hoveredId = useInteractionsStore((state) => state.hoveredId);
  const selectedId = useInteractionsStore((state) => state.selectedId);
  const setHovered = useInteractionsStore((state) => state.setHovered);
  const selectInteraction = useInteractionsStore((state) => state.selectInteraction);

  const item = useMemo(() => INTERACTIONS_REGISTRY[id], [id]);
  const activeColor = emissiveColor || item?.accentColor || "#D62E42";

  const isSelected = selectedId === id;
  const isHovered = isLocalHovered || hoveredId === id;

  // Manage cursor appearance
  useEffect(() => {
    if (!enabled) return;

    if (isHovered) {
      document.body.style.cursor = cursor;
    } else if (hoveredId === null) {
      document.body.style.cursor = "auto";
    }

    return () => {
      document.body.style.cursor = "auto";
    };
  }, [isHovered, enabled, cursor, hoveredId]);

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!enabled) return;
      e.stopPropagation();
      setIsLocalHovered(true);
      setHovered(id);
      onHoverChange?.(true);
    },
    [enabled, id, setHovered, onHoverChange]
  );

  const handlePointerOut = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!enabled) return;
      e.stopPropagation();
      setIsLocalHovered(false);
      setHovered(null);
      onHoverChange?.(false);
    },
    [enabled, setHovered, onHoverChange]
  );

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!enabled) return;
      // Prevent drag events from hijacking pointer
      e.stopPropagation();
    },
    [enabled]
  );

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent | PointerEvent>) => {
      if (!enabled) return;
      e.stopPropagation();

      // Trigger custom callback if supplied
      customOnClick?.(e);

      // Trigger registry action
      selectInteraction(id);

      // If it's a direct navigation route, handle programmatic redirect
      if (item?.type === "route" && item.details?.actionUrl) {
        window.location.href = item.details.actionUrl;
      }
    },
    [enabled, id, customOnClick, selectInteraction, item]
  );

  const dynamicIntensity = useMemo(() => {
    if (!enabled) return 0;
    if (isSelected) return hoverIntensity * 1.5;
    if (isHovered) return hoverIntensity;
    return baseIntensity;
  }, [enabled, isSelected, isHovered, hoverIntensity, baseIntensity]);

  return {
    isHovered,
    isSelected,
    item,
    glowColor: activeColor,
    glowIntensity: dynamicIntensity,
    bind: {
      onPointerOver: handlePointerOver,
      onPointerOut: handlePointerOut,
      onPointerDown: handlePointerDown,
      onClick: handleClick,
    },
  };
}
