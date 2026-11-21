"use client";

import type { ThreeElements } from "@react-three/fiber";
import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from "react";
import type * as THREE from "three";
import { setInstances } from "../util";
import type { Item } from "./layout";

type Props = { items: Item[]; material: THREE.Material; geometry?: THREE.BufferGeometry; children?: React.ReactNode } & Omit<ThreeElements["instancedMesh"], "args" | "ref" | "material" | "geometry" | "children">;

/** One InstancedMesh for many copies of a static part. `items` must be stable (module constant or memoised). */
export const Inst = forwardRef<THREE.InstancedMesh, Props>(function Inst({ items, material, geometry, children, ...rest }, fref) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useImperativeHandle(fref, () => ref.current!, []);
  // Re-run when the mesh is rebuilt (new material/geometry), not just when the items change.
  useLayoutEffect(() => setInstances(ref.current, items), [items, material, geometry]);
  return (
    <instancedMesh ref={ref} args={[geometry, material, Math.max(1, items.length)]} {...rest}>
      {children}
    </instancedMesh>
  );
});
