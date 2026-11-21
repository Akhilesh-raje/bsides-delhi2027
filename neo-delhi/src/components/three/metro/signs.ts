import * as THREE from "three";
import { EVENT } from "@/lib/content";
import { NEON } from "../util";

// Canvas-drawn signage in the visual language of Delhi Metro boards (bilingual, Hindi first), without the DMRC logo.

const HI = '"Nirmala UI", "Noto Sans Devanagari", "Mangal", sans-serif';
const EN = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';

function canvas(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Simple pictogram: walking person (exit), arrow, etc. */
function arrow(g: CanvasRenderingContext2D, x: number, y: number, s: number, dir: "left" | "right" | "up") {
  g.save();
  g.translate(x, y);
  g.rotate(dir === "left" ? Math.PI : dir === "up" ? -Math.PI / 2 : 0);
  g.beginPath();
  g.moveTo(-s * 0.5, -s * 0.12);
  g.lineTo(s * 0.1, -s * 0.12);
  g.lineTo(s * 0.1, -s * 0.38);
  g.lineTo(s * 0.5, 0);
  g.lineTo(s * 0.1, s * 0.38);
  g.lineTo(s * 0.1, s * 0.12);
  g.lineTo(-s * 0.5, s * 0.12);
  g.closePath();
  g.fill();
  g.restore();
}

function runner(g: CanvasRenderingContext2D, x: number, y: number, s: number) {
  g.save();
  g.translate(x, y);
  g.lineCap = "round";
  g.lineWidth = s * 0.13;
  g.beginPath();
  g.arc(s * 0.12, -s * 0.42, s * 0.1, 0, 7);
  g.fill();
  g.beginPath();
  g.moveTo(0, -s * 0.25);
  g.lineTo(-s * 0.08, s * 0.08);
  g.lineTo(s * 0.18, s * 0.42);
  g.moveTo(-s * 0.08, s * 0.08);
  g.lineTo(-s * 0.3, s * 0.4);
  g.moveTo(-s * 0.02, -s * 0.18);
  g.lineTo(s * 0.25, -s * 0.02);
  g.moveTo(-s * 0.02, -s * 0.18);
  g.lineTo(-s * 0.3, -s * 0.08);
  g.stroke();
  g.restore();
}

/** Station name board: white Hindi + English on dark navy with a thin crimson rule. */
export const stationBoard = () =>
  canvas(1024, 256, (g) => {
    g.fillStyle = "#101826";
    g.fillRect(0, 0, 1024, 256);
    g.fillStyle = NEON;
    g.fillRect(0, 236, 1024, 8);
    g.fillStyle = "#fff";
    g.textAlign = "center";
    g.font = `bold 92px ${HI}`;
    g.fillText("राजीव चौक", 512, 112);
    g.font = `600 64px ${EN}`;
    g.fillText("Rajiv Chowk", 512, 200);
  });

/** Hanging direction sign: platform number, destination, exit. */
export const directionBoard = (kind: "platform" | "exit") =>
  canvas(1024, 256, (g) => {
    g.fillStyle = "#0d0e10";
    g.fillRect(0, 0, 1024, 256);
    g.fillStyle = "#fff";
    if (kind === "platform") {
      g.fillStyle = "#f2c300";
      g.beginPath();
      g.arc(110, 128, 74, 0, 7);
      g.fill();
      g.fillStyle = "#111";
      g.font = `bold 110px ${EN}`;
      g.textAlign = "center";
      g.fillText("1", 110, 166);
      g.fillStyle = "#fff";
      g.textAlign = "left";
      g.font = `bold 66px ${HI}`;
      g.fillText("समयपुर बादली", 220, 112);
      g.font = `500 50px ${EN}`;
      g.fillText("Samaypur Badli", 220, 186);
      arrow(g, 930, 128, 120, "left");
    } else {
      g.fillStyle = "#14a04a";
      g.fillRect(24, 24, 208, 208);
      g.fillStyle = "#fff";
      runner(g, 128, 140, 170);
      g.textAlign = "left";
      g.font = `bold 72px ${HI}`;
      g.fillText("निकास", 270, 112);
      g.font = `600 56px ${EN}`;
      g.fillText("Way Out · Gate 1–4", 270, 190);
      arrow(g, 930, 128, 120, "up");
    }
  });

/** Lit green emergency exit sign. */
export const exitSign = () =>
  canvas(512, 192, (g) => {
    g.fillStyle = "#0fa04a";
    g.fillRect(0, 0, 512, 192);
    g.fillStyle = "#fff";
    runner(g, 90, 110, 130);
    g.font = `bold 58px ${HI}`;
    g.fillText("निकास", 180, 90);
    g.font = `bold 54px ${EN}`;
    g.fillText("EXIT", 180, 160);
    arrow(g, 440, 96, 90, "up");
  });

/** Safety notices mounted on columns. */
export const notice = (kind: "line" | "smoke" | "help") =>
  canvas(384, 512, (g) => {
    g.fillStyle = "#f4f1ea";
    g.fillRect(0, 0, 384, 512);
    g.textAlign = "center";
    if (kind === "line") {
      g.fillStyle = "#f2c300";
      g.fillRect(0, 0, 384, 150);
      g.fillStyle = "#111";
      g.fillRect(40, 70, 304, 14);
      runner(g, 192, 60, 60);
    } else if (kind === "smoke") {
      g.strokeStyle = "#c8102e";
      g.lineWidth = 18;
      g.beginPath();
      g.arc(192, 90, 64, 0, 7);
      g.moveTo(147, 45);
      g.lineTo(237, 135);
      g.stroke();
      g.fillStyle = "#222";
      g.fillRect(140, 84, 90, 14);
    } else {
      g.fillStyle = "#1d4fa0";
      g.fillRect(0, 0, 384, 150);
      g.fillStyle = "#fff";
      g.font = `bold 96px ${EN}`;
      g.fillText("?", 192, 112);
    }
    g.fillStyle = "#111";
    const [hi, en] =
      kind === "line" ? ["कृपया पीली रेखा के", "Please stand behind"] : kind === "smoke" ? ["धूम्रपान निषेध", "No smoking"] : ["सहायता केंद्र", "Help point"];
    const [hi2, en2] = kind === "line" ? ["पीछे खड़े रहें", "the yellow line"] : kind === "smoke" ? ["", "Fine ₹200"] : ["बटन दबाएँ", "Press to talk"];
    g.font = `bold 40px ${HI}`;
    g.fillText(hi, 192, 230);
    if (hi2) g.fillText(hi2, 192, 280);
    g.font = `500 34px ${EN}`;
    g.fillText(en, 192, 360);
    g.fillText(en2, 192, 404);
  });

/** Floor decal at each platform door: boarding lanes either side, alighting lane in the middle (as painted in Delhi). */
export const doorDecal = () =>
  canvas(512, 512, (g) => {
    g.clearRect(0, 0, 512, 512);
    g.fillStyle = "rgba(242,195,0,0.9)";
    g.fillRect(0, 0, 512, 18);
    [80, 432].forEach((x) => {
      g.fillStyle = "rgba(30,170,90,0.85)";
      arrow(g, x, 260, 150, "up");
    });
    g.fillStyle = "rgba(220,30,40,0.85)";
    g.save();
    g.translate(256, 260);
    g.rotate(Math.PI / 2);
    arrow(g, 0, 0, 150, "right");
    g.restore();
    g.fillStyle = "rgba(255,255,255,0.85)";
    g.font = `bold 34px ${EN}`;
    g.textAlign = "center";
    g.fillText("MIND THE GAP", 256, 470);
  });

/** Event poster: monument photo (from the reference art) with a crimson BSides band. */
export function posterTexture(img: HTMLImageElement, title: string, sub: string) {
  return canvas(768, 1024, (g) => {
    g.fillStyle = "#0a0a0c";
    g.fillRect(0, 0, 768, 1024);
    const s = Math.max(768 / img.width, 760 / img.height);
    g.drawImage(img, (768 - img.width * s) / 2, 0, img.width * s, img.height * s);
    const grd = g.createLinearGradient(0, 560, 0, 800);
    grd.addColorStop(0, "rgba(10,10,12,0)");
    grd.addColorStop(1, "rgba(10,10,12,1)");
    g.fillStyle = grd;
    g.fillRect(0, 560, 768, 240);
    g.fillStyle = "#0a0a0c";
    g.fillRect(0, 800, 768, 224);
    g.fillStyle = NEON;
    g.fillRect(48, 52, 120, 6);
    g.font = `600 30px ${EN}`;
    g.fillStyle = "#fff";
    g.fillText("BSIDES DELHI 2027", 48, 104);
    g.font = `bold 62px ${EN}`;
    g.fillStyle = "#fff";
    g.fillText(title, 48, 870, 672);
    g.font = `500 34px ${EN}`;
    g.fillStyle = "#ff5a6a";
    g.fillText(sub, 48, 930, 672);
    g.font = `400 26px ${EN}`;
    g.fillStyle = "#9a9aa0";
    g.fillText(`${EVENT.dates} · ${EVENT.city}`, 48, 980, 672);
  });
}

/** Interior strip map above the train windows (stylised Yellow Line). */
export const lineStrip = () =>
  canvas(1024, 64, (g) => {
    g.fillStyle = "#f4f1ea";
    g.fillRect(0, 0, 1024, 64);
    g.fillStyle = "#f2c300";
    g.fillRect(20, 26, 984, 12);
    for (let i = 0; i < 12; i++) {
      g.fillStyle = i === 6 ? NEON : "#fff";
      g.strokeStyle = "#222";
      g.lineWidth = 3;
      g.beginPath();
      g.arc(40 + i * 86, 32, 10, 0, 7);
      g.fill();
      g.stroke();
    }
  });

/** Small round "M" roundel used on columns (generic, not the DMRC logo). */
export const columnBoard = () =>
  canvas(256, 768, (g) => {
    g.fillStyle = "#101826";
    g.fillRect(0, 0, 256, 768);
    g.fillStyle = "#fff";
    g.textAlign = "center";
    g.font = `bold 64px ${HI}`;
    ["रा", "जी", "व", "चौ", "क"].forEach((c, i) => g.fillText(c, 128, 110 + i * 92));
    g.fillStyle = NEON;
    g.fillRect(40, 600, 176, 6);
    g.font = `600 34px ${EN}`;
    g.fillStyle = "#fff";
    g.fillText("RAJIV", 128, 670);
    g.fillText("CHOWK", 128, 716);
  });

/** Repainted live: destination LED board on the train front (amber dot-matrix look). */
export function ledBoard() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 96;
  const g = c.getContext("2d")!;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const draw = (text: string, hindi: boolean) => {
    g.fillStyle = "#080402";
    g.fillRect(0, 0, 512, 96);
    g.fillStyle = "#ff8a1a";
    g.textAlign = "center";
    g.font = hindi ? `bold 58px ${HI}` : `bold 54px ui-monospace, Consolas, monospace`;
    g.fillText(text, 256, 68);
    // dot-matrix grid
    g.fillStyle = "rgba(0,0,0,0.45)";
    for (let x = 0; x < 512; x += 4) g.fillRect(x, 0, 1, 96);
    for (let y = 0; y < 96; y += 4) g.fillRect(0, y, 512, 1);
    tex.needsUpdate = true;
  };
  return { tex, draw };
}

