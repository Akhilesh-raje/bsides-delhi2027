// Procedural Delhi soundscape (Web Audio, no files). Layers fade with the scroll chapter:
// 0 India Gate · 1 Metro · 2 Connaught Place · 3 Qutub · 4 Chandni Chowk · 5 Jantar Mantar · 6 Metro station / event gate.
import { useFlags } from "./flags";
import { scrollState, weight, worldState } from "./scroll";

type Bed = { gain: GainNode; level: () => number };

let ctx: AudioContext | null = null;
let master: GainNode;
let reverb: GainNode;
let beds: Bed[] = [];
let on = false;
let raf = 0;
const timers = { horn: 0, bell: 0, kite: 0, clack: 0, babble: 0, whistle: 0, brake: 0, pigeon: 0 };
let musicIn: GainNode;
const music = { t: 0, i: 0 };
const chant = { t: 0, n: 0 }, raga = { t: 0, i: 0 };
let qutubIn: GainNode;
const speech = { place: -1, next: 0, idx: {} as Record<number, number> };
let noiseBuf: AudioBuffer;
let lastNow = 0;

function noise(c: AudioContext, kind: "white" | "pink" | "brown", seconds = 4) {
  const len = c.sampleRate * seconds, buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let b0 = 0, b1 = 0, b2 = 0, last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === "white") d[i] = w;
      else if (kind === "pink") {
        b0 = 0.99765 * b0 + w * 0.099;
        b1 = 0.963 * b1 + w * 0.2965;
        b2 = 0.57 * b2 + w * 1.0526;
        d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.18;
      } else {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      }
    }
  }
  return buf;
}

function loop(c: AudioContext, buf: AudioBuffer) {
  const s = c.createBufferSource();
  s.buffer = buf;
  s.loop = true;
  s.loopStart = Math.random() * 2;
  s.start(0, Math.random() * 3);
  return s;
}

function filter(c: AudioContext, type: BiquadFilterType, freq: number, q = 0.7) {
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  return f;
}

function impulse(c: AudioContext, seconds: number) {
  const len = c.sampleRate * seconds, buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  return buf;
}

function bed(c: AudioContext, src: AudioNode, level: () => number, chain: AudioNode[] = [], wet = 0.15) {
  const g = c.createGain();
  g.gain.value = 0;
  [src, ...chain].reduce((a, b) => (a.connect(b), b));
  (chain.at(-1) ?? src).connect(g);
  g.connect(master);
  if (wet) {
    const w = c.createGain();
    w.gain.value = wet;
    g.connect(w).connect(reverb);
  }
  beds.push({ gain: g, level });
  return g;
}

/** Short enveloped tone, routed with optional pan and reverb send. */
function tone(freq: number, dur: number, { type = "sine", vol = 0.1, pan = 0, attack = 0.005, wet = 0.2, at = 0, bp = 0 }: { type?: OscillatorType; vol?: number; pan?: number; attack?: number; wet?: number; at?: number; bp?: number } = {}) {
  if (!ctx) return;
  const c = ctx, t = c.currentTime + at;
  const o = c.createOscillator(), g = c.createGain(), p = c.createStereoPanner();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  p.pan.value = pan;
  let node: AudioNode = o;
  if (bp) node = node.connect(filter(c, "bandpass", bp, 2.5));
  node.connect(g).connect(p).connect(master);
  if (wet) {
    const w = c.createGain();
    w.gain.value = wet;
    p.connect(w).connect(reverb);
  }
  o.start(t);
  o.stop(t + dur + 0.05);
  return o;
}

/** Bell: inharmonic partials with long decay (cycle-rickshaw bell, chimes). */
function bell(f: number, { vol = 0.06, pan = 0, at = 0, dur = 2.2 } = {}) {
  [1, 2.76, 5.4, 8.93].forEach((r, i) => tone(f * r, dur / (i + 1), { vol: vol / (i + 1), pan, at, wet: 0.4 }));
}

