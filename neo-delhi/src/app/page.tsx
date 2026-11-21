import { TicketCheckout } from "@/components/tickets/TicketCheckout";
import { World } from "@/components/three/World";
import { AGENDA, EVENT, HUD, SPEAKERS, SPONSOR_TIERS, STATS, VILLAGES } from "@/lib/content";

// Each section is one full screen; the 3D camera has one stop per section (see Experience.tsx STOPS).
/** Holographic info card (as in the reference art): monument, coordinates, facts. Decorative, so hidden on small screens. */
function HudCard({ id }: { id: string }) {
  const h = HUD[id];
  if (!h) return null;
  return (
    <aside
      aria-label={`${h.name} facts`}
      className="reveal pointer-events-none absolute top-1/2 right-6 hidden w-64 -translate-y-1/2 -skew-y-2 rounded-lg border border-signal/60 bg-obsidian/45 p-5 font-mono text-xs text-silver shadow-[0_0_40px_rgba(214,46,66,0.25),inset_0_0_20px_rgba(214,46,66,0.08)] backdrop-blur-sm lg:block xl:right-12"
    >
      <span aria-hidden className="absolute -top-px -left-px h-4 w-4 border-t-2 border-l-2 border-signal" />
      <span aria-hidden className="absolute -right-px -bottom-px h-4 w-4 border-r-2 border-b-2 border-signal" />
      <p className="font-display text-lg font-bold tracking-wide text-signal uppercase">{h.name}</p>
      <p className="mb-3 text-muted" lang="hi">{h.hi}</p>
      <p className="mb-3 text-silver/90">{h.coords}</p>
      <ul className="space-y-1.5 border-t border-signal/30 pt-3 text-muted">
        {h.facts.map((f) => (
          <li key={f}>
            <span className="text-signal">▸</span> {f}
          </li>
        ))}
      </ul>
    </aside>
  );
}

function Chapter({ id, n, place, title, side = "left", children }: {
  id: string; n: string; place: string; title: string; side?: "left" | "right"; children: React.ReactNode;
}) {
  return (
    <section id={id} className={`relative flex min-h-screen items-center px-4 py-28 sm:px-8 ${side === "right" ? "justify-end" : ""}`}>
      <HudCard id={id} />
      <div className="reveal w-full max-w-xl rounded-card border border-gunmetal/60 bg-obsidian/65 p-7 backdrop-blur-md sm:p-9">
        <p className="mb-3 font-mono text-xs tracking-[0.2em] text-signal uppercase">
          {n} · {place}
        </p>
        <h2 className="mb-5 font-display text-3xl font-bold tracking-tight text-silver sm:text-4xl">{title}</h2>
        {children}
      </div>
    </section>
  );
}

const btn = "inline-flex items-center gap-2 rounded-button px-5 py-3 text-sm font-medium transition-all";
const primary = `${btn} bg-signal text-white hover:shadow-[0_0_24px_rgba(214,46,66,0.45)]`;
const ghost = `${btn} border border-gunmetal text-silver hover:border-signal`;

