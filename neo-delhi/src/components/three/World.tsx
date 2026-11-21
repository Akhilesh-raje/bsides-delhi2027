"use client";

import { getGPUTier } from "detect-gpu";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Experience = dynamic(() => import("./Experience"), { ssr: false });

type Mode = "pending" | "high" | "low" | "static";

// Picks the 3D quality for this device. Reduced-motion and weak GPUs get the static backdrop only.
export function World() {
  const [mode, setMode] = useState<Mode>("pending");

  useEffect(() => {
    // No GPU (software WebGL, e.g. SwiftShader/llvmpipe): every 3D frame would run on the CPU and freeze the page.
    const softwareGL = !document.createElement("canvas").getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (softwareGL || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      queueMicrotask(() => setMode("static"));
      return;
    }
    const lenis = new Lenis({ autoRaf: true, anchors: true });
    // Benchmarks are self-hosted in /public/benchmarks so no third-party request is made.
    // The 3D city starts only after the page has loaded and the browser is idle, so the text and buttons are usable first.
    const loaded = new Promise<void>((r) => (document.readyState === "complete" ? r() : addEventListener("load", () => r(), { once: true })));
    const idle = (f: () => void) => ("requestIdleCallback" in window ? requestIdleCallback(f, { timeout: 2500 }) : setTimeout(f, 500));
    Promise.all([getGPUTier({ benchmarksURL: "/benchmarks" }).catch(() => null), loaded]).then(([g]) =>
      idle(() => setMode(!g ? "low" : g.tier >= 2 && !g.isMobile ? "high" : g.tier >= 1 ? "low" : "static")),
    );
    return () => lenis.destroy();
  }, []);

  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_110%,rgba(157,7,26,0.35),transparent_60%),linear-gradient(to_bottom,#08090D,#0d0e13)]"
      />
      {(mode === "high" || mode === "low") && <Experience quality={mode} />}
    </>
  );
}