/** Band voice into the India Gate music bus: detuned saws through a soft lowpass with slow vibrato (brass / strings). */
function voice(freq: number, at: number, dur: number, { type = "sawtooth" as OscillatorType, vol = 0.05, cutoff = 1400, attack = 0.06, vib = 5, out = undefined as AudioNode | undefined } = {}) {
  if (!ctx) return;
  const c = ctx, t = at, g = c.createGain(), f = filter(c, "lowpass", cutoff, 0.8);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.setValueAtTime(vol, t + Math.max(attack, dur - 0.12));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.25);
  g.connect(out ?? musicIn);
  f.connect(g);
  [-6, 6].forEach((d) => {
    const o = c.createOscillator(), lfo = c.createOscillator(), lg = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.detune.value = d;
    lfo.frequency.value = vib;
    lg.gain.value = freq * 0.004;
    lfo.connect(lg).connect(o.frequency);
    o.connect(f);
    [o, lfo].forEach((x) => (x.start(t), x.stop(t + dur + 0.3)));
  });
}

/** Short filtered-noise hit into the music bus (snare brush / timpani body). */
function drum(at: number, { vol = 0.05, freq = 1800, dur = 0.12, low = 0 } = {}) {
  if (!ctx) return;
  const c = ctx, s = c.createBufferSource(), g = c.createGain();
  s.buffer = noiseBuf;
  g.gain.setValueAtTime(vol, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  s.connect(filter(c, "bandpass", freq, 1.2)).connect(g).connect(musicIn);
  s.start(at, Math.random() * 2, dur + 0.05);
  if (low) {
    const o = c.createOscillator(), og = c.createGain();
    o.frequency.setValueAtTime(low, at);
    o.frequency.exponentialRampToValueAtTime(low * 0.8, at + 0.6);
    og.gain.setValueAtTime(vol * 1.6, at);
    og.gain.exponentialRampToValueAtTime(0.0001, at + 0.9);
    o.connect(og).connect(musicIn);
    o.start(at);
    o.stop(at + 1);
  }
}

// An original, slow and dignified march for the war memorial (not an existing anthem or song). [semitones above D4, beats]
const THEME: [number, number][] = [
  [0, 1], [4, 1], [7, 1.5], [9, 0.5], [7, 1], [4, 1], [5, 2], [2, 2],
  [2, 1], [5, 1], [9, 1.5], [11, 0.5], [9, 1], [7, 1], [4, 4],
  [7, 1], [9, 1], [12, 2], [11, 1], [9, 1], [7, 2],
  [4, 1], [5, 1], [7, 1], [4, 1], [2, 2], [0, 4],
];
const BEAT = 60 / 66, D4 = 293.66;
const hz = (st: number) => D4 * 2 ** (st / 12);
// Chord root under each note, by bar: I IV ii V / I vi V I
const BASS = [0, 5, 2, 7, 0, 9, 7, 0];

function playMusic(now: number) {
  if (weight(0) < 0.05) {
    music.i = 0;
    music.t = now + 0.2;
    return;
  }
  let beats = THEME.slice(0, music.i).reduce((a, n) => a + n[1], 0);
  while (music.t < now + 0.4) {
    const [st, len] = THEME[music.i], at = music.t, dur = len * BEAT;
    voice(hz(st), at, dur * 0.95, { vol: 0.05, cutoff: 1700 }); // trumpet line
    voice(hz(st - 12), at, dur * 0.95, { vol: 0.025, cutoff: 900, type: "triangle" }); // horns an octave down
    for (let b = Math.ceil(beats - 1e-6); b < beats + len - 1e-6; b++) {
      const bt = at + (b - beats) * BEAT, bar = Math.floor(b / 4) % BASS.length;
      drum(bt, { vol: b % 4 === 0 ? 0.05 : 0.025, freq: 2200 });
      if (b % 4 === 0) {
        drum(bt, { vol: 0.05, freq: 120, dur: 0.3, low: hz(BASS[bar] - 24) });
        voice(hz(BASS[bar] - 12), bt, BEAT * 4, { vol: 0.03, cutoff: 600, attack: 0.4, vib: 4.2 }); // strings
        voice(hz(BASS[bar] - 5), bt, BEAT * 4, { vol: 0.018, cutoff: 700, attack: 0.5, vib: 4.6 });
      }
      if (b % 4 === 3) [0.25, 0.5, 0.75].forEach((o) => drum(bt + o * BEAT, { vol: 0.018, freq: 2600, dur: 0.07 })); // snare roll into the bar
    }
    beats += len;
    music.t += dur;
    if (++music.i >= THEME.length) {
      music.i = 0;
      beats = 0;
      music.t += BEAT * 2; // breath between repeats
    }
  }
}

/** Crowd shout: a dozen rough voices plus breath noise, through vowel formants. */
function shout(at: number, vol: number, pitch: number, len = 0.32) {
  if (!ctx) return;
  const c = ctx, g = c.createGain(), f1 = filter(c, "bandpass", 700, 1.4), f2 = filter(c, "bandpass", 1150, 2);
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(vol, at + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  f1.connect(g);
  f2.connect(g);
  g.connect(master);
  const w = c.createGain();
  w.gain.value = 0.35;
  g.connect(w).connect(reverb);
  for (let i = 0; i < 12; i++) {
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = pitch * (0.85 + Math.random() * 0.5) * (i % 3 ? 1 : 1.9);
    o.connect(i % 2 ? f1 : f2);
    o.start(at);
    o.stop(at + len + 0.05);
  }
  const n = c.createBufferSource();
  n.buffer = noiseBuf;
  n.connect(f1);
  n.start(at, Math.random() * 2, len + 0.05);
}

/** Dhol: bass head thump or treble-stick slap. */
function dhol(at: number, vol: number, bass: boolean) {
  if (!ctx) return;
  const c = ctx, o = c.createOscillator(), g = c.createGain();
  o.frequency.setValueAtTime(bass ? 95 : 320, at);
  o.frequency.exponentialRampToValueAtTime(bass ? 55 : 220, at + 0.15);
  g.gain.setValueAtTime(vol, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + (bass ? 0.45 : 0.12));
  o.connect(g).connect(master);
  o.start(at);
  o.stop(at + 0.5);
}

// Jantar Mantar sit-in: leader calls on a megaphone (beats 0-2), the crowd answers (beats 4-6), dhol throughout.
// One cycle = 8 beats of 0.6 s = CHANT in JantarMantar.tsx, so fists rise with the response.
function playProtest(now: number) {
  const w = weight(5);
  if (w < 0.05) {
    chant.t = now + 0.2;
    chant.n = 0;
    return;
  }
  while (chant.t < now + 0.3) {
    const at = chant.t, b = chant.n % 8, v = 0.45 * w;
    dhol(at, (b % 2 ? 0.05 : 0.09) * v, b % 2 === 0);
    if (b % 2) dhol(at + 0.3, 0.035 * v, false);
    if (b < 3) tone([300, 340, 390][b], 0.34, { type: "sawtooth", vol: 0.05 * v, at: at - now, pan: -0.35, bp: 1600, wet: 0.35 }); // megaphone
    if (b >= 4 && b < 7) shout(at, [0.05, 0.05, 0.08][b - 4] * v, [190, 210, 240][b - 4], b === 6 ? 0.5 : 0.3);
    chant.t += 0.6;
    chant.n++;
  }
}

/** Applause: a few hundred tiny hand-claps spread over a few seconds, swelling then thinning. */
function applause(vol: number, seconds = 3.5) {
  if (!ctx) return;
  const c = ctx, t0 = c.currentTime + 0.2;
  for (let i = 0; i < seconds * 70; i++) {
    const x = Math.random(), at = t0 + x * seconds, env = Math.sin(Math.PI * Math.min(1, x * 1.15)) ** 0.6;
    const src = c.createBufferSource(), g = c.createGain(), p = c.createStereoPanner();
    src.buffer = noiseBuf;
    g.gain.setValueAtTime(vol * env * (0.4 + Math.random() * 0.6), at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.03);
    p.pan.value = Math.random() * 1.6 - 0.8;
    src.connect(filter(c, "bandpass", 1400 + Math.random() * 1600, 1.2)).connect(g).connect(p).connect(master);
    src.start(at, Math.random() * 3, 0.04);
  }
}

// Qutub Minar: an original alap in Raag Yaman on bansuri over a tanpura (Pa Sa Sa Sa), slow and spacious.
const YAMAN: [number, number][][] = [
  [[-1, 1], [2, 1], [4, 2], [2, 0.5], [4, 0.5], [6, 1.5], [4, 2.5]],
  [[4, 1], [6, 1], [7, 1], [9, 1.5], [7, 0.5], [6, 1], [4, 1], [2, 2], [0, 3]],
  [[7, 1], [9, 1], [11, 1], [12, 3], [11, 0.5], [9, 0.5], [7, 1], [6, 1], [4, 3]],
  [[11, 1], [9, 1], [7, 2], [6, 0.5], [4, 0.5], [2, 1], [-1, 1], [0, 4]],
];
const RAGA_BEAT = 0.75, SA = 293.66;
function playRaga(now: number) {
  if (weight(3) < 0.05) {
    raga.t = now + 0.2;
    raga.i = 0;
    return;
  }
  while (raga.t < now + 0.4) {
    const phrase = YAMAN[raga.i % YAMAN.length];
    let t = raga.t;
    phrase.forEach(([st, len]) => {
      voice(SA * 2 ** (st / 12), t, len * RAGA_BEAT * 0.98, { type: "sine", vol: 0.035, cutoff: 2600, attack: 0.12, vib: 5.5, out: qutubIn });
      voice(SA * 2 ** ((st + 12) / 12), t, len * RAGA_BEAT * 0.98, { type: "triangle", vol: 0.006, cutoff: 3000, attack: 0.15, vib: 5.5, out: qutubIn }); // breathy overtone
      t += len * RAGA_BEAT;
    });
    const total = t - raga.t + RAGA_BEAT * 3; // rest between phrases
    for (let k = 0; k * 1.1 < total; k++)
      voice(SA * [0.75, 0.5, 0.5, 0.25][k % 4], raga.t + k * 1.1, 2.4, { type: "sawtooth", vol: 0.012, cutoff: 1100, attack: 0.01, vib: 0.3, out: qutubIn }); // tanpura
    raga.t += total;
    raga.i++;
  }
}

// Pigeons in the Jama Masjid courtyard (the camera passes it between Chandni Chowk and Jantar Mantar).
const masjidW = () => Math.max(0, 1 - Math.abs(scrollState.chapter - 4.65) / 0.35);
function pigeons() {
  const w = masjidW();
  if (w < 0.25 || !ctx) return;
  const c = ctx, pan = Math.random() * 1.6 - 0.8;
  if (Math.random() < 0.4) {
    // a flock lifting off: fast soft wing claps
    for (let i = 0; i < 14; i++) {
      const at = c.currentTime + i * (0.05 + Math.random() * 0.04), src = c.createBufferSource(), g = c.createGain(), p = c.createStereoPanner();
      src.buffer = noiseBuf;
      g.gain.setValueAtTime(0.03 * w, at);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.06);
      p.pan.value = pan + i * 0.03;
      src.connect(filter(c, "lowpass", 1100)).connect(g).connect(p).connect(master);
      src.start(at, Math.random() * 3, 0.08);
    }
  } else {
    // coo: "croo-oo-oo"
    [[390, 0, 0.3], [430, 0.32, 0.22], [370, 0.56, 0.4]].forEach(([f, at, d]) => tone(f, d, { type: "sine", vol: 0.012 * w, at, pan, attack: 0.05, wet: 0.5 }));
  }
}

// Spoken layer per place, through the browser's speech voices. Kept quiet and spaced out.
const METRO_LINES = [
  "अगला स्टेशन राजीव चौक है। दरवाज़े बाईं ओर खुलेंगे।",
  "Next station, Rajiv Chowk. Doors will open on the left. Change here for the Blue Line.",
  "कृपया दरवाज़ों से हटकर खड़े हों।",
  "Please stand clear of the doors. Mind the gap between the train and the platform.",
  "यात्रियों से अनुरोध है कि किसी भी लावारिस वस्तु की सूचना मेट्रो कर्मचारियों को दें।",
  "Passengers are requested to report any unattended object to metro staff.",
  "यह गाड़ी समयपुर बादली तक जाएगी।",
  "This train will terminate at Samaypur Badli.",
];
const HAWKERS = [
  "आलू टिक्की, गरम गरम!", "ले लो भैया, सस्ता माल!", "दस के तीन, दस के तीन!", "आइए आइए, देखिए!",
  "पराँठे, ताज़े पराँठे!", "चूड़ियाँ ले लो, चूड़ियाँ!", "जलेबी, गरमा गरम जलेबी!", "चाय, कड़क चाय!",
  "रास्ता दो भाई, रास्ता!", "मोबाइल कवर, सौ रुपये!", "दही भल्ले, खट्टे मीठे!", "साड़ी, सूट, लहँगा, सब मिलेगा!",
];
const SLOGANS = [
  "हमारा डेटा, हमारा अधिकार!", "Privacy is a right, not a privilege!", "निजता हमारा मौलिक अधिकार है!",
  "No backdoors! No mass surveillance!", "डिजिटल आज़ादी, ज़िंदाबाद!", "Open source, open society!",
  "बैकडोर नहीं चलेगा, नहीं चलेगा!", "Encryption is not a crime!", "हम सब एक हैं!", "Secure by default, for everyone!",
];
const ANCHOR = [
  "Good morning, Delhi! Welcome to BSides Delhi 2027!",
  "Please take your seats. The opening keynote begins in five minutes.",
  "The CTF scoreboard is now live. Head to the villages hall and start hacking.",
  "Let's have a big round of applause for our volunteers!",
  "Lunch is being served on the mezzanine. Workshops resume at two P M.",
  "Our next speaker breaks hardware for a living. Please welcome them to the stage!",
  "Stay curious, share what you learn, and hack responsibly. Enjoy the conference!",
];
const SPEECH: Record<number, { lines: string[]; every: [number, number]; vol: number; random?: boolean; vary?: boolean; before?: () => void; after?: (line: string) => void }> = {
  1: { lines: METRO_LINES, every: [9, 13], vol: 0.3, before: () => [[784, 0], [659, 0.35]].forEach(([f, at]) => bell(f, { vol: 0.025, at, dur: 1.2 })) },
  4: { lines: HAWKERS, every: [2.5, 5], vol: 0.24, random: true, vary: true },
  5: { lines: SLOGANS, every: [7, 10], vol: 0.3, after: () => [190, 220].forEach((f, i) => ctx && shout(ctx.currentTime + 0.15 + i * 0.55, 0.04, f, 0.45)) },
  6: {
    lines: ANCHOR, every: [10, 14], vol: 0.32,
    before: () => [[659, 0], [880, 0.3], [1175, 0.6]].forEach(([f, at]) => bell(f, { vol: 0.02, at, dur: 1.4 })),
    after: (l) => /applause|welcome|Welcome/.test(l) && applause(0.03),
  },
};

function speak(now: number) {
  const place = Math.round(scrollState.chapter);
  if (place !== speech.place) {
    speech.place = place;
    speech.next = now + 1.5;
    if ("speechSynthesis" in window) speechSynthesis.cancel(); // never let one place talk over the next
  }
  const cfg = SPEECH[place];
  if (!cfg || now < speech.next || weight(place) < 0.6 || ("speechSynthesis" in window && speechSynthesis.speaking)) return;
  const last = speech.idx[place] ?? 0;
  const i = cfg.random ? (last + 1 + Math.floor(Math.random() * (cfg.lines.length - 1))) % cfg.lines.length : last; // random, never the same twice
  speech.idx[place] = (i + 1) % cfg.lines.length;
  const line = cfg.lines[i];
  cfg.before?.();
  say(line, /[\u0900-\u097F]/.test(line) ? "hi-IN" : "en-IN", cfg.before ? 900 : 0, {
    vol: cfg.vol,
    rate: cfg.vary ? 1 + Math.random() * 0.25 : 0.95,
    pitch: cfg.vary ? 0.8 + Math.random() * 0.5 : 1,
    place,
    onEnd: () => cfg.after?.(line),
  });
  speech.next = now + cfg.every[0] + Math.random() * (cfg.every[1] - cfg.every[0]);
}

const outdoor = () => weight(0) + weight(2) * 0.9 + weight(4) * 0.5 + weight(3) * 0.4;

function honk() {
  const pan = Math.random() * 1.6 - 0.8, vol = 0.05 * Math.min(1, outdoor()) * (0.5 + Math.random() * 0.5);
  if (Math.random() < 0.45) {
    // Auto-rickshaw: nasal, quick double "pee-peep"
    [0, 0.16].forEach((at) => tone(610 + Math.random() * 40, 0.12, { type: "sawtooth", vol, pan, at, bp: 1500 }));
  } else {
    // Car horn: two detuned squares, sometimes held, sometimes double
    const n = Math.random() < 0.4 ? 2 : 1, len = 0.18 + Math.random() * 0.45;
    for (let i = 0; i < n; i++) [415, 520].forEach((f) => tone(f, len, { type: "square", vol: vol * 0.6, pan, at: i * (len + 0.08), bp: 1100 }));
  }
}

function say(text: string, lang: string, delay: number, { vol = 0.3, rate = 0.92, pitch = 1, place = -1, onEnd }: { vol?: number; rate?: number; pitch?: number; place?: number; onEnd?: () => void } = {}) {
  if (!("speechSynthesis" in window)) return;
  setTimeout(() => {
    if (!on || (place >= 0 && Math.round(scrollState.chapter) !== place)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    u.pitch = pitch;
    u.volume = vol;
    if (onEnd) u.onend = onEnd;
    const v = speechSynthesis.getVoices().find((x) => x.lang.replace("_", "-").startsWith(lang));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }, delay);
}

/** Pneumatic door hiss: short filtered noise burst. */
function hiss(vol = 0.05) {
  if (!ctx) return;
  const c = ctx, t = c.currentTime;
  const s = c.createBufferSource(), g = c.createGain(), f = filter(c, "highpass", 2500);
  s.buffer = noiseBuf;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
  s.connect(f).connect(g).connect(master);
  s.start(t, Math.random(), 0.8);
}

// Platform events follow the train's timetable (worldState.metro), only while the camera is at the platform.
let lastPhase = "";
function metroEvents() {
  const phase = worldState.metro.phase;
  if (phase === lastPhase) return;
  lastPhase = phase;
  const near = weight(1);
  if (near < 0.4) return;
  if (phase === "arriving") {
    [[740, 0], [587, 0.32], [880, 0.64]].forEach(([f, at]) => bell(f, { vol: 0.05 * near, at, dur: 1.6 }));
    say("समयपुर बादली जाने वाली गाड़ी प्लेटफ़ॉर्म संख्या एक पर आ रही है। कृपया पीली रेखा के पीछे रहें।", "hi-IN", 1200, { place: 1 });
    say("The train for Samaypur Badli is arriving on platform one. Please stand behind the yellow line.", "en-IN", 7400, { place: 1 });
  } else if (phase === "doors-open") {
    hiss(0.06 * near);
    [[988, 0], [784, 0.25]].forEach(([f, at]) => bell(f, { vol: 0.04 * near, at, dur: 1.2 }));
  } else if (phase === "doors-closing") {
    for (let i = 0; i < 6; i++) tone(2750, 0.12, { vol: 0.03 * near, at: i * 0.28, wet: 0.1 });
    hiss(0.05 * near);
  }
}

/** One-shot effects from clicks in the 3D world. */
function onSfx(name: string) {
  if (!on) return;
  if (name === "metro-horn") [330, 415].forEach((f) => tone(f, 0.9, { type: "sawtooth", vol: 0.05, bp: 900, attack: 0.03, wet: 0.5 }));
  else if (name === "rickshaw-bell") [0, 0.12, 0.24].forEach((at) => bell(2400, { vol: 0.05, at, dur: 0.6 }));
  else if (name === "car-horn") [415, 520].forEach((f) => tone(f, 0.35, { type: "square", vol: 0.035, bp: 1100 }));
  else if (name === "auto-horn") [0, 0.16].forEach((at) => tone(620, 0.12, { type: "sawtooth", vol: 0.06, at, bp: 1500 }));
  else if (name === "flame") hiss(0.04);
  else if (name === "chime") [1319, 1568, 2093].forEach((f, i) => bell(f, { vol: 0.03, at: i * 0.12, dur: 1.8 }));
  else if (name === "flag") hiss(0.025);
  else if (name === "chant") {
    const t = ctx!.currentTime;
    [300, 340, 390].forEach((f, i) => tone(f, 0.34, { type: "sawtooth", vol: 0.06, at: i * 0.6, pan: -0.35, bp: 1600, wet: 0.35 }));
    [190, 210, 240].forEach((f, i) => shout(t + 2.4 + i * 0.6, 0.07, f, i === 2 ? 0.5 : 0.3));
  }
}

function update() {
  if (!ctx) return;
  const c = ctx, now = c.currentTime;
  beds.forEach((b) => b.gain.gain.setTargetAtTime(Math.max(0, b.level()), now, 0.25));

  // Event sounds, scheduled on simple countdowns (seconds of audio-clock time).
  const dt = Math.min(0.1, now - lastNow);
  lastNow = now;
  playMusic(now);
  if ((timers.horn -= dt) < 0) {
    timers.horn = (1.8 + Math.random() * 5) * (1 - weight(2) * 0.45); // CP: frequent honking
    if (outdoor() > 0.25) honk();
  }
  if ((timers.bell -= dt) < 0) {
    timers.bell = 2.5 + Math.random() * 5;
    if (weight(4) > 0.35) {
      const pan = Math.random() * 1.4 - 0.7;
      [0, 0.12].forEach((at) => bell(2350 + Math.random() * 200, { vol: 0.03 * weight(4), pan, at, dur: 0.6 }));
    }
  }
  if ((timers.kite -= dt) < 0) {
    timers.kite = 6 + Math.random() * 9;
    const w = weight(3) + weight(0) * 0.4;
    if (w > 0.3) [0, 0.18, 0.36].forEach((at, i) => tone(2600 - i * 180, 0.16, { vol: 0.018 * w, at, pan: 0.4, wet: 0.5 }));
  }
  // Connaught Place: traffic police whistle, bus air brakes
  if ((timers.whistle -= dt) < 0) {
    timers.whistle = 7 + Math.random() * 10;
    if (weight(2) > 0.35) [0, 0.32].forEach((at, i) => tone(2900 + i * 60, i ? 0.5 : 0.18, { vol: 0.03 * weight(2), at, pan: -0.3, wet: 0.3 }));
  }
  if ((timers.brake -= dt) < 0) {
    timers.brake = 9 + Math.random() * 12;
    if (weight(2) > 0.35) hiss(0.04 * weight(2));
  }
  playProtest(now);
  playRaga(now);
  speak(now);
  if ((timers.pigeon -= dt) < 0) {
    timers.pigeon = 2 + Math.random() * 4;
    pigeons();
  }
  const near = Math.max(0, 1 - worldState.trainDist / 45);
  if (near > 0.15 && (timers.clack -= dt) < 0) {
    timers.clack = 0.16;
    [0, 0.07].forEach((at) => tone(90 + Math.random() * 30, 0.08, { type: "triangle", vol: 0.07 * near, at, wet: 0.3 }));
  }
  // Announcement once per approach to the tunnel stop.
  metroEvents();

  raf = requestAnimationFrame(update);
}

function build() {
  const c = new AudioContext();
  ctx = c;
  master = c.createGain();
  master.gain.value = 0;
  const comp = c.createDynamicsCompressor();
  master.connect(comp).connect(c.destination);
  const conv = c.createConvolver();
  conv.buffer = impulse(c, 2.8);
  reverb = c.createGain();
  reverb.gain.value = 0.6;
  reverb.connect(conv).connect(master);

  const white = noise(c, "white"), pink = noise(c, "pink"), brown = noise(c, "brown");
  noiseBuf = white;
  beds = [];
  // City bed: low rumble of a city of 30 million
  bed(c, loop(c, brown), () => 0.32 * outdoor() + 0.08, [filter(c, "lowpass", 320)]);
  // India Gate band, on its own bus so it fades with the chapter
  musicIn = c.createGain();
  bed(c, musicIn, () => 0.45 * weight(0), [], 0.45); // landing page: a soft background, never the focus
  qutubIn = c.createGain();
  bed(c, qutubIn, () => 0.8 * weight(3), [], 0.6);
  // Distant traffic, slowly breathing (heavy around CP's rings)
  const traffic = bed(c, loop(c, pink), () => 0.06 * weight(0) + 0.2 * weight(2), [filter(c, "bandpass", 750, 0.6)]);
  // CP engines: idling diesel rumble + two-stroke auto-rickshaw putter
  const idle = c.createOscillator();
  idle.type = "sawtooth";
  idle.frequency.value = 38;
  idle.start();
  bed(c, idle, () => 0.03 * weight(2), [filter(c, "lowpass", 180)], 0.1);
  const putt = c.createOscillator(), puttAm = c.createOscillator(), puttG = c.createGain();
  putt.type = "square";
  putt.frequency.value = 92;
  puttAm.frequency.value = 23;
  puttG.gain.value = 0;
  puttAm.connect(puttG.gain);
  putt.connect(puttG);
  [putt, puttAm].forEach((o) => o.start());
  bed(c, puttG, () => 0.012 * weight(2), [filter(c, "bandpass", 300, 1.5)], 0.15);
  const lfo = c.createOscillator(), lfoG = c.createGain();
  lfo.frequency.value = 0.07;
  lfoG.gain.value = 0.04;
  lfo.connect(lfoG).connect(traffic.gain);
  lfo.start();
  // Metro tunnel rumble + hum, louder as a train passes
  const near = () => Math.max(0, 1 - worldState.trainDist / 45);
  bed(c, loop(c, brown), () => 0.35 * weight(1) + 0.5 * near() + 0.08 * weight(6), [filter(c, "lowpass", 140)], 0.3);
  const hum = c.createOscillator();
  hum.frequency.value = 50;
  hum.start();
  bed(c, hum, () => 0.03 * (weight(1) + weight(6)), [], 0);
  bed(c, loop(c, white), () => 0.14 * near() ** 2, [filter(c, "bandpass", 1300, 0.5)], 0.4);
  // Chandni Chowk crowd: three formant bands with jittery gain = babble
  [420, 950, 1700].forEach((f, i) => {
    const g = bed(c, loop(c, pink), () => (0.12 - i * 0.025) * weight(4), [filter(c, "bandpass", f, 2.2)], 0.25);
    const j = c.createOscillator(), jg = c.createGain();
    j.type = "triangle";
    j.frequency.value = 3.1 + i * 1.7;
    jg.gain.value = 0.025;
    j.connect(jg).connect(g.gain);
    j.start();
  });
  // Wind high up at Qutub
  const windF = filter(c, "bandpass", 500, 1.2);
  bed(c, loop(c, white), () => 0.07 * weight(3), [windF], 0.3);
  const wl = c.createOscillator(), wg = c.createGain();
  wl.frequency.value = 0.11;
  wg.gain.value = 260;
  wl.connect(wg).connect(windF.frequency);
  wl.start();
  // Jantar Mantar crowd murmur and the event hall's buzz: same jittery formant babble, different rooms
  [[380, 0.07, 5], [880, 0.05, 5], [520, 0.05, 6], [1300, 0.03, 6]].forEach(([f, v, ch], i) => {
    const g = bed(c, loop(c, pink), () => v * weight(ch), [filter(c, "bandpass", f, 2)], ch === 6 ? 0.5 : 0.25);
    const j = c.createOscillator(), jg = c.createGain();
    j.type = "triangle";
    j.frequency.value = 2.3 + i * 1.3;
    jg.gain.value = v * 0.3;
    j.connect(jg).connect(g.gain);
    j.start();
  });
  // Scroll whoosh: bandpassed noise driven by scroll speed
  const whooshF = filter(c, "bandpass", 700, 0.8);
  bed(c, loop(c, white), () => {
    const v = Math.min(1, Math.abs(scrollState.velocity) * 1.2);
    whooshF.frequency.setTargetAtTime(500 + v * 1600, c.currentTime, 0.1);
    return v * v * 0.12;
  }, [whooshF], 0.2);

  // UI: hover ticks, AFC-gate beep on buttons, flag fanfare, Konami glitch.
  let lastTick = 0;
  document.addEventListener("pointerover", (e) => {
    const el = (e.target as HTMLElement).closest("a,button");
    if (!on || !el || performance.now() - lastTick < 60) return;
    lastTick = performance.now();
    tone(1900, 0.035, { vol: 0.02, wet: 0 });
  });
  document.addEventListener("click", (e) => {
    if (!on || !(e.target as HTMLElement).closest("a,button")) return;
    tone(1250, 0.07, { vol: 0.035, wet: 0.05 });
    tone(1850, 0.09, { vol: 0.035, wet: 0.05, at: 0.08 });
  });
  noiseBuf = white;
  window.addEventListener("neo:sfx", (e) => onSfx((e as CustomEvent<string>).detail));
  window.addEventListener("neo:glitch", () => {
    if (!on) return;
    for (let i = 0; i < 14; i++) tone(200 + Math.random() * 2400, 0.05, { type: "square", vol: 0.03, at: i * 0.05, wet: 0 });
  });
  useFlags.subscribe((s, prev) => {
    if (on && s.found.length > prev.found.length) [1047, 1319, 1568, 2093].forEach((f, i) => bell(f, { vol: 0.04, at: i * 0.09, dur: 1.4 }));
  });
}

export async function setSound(enabled: boolean) {
  on = enabled;
  if (enabled) {
    if (!ctx) build();
    await ctx!.resume();
    master.gain.setTargetAtTime(0.6, ctx!.currentTime, 0.6);
    cancelAnimationFrame(raf);
    lastNow = ctx!.currentTime;
    raf = requestAnimationFrame(update);
  } else if (ctx) {
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    setTimeout(() => !on && ctx?.suspend(), 600);
    cancelAnimationFrame(raf);
  }
}