export default function Home() {
  return (
    <>
      <World />
      <div className="relative z-10">
        <section id="hero" className="relative flex min-h-screen flex-col justify-end px-4 pb-24 sm:px-8">
          {/* Scrim so the hero copy stays readable over the lit monument */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-obsidian/85 via-obsidian/30 to-transparent" />
          <HudCard id="hero" />
          <div className="reveal mx-auto w-full max-w-7xl">
            <p className="mb-4 font-mono text-xs tracking-[0.3em] text-signal uppercase">
              {EVENT.dates} · {EVENT.city}
            </p>
            <h1 className="font-display text-6xl leading-[0.9] font-bold tracking-tighter text-silver sm:text-8xl lg:text-9xl">
              BSides
              <br />
              <span className="text-signal [text-shadow:0_0_40px_rgba(214,46,66,0.5)]">Delhi</span> 2027
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted">
              India&apos;s community-driven security conference. Two days of talks, workshops, villages and a 24-hour CTF,
              in the heart of Neo-Delhi.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#tickets" className={primary}>Get tickets →</a>
              <a href={EVENT.cfpUrl} className={ghost}>Call for papers</a>
            </div>
            <p className="mt-12 font-mono text-xs text-muted">Scroll to enter the city ↓</p>
          </div>
        </section>

        <Chapter id="about" n="01" place="Metro · Yellow Line" title="Built by the community">
          <p className="text-muted">
            BSides Delhi brings together researchers, defenders, breakers and students. No sales pitches, just good talks,
            hands-on villages and people who love this stuff. Whether you run a security team or wrote your first exploit
            last week, there&apos;s a seat for you.
          </p>
          <dl className="mt-7 grid grid-cols-4 gap-3">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-lg border border-gunmetal/70 p-3 text-center">
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-2xl font-bold text-silver">{s.value}</dd>
                <dd className="text-xs text-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        </Chapter>

        <Chapter id="speakers" n="02" place="Connaught Place" title="Speakers">
          <p className="mb-6 text-muted">The lineup drops soon. Want to be on it? Talks and workshops are open for submissions.</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {SPEAKERS.map((s, i) => (
              <li key={i} className="rounded-lg border border-gunmetal/70 p-4 transition-colors hover:border-signal/70">
                <p className="font-mono text-[11px] tracking-widest text-signal uppercase">{s.role}</p>
                <p className="mt-1 font-medium text-silver">{s.name}</p>
                <p className="text-sm text-muted">{s.topic}</p>
              </li>
            ))}
          </ul>
        </Chapter>

        <Chapter id="agenda" n="03" place="Qutub Minar" title="Agenda">
          <p className="mb-5 font-mono text-xs text-muted">Draft schedule. Subject to change.</p>
          <div className="grid gap-6 sm:grid-cols-2">
            {AGENDA.map((d) => (
              <div key={d.day}>
                <h3 className="mb-3 font-display font-bold text-silver">{d.day}</h3>
                <ol className="space-y-2 border-l border-crimson/60 pl-4">
                  {d.slots.map(([time, what]) => (
                    <li key={time} className="text-sm">
                      <span className="font-mono text-signal">{time}</span> <span className="text-muted">{what}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </Chapter>

        <Chapter id="villages" n="04" place="Chandni Chowk" title="Villages & CTF">
          <p className="mb-6 text-muted">Every lane has something to break. Look for the neon signs.</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {VILLAGES.map((v) => (
              <li key={v.name} className="rounded-lg border border-gunmetal/70 p-4">
                <p className="font-medium text-silver">
                  {v.name} <span className="text-signal" lang="hi">{v.hi}</span>
                </p>
                <p className="text-sm text-muted">{v.desc}</p>
              </li>
            ))}
          </ul>
        </Chapter>

        <Chapter id="sponsors" n="05" place="Jantar Mantar" title="Sponsors">
          <p className="mb-6 text-muted">
            BSides runs on community support. Put your team in front of Delhi&apos;s security talent and help keep tickets
            affordable for students.
          </p>
          <ul className="mb-7 flex flex-wrap gap-2">
            {SPONSOR_TIERS.map((t) => (
              <li key={t} className="rounded-full border border-gunmetal px-4 py-1.5 text-sm text-muted">{t}</li>
            ))}
          </ul>
          {EVENT.contactEmail ? (
            <a href={`mailto:${EVENT.contactEmail}?subject=Sponsoring BSides Delhi 2027`} className={primary}>Become a sponsor →</a>
          ) : (
            <p className="font-mono text-xs text-muted">Sponsorship deck coming soon.</p>
          )}
        </Chapter>

        <section id="tickets" className="flex min-h-screen flex-col justify-center px-4 py-28 sm:px-8">
          <div className="reveal mx-auto w-full max-w-7xl">
            <p className="mb-3 text-center font-mono text-xs tracking-[0.2em] text-signal uppercase">06 · Metro gate</p>
            <h2 className="mb-10 text-center font-display text-4xl font-bold tracking-tight text-silver">Tickets</h2>
            <TicketCheckout />
          </div>
        </section>
      </div>
    </>
  );
}
