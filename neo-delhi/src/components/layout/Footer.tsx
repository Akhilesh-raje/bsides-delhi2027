import { EVENT } from "@/lib/content";

// Footer drawn as a Metro line: each station jumps to a section.
const STATIONS = [
  ["India Gate", "#hero"],
  ["Metro", "#about"],
  ["CP", "#speakers"],
  ["Qutub", "#agenda"],
  ["Chandni Chowk", "#villages"],
  ["Jantar Mantar", "#sponsors"],
  ["Tickets", "#tickets"],
];

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-gunmetal/60 bg-obsidian px-6 pt-14 pb-20">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Section map" className="relative mb-12 overflow-x-auto">
          <div className="absolute top-[7px] left-2 right-2 h-[3px] bg-crimson" />
          <ol className="relative flex min-w-[640px] justify-between">
            {STATIONS.map(([name, href]) => (
              <li key={href}>
                <a href={href} className="group flex flex-col items-center gap-2 text-xs text-muted hover:text-silver">
                  <span className="h-4 w-4 rounded-full border-[3px] border-crimson bg-obsidian group-hover:bg-signal" />
                  {name}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="flex flex-col justify-between gap-4 text-sm text-muted sm:flex-row">
          <p>
            <span className="font-display font-bold text-silver">{EVENT.name}</span> · {EVENT.dates} · {EVENT.city}
          </p>
          <p className="font-mono text-xs">Built in Delhi · by the community, for the community</p>
        </div>
      </div>
    </footer>
  );
}
