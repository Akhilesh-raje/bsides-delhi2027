"use client";

import { useEffect, useState } from "react";
import { FLAGS, useFlags } from "@/lib/flags";

const ANSWER = "chai-over-coffee";
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

// Console puzzle + Konami code + the small "flags found" HUD.
export function ConsoleSignal() {
  const found = useFlags((s) => s.found);
  const last = useFlags((s) => s.last);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const find = useFlags.getState().find;
    queueMicrotask(() => setMounted(true));
    console.log("%c◆ NEO-DELHI // BSides Delhi 2027", "color:#D62E42;font:700 22px monospace");
    console.log(
      `%cYou opened the console. Good instinct.\nThe city hides ${Object.keys(FLAGS).length} flags. Here is one:\n  decode → ${btoa(ANSWER)}\n  then run neo.unlock("<answer>")`,
      "color:#99949A;font:12px monospace",
    );
    (window as unknown as { neo: object }).neo = {
      unlock: (a: string) => (a === ANSWER ? (find("console"), "◆ flag captured") : "nope. try harder."),
    };

    let i = 0;
    const onKey = (e: KeyboardEvent) => {
      i = e.key === KONAMI[i] ? i + 1 : e.key === KONAMI[0] ? 1 : 0;
      if (i < KONAMI.length) return;
      i = 0;
      find("konami");
      document.documentElement.classList.add("glitch");
      window.dispatchEvent(new Event("neo:glitch"));
      setTimeout(() => document.documentElement.classList.remove("glitch"), 2500);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!last) return;
    const t = setTimeout(() => useFlags.setState({ last: null }), 3000);
    return () => clearTimeout(t);
  }, [last]);

  if (!mounted) return null;
  const total = Object.keys(FLAGS).length;

  return (
    <div className="fixed bottom-4 left-4 z-40 flex flex-col items-start gap-2 font-mono text-xs">
      {last && (
        <div role="status" className="rounded-lg border border-signal/60 bg-obsidian/90 px-3 py-2 text-silver shadow-[0_0_20px_rgba(214,46,66,0.35)]">
          ◆ Flag captured: {FLAGS[last]}
        </div>
      )}
      <div
        title={found.length ? `Found: ${found.map((f) => FLAGS[f]).join(", ")}` : "Something is hidden in the city…"}
        className="rounded-full border border-gunmetal bg-obsidian/70 px-3 py-1.5 text-muted backdrop-blur"
      >
        <span className="text-signal">◆</span> {found.length}/{total} flags
        {found.length === total && <span className="text-silver"> · Delhi Explorer unlocked</span>}
      </div>
    </div>
  );
}