/** Directory board listing the site's sections; rows are clickable in the scene. */
export const DIRECTORY = [
  ["Speakers", "speakers"],
  ["Agenda", "agenda"],
  ["CTF Arena", "villages"],
  ["Tickets", "tickets"],
] as const;
export const directoryBoard = () =>
  canvas(512, 320, (g) => {
    g.fillStyle = "#0c0c0e";
    g.fillRect(0, 0, 512, 320);
    g.strokeStyle = NEON;
    g.lineWidth = 4;
    g.strokeRect(6, 6, 500, 308);
    DIRECTORY.forEach(([label], i) => {
      const y = 60 + i * 70;
      g.fillStyle = NEON;
      g.fillRect(30, y - 26, 34, 34);
      g.fillStyle = "#f2f2f2";
      g.font = `600 36px ${EN}`;
      g.textAlign = "left";
      g.fillText(label, 84, y);
      g.fillStyle = NEON;
      g.fillText("→", 440, y);
    });
  });

/** Platform PIDS (amber LED), repainted live from the timetable. */
export function pidsBoard() {
  const c = document.createElement("canvas");
  c.width = 768;
  c.height = 256;
  const g = c.getContext("2d")!;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const draw = (phase: string, countdown: number, hindi: boolean) => {
    g.fillStyle = "#050302";
    g.fillRect(0, 0, 768, 256);
    g.fillStyle = "#ffae1a";
    g.textAlign = "left";
    g.font = hindi ? `bold 56px ${HI}` : 'bold 52px ui-monospace, Consolas, monospace';
    g.fillText(hindi ? "1  समयपुर बादली" : "1  SAMAYPUR BADLI", 28, 76);
    const mins = Math.floor(countdown / 60), secs = String(Math.floor(countdown % 60)).padStart(2, "0");
    const status =
      phase === "away" || (phase === "arriving" && countdown > 8)
        ? hindi ? `आगमन ${mins}:${secs}` : `ARRIVING ${mins}:${secs}`
        : phase === "arriving" ? (hindi ? "गाड़ी आ रही है" : "ARRIVING NOW")
        : phase === "doors-open" ? (hindi ? "गाड़ी प्लेटफॉर्म पर" : "TRAIN AT PLATFORM")
        : phase === "doors-closing" ? (hindi ? "दरवाज़े बंद हो रहे हैं" : "DOORS CLOSING")
        : hindi ? "प्रस्थान" : "DEPARTED";
    g.fillStyle = phase === "doors-closing" ? "#ff4a2a" : "#ffae1a";
    g.font = hindi ? `bold 56px ${HI}` : 'bold 52px ui-monospace, Consolas, monospace';
    g.fillText(status, 28, 156);
    g.fillStyle = "#c98a14";
    g.font = '36px ui-monospace, Consolas, monospace';
    g.fillText(`${new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata" })} IST`, 28, 226);
    g.textAlign = "right";
    g.font = `36px ${hindi ? HI : EN}`;
    g.fillText(hindi ? "प्लेटफॉर्म 1" : "Platform 1", 740, 226);
    g.fillStyle = "rgba(0,0,0,0.4)";
    for (let x = 0; x < 768; x += 4) g.fillRect(x, 0, 1, 256);
    for (let y = 0; y < 256; y += 4) g.fillRect(0, y, 768, 1);
    tex.needsUpdate = true;
  };
  return { tex, draw };
}

