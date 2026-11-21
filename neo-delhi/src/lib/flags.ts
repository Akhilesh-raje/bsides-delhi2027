import { create } from "zustand";
import { persist } from "zustand/middleware";

// Hidden flags. Client-side fun only — not a real CTF (anyone can read this file).
export const FLAGS: Record<string, string> = {
  gate: "India Gate",
  tunnel: "Metro tunnel",
  cp: "Connaught Place",
  palika: "Palika Bazaar terminal",
  qutub: "Qutub Minar",
  chowk: "Chandni Chowk",
  bazaar: "Gupta Electronics terminal",
  jantar: "Jantar Mantar",
  metro: "Metro gate",
  console: "The console",
  konami: "Old-school code",
};

type FlagState = {
  found: string[];
  last: string | null;
  find: (id: string) => void;
};

export const useFlags = create<FlagState>()(
  persist(
    (set, get) => ({
      found: [],
      last: null,
      find: (id) => {
        if (!(id in FLAGS) || get().found.includes(id)) return;
        set({ found: [...get().found, id], last: id });
      },
    }),
    { name: "neo-delhi-flags", partialize: (s) => ({ found: s.found }) },
  ),
);
