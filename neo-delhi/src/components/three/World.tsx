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
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      queueMicrotask(() => setMode("static"));
      return;
    }
    const lenis = new Lenis({ autoRaf: true, anchors: true });
    // Benchmarks are self-hosted in /public/benchmarks so no third-party request is made.
    getGPUTier({ benchmarksURL: "/benchmarks" })
      .then((g) => setMode(g.tier >= 2 && !g.isMobile ? "high" : g.tier >= 1 ? "low" : "static"))
      .catch(() => setMode("low"));
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