/** Vertical dark gradient (opaque at the bottom) used as a cheap contact-shadow / ambient-occlusion strip. */
export const aoGradient = () =>
  canvas(16, 128, (g) => {
    const grd = g.createLinearGradient(0, 128, 0, 0);
    grd.addColorStop(0, "rgba(0,0,0,0.75)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 16, 128);
  }, false);

/** Delhi mural for the back wall: bilingual title and a crimson line-art skyline. */
export const muralBoard = () =>
  canvas(1024, 448, (g) => {
    g.fillStyle = "#16161a";
    g.fillRect(0, 0, 1024, 448);
    g.fillStyle = "#f2f2f2";
    g.textAlign = "center";
    g.font = `bold 104px ${HI}`;
    g.fillText("दिल्ली मेट्रो", 512, 150);
    g.font = `600 52px ${EN}`;
    g.fillText("Delhi Metro · Rajiv Chowk", 512, 220);
    g.strokeStyle = NEON;
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(40, 420);
    [[120, 420], [120, 360], [130, 330], [136, 260], [142, 330], [152, 360], [152, 420], [240, 420], [240, 350], [262, 350], [262, 370], [272, 370], [272, 350], [294, 350], [294, 420], [400, 420], [430, 380], [450, 400], [470, 370], [490, 400], [510, 380], [540, 420], [640, 420], [640, 390], [670, 360], [700, 390], [700, 420], [780, 420], [780, 400], [800, 400], [800, 370], [810, 400], [830, 400], [830, 420], [990, 420]].forEach(([x, y]) => g.lineTo(x, y));
    g.stroke();
  });
