// Self-check: the scroll camera must never pass through a monument. Run: node scripts/check-camera-path.ts
// Margin covers the handheld sway + mouse parallax the Rig adds on top of the path (≈ ±0.9 units).
import { posCurve, PLACES } from "../src/components/three/path.ts";

const M = 0.9;
const problems: string[] = [];
let minLaneY = Infinity, maxLaneY = -Infinity;

for (let i = 0; i <= 4000; i++) {
  const { x, y, z } = posCurve.getPoint(i / 4000);
  const at = `z=${z.toFixed(1)} x=${x.toFixed(2)} y=${y.toFixed(2)}`;
  // India Gate main arch: opening |x| < 2.6, intrados apex 12.
  if (Math.abs(z) < 2.9 && (Math.abs(x) > 2.6 - M || y > 11.5)) problems.push(`India Gate arch: ${at}`);
  // Metro: bores are a horseshoe (centre x 0.5, spring 2.6, radius 4); station box has platform (top 1.1, edge 0.6),
  // screen doors (x 0.45, top 2.4), ceiling 5.5, columns at x -4.2, hanging signs (bottom 4.4) and the escalator (x < -5.1).
  const inBore = (z <= -26 && z > -52) || (z <= -138 && z > -150);
  const inHall = z <= -52 && z > -138;
  if (inBore && (Math.hypot(x - 0.5, Math.max(0, y - 2.6)) > 4 - M || y > 5.2)) problems.push(`Metro bore: ${at}`);
  if (inHall) {
    if (x > 0.45 - M * 0.5 || x < -7 + M || y > 5.5 - 0.5 || y < 1.1 + 1.0 || x < -5.1 + M) problems.push(`Metro hall: ${at}`);
    if ([-58, -69, -80, -91, -102, -113, -124, -135].some((cz) => Math.hypot(x + 4.2, z - cz) < 0.65 + M)) problems.push(`Metro column: ${at}`);
    if ([-88, -108, -128].some((hz) => Math.abs(z - hz) < 0.3) && y > 4.4 - 0.4) problems.push(`Metro hanging sign: ${at}`);
  }
  // CP flag mast
  if (Math.hypot(x - PLACES.cp[0], z - PLACES.cp[2]) < 1.2 + M) problems.push(`CP flag mast: ${at}`);
  // Qutub Minar incl. lowest balcony
  if (Math.hypot(x - PLACES.qutub[0], z - PLACES.qutub[2]) < 5.4 + M && y < 41) problems.push(`Qutub Minar: ${at}`);
  // Chandni Chowk lane: balconies reach |x| = 2.6, stalls 2.7
  if (z < PLACES.chowk.start && z > PLACES.chowk.end) {
    if (Math.abs(x) > 2.4 - M) problems.push(`Chandni Chowk facades: ${at}`);
    minLaneY = Math.min(minLaneY, y);
    maxLaneY = Math.max(maxLaneY, y);
  }
  // Jama Masjid: left minaret (with balconies, r 1.45) and the hall/plinth from x = masjid.x - 15
  const [mx, , mz] = PLACES.masjid;
  if (Math.hypot(x - (mx - 12.5), z - (mz - 9)) < 1.45 + M) problems.push(`Jama Masjid minaret: ${at}`);
  if (z < mz + 1 && z > mz - 25 && x > mx - 15 - M && y < 26) problems.push(`Jama Masjid: ${at}`);
  // Qutub ruins (second arch at qutub + (15, -9), ~4 wide each side)
  if (Math.hypot(x - PLACES.qutub[0] - 15, z - PLACES.qutub[2] + 9) < 4.5 + M && y < 12.5) problems.push(`Qutub ruin: ${at}`);
  // Jantar Mantar instruments (Samrat Yantra 10.5 high) and the protest stage
  if (Math.hypot(x + 22.2, z + 503.3) < 13 && y < 12) problems.push(`Jantar Mantar (Samrat Yantra): ${at}`);
  if (Math.hypot(x + 21, z + 477.7) < 5 && y < 4) problems.push(`Jantar Mantar (stage): ${at}`);
}

console.log(`Chandni Chowk camera height: ${minLaneY.toFixed(2)}–${maxLaneY.toFixed(2)} (lowest wire sag ≈ 4.5)`);
if (problems.length) {
  console.error(`✗ ${problems.length} collision samples. First few:\n  ` + [...new Set(problems.map((p) => p.split(":")[0]))].map((k) => problems.find((p) => p.startsWith(k))).join("\n  "));
  process.exit(1);
}
console.log("✓ camera path clears every monument");
