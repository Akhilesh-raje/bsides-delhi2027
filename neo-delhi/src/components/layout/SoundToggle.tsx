"use client";

import { useEffect, useState } from "react";
import { setSound } from "@/lib/audio";
import { startScrollLoop } from "@/lib/scroll";

const KEY = "neo-delhi-sound";

// Sound is off until the visitor asks for it (and browsers block audio before a gesture anyway).
export function SoundToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(KEY) !== "on") return;
    // Returning visitor who left sound on: resume on their first interaction.
    const arm = () => {
      startScrollLoop();
      setSound(true).then(() => setOn(true));
    };
    window.addEventListener("pointerdown", arm, { once: true });
    window.addEventListener("keydown", arm, { once: true });
    return () => {
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    };
  }, []);

  const toggle = async () => {
    const next = !on;
    startScrollLoop();
    await setSound(next);
    setOn(next);
    localStorage.setItem(KEY, next ? "on" : "off");
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Turn sound off" : "Turn sound on"}
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex items-center gap-2 rounded-full border border-gunmetal bg-obsidian/70 px-3 py-1.5 font-mono text-xs text-muted backdrop-blur transition-colors hover:border-signal hover:text-silver"
    >
      <span className="flex h-3 items-end gap-[2px]" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-[2px] rounded-sm bg-signal ${on ? "animate-[eq_0.9s_ease-in-out_infinite]" : ""}`}
            style={{ height: on ? undefined : 3, animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
      {on ? "Sound on" : "Sound off"}
    </button>
  );
}
