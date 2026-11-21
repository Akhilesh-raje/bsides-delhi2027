/**
 * Neo-Delhi 3D Cybersecurity Conference
 * Public Signal Metadata & ARG Telemetry
 *
 * Defines the 6 cryptographic signals and transmission beacons hidden
 * across the 6 journey chapters of the Neo-Delhi 3D experience.
 *
 * Chapter Progress Alignment:
 * 1. India Gate: Progress 0.00 - 0.10 (Signal #1: Amar Jawan Beacon)
 * 2. Kartavya Path: Progress 0.10 - 0.28 (Signal #2: Mesh Lamppost Leak)
 * 3. Central Secretariat: Progress 0.28 - 0.45 (Signal #3: AFC Smart Token Entropy)
 * 4. Train Ride Yellow Line: Progress 0.45 - 0.62 (Signal #4: TCMS CAN-Bus Anomaly)
 * 5. Rajiv Chowk: Progress 0.62 - 0.80 (Signal #5: Subterranean Palika Broadcast)
 * 6. Skyline: Progress 0.80 - 1.00 (Signal #6: LEO Cubesat Orbital Downlink)
 *
 * NOTE: Plaintext solution flags are NOT stored in client bundles.
 * Flags are cryptographically validated server-side via /api/signals/verify.
 */

export type SignalCategory =
  | "RF"
  | "Crypto"
  | "Stego"
  | "Hardware"
  | "Network"
  | "Satellite";

export type SignalDifficulty = "Easy" | "Medium" | "Hard" | "Insane";

export interface Signal {
  id: string;
  number: 1 | 2 | 3 | 4 | 5 | 6;
  name: string;
  codename: string;
  chapterIndex: 1 | 2 | 3 | 4 | 5 | 6;
  chapterName: string;
  progressRange: [number, number];
  coordinates: [number, number, number];
  frequency: string;
  modulation: string;
  category: SignalCategory;
  difficulty: SignalDifficulty;
  points: number;
  badgeName: string;
  hint: string;
  transmissionSnippet: string;
  description: string;
  verificationEndpoint: string;
}

export const SIGNALS: Signal[] = [
  // ==========================================
  // SIGNAL #1: INDIA GATE (0.00 - 0.10)
  // ==========================================
  {
    id: "signal-01",
    number: 1,
    name: "Amar Jawan Eternal Telemetry",
    codename: "SIGNAL_AMAR_JAWAN",
    chapterIndex: 1,
    chapterName: "India Gate",
    progressRange: [0.00, 0.10],
    coordinates: [0, 1.2, 5],
    frequency: "142.850 MHz VHF",
    modulation: "CW / Continuous Wave (Morse)",
    category: "RF",
    difficulty: "Easy",
    points: 100,
    badgeName: "Eternal Flame Sentinel",
    hint: "The eternal plasma flame pulsates with audio pulses. Listen closely to the carrier frequency and decode the dots and dashes.",
    transmissionSnippet: ".-. --- --- - -.. . .-.. .... .. ...-- -.. ..--- ----- ..--- --...",
    description:
      "A rhythmic low-frequency RF carrier wave emanating from the base of the Amar Jawan Jyoti memorial plinth. The continuous Morse transmission carries the initial credentials of the Neo-Delhi mesh foundation.",
    verificationEndpoint: "/api/signals/verify",
  },

  // ==========================================
  // SIGNAL #2: KARTAVYA PATH (0.10 - 0.28)
  // ==========================================
  {
    id: "signal-02",
    number: 2,
    name: "Kartavya IoT Mesh Node #KP-404",
    codename: "SIGNAL_KARTAVYA_LEAK",
    chapterIndex: 2,
    chapterName: "Kartavya Path",
    progressRange: [0.10, 0.28],
    coordinates: [9, 4, -80],
    frequency: "2.412 GHz (Wi-Fi Ch 1 / 802.15.4)",
    modulation: "OFDM / DSSS Beacon Frame",
    category: "Network",
    difficulty: "Medium",
    points: 250,
    badgeName: "Boulevard Sniffer",
    hint: "An unsecured debug beacon is broadcasted by lamppost KP-404. Inspect the 802.11 Information Elements (IE) in the beacon frame.",
    transmissionSnippet: "SSID: ND_MESH_KP404 // BSSID: 02:42:AC:11:00:02 // VENDOR_IE: 0x7b226b6579223a226b617274617679615f706174685f6e6f64655f3032227d",
    description:
      "A municipal smart-lighting node running an unauthenticated debug interface. The beacon frames leak hex-encoded JSON metadata identifying the second stage key for the boulevard mesh.",
    verificationEndpoint: "/api/signals/verify",
  },

  // ==========================================
  // SIGNAL #3: CENTRAL SECRETARIAT METRO (0.28 - 0.45)
  // ==========================================
  {
    id: "signal-03",
    number: 3,
    name: "Central Secretariat AFC DESFire Challenge",
    codename: "SIGNAL_CENTRAL_SEC_AFC",
    chapterIndex: 3,
    chapterName: "Central Secretariat",
    progressRange: [0.28, 0.45],
    coordinates: [-8, 2, -175],
    frequency: "13.56 MHz HF (NFC-A / ISO 14443-4)",
    modulation: "ASK 100% Modified Miller",
    category: "Hardware",
    difficulty: "Medium",
    points: 350,
    badgeName: "Turnstile Phantom",
    hint: "The token dispenser runs an automated key exchange. Look for the nonce leak in the second mutual authentication frame (APDU 0xAA).",
    transmissionSnippet: "CLA:00 INS:AA P1:00 P2:00 Lc:10 DATA: 3F A1 9C 02 D4 88 E1 7B 49 11 00 C4 FE 29 8A 61",
    description:
      "DMRC Automatic Fare Collection smart token dispenser. By intercepting the contactless smart token mutual authentication handshake, attackers can recover a static cryptographic IV used across the Yellow Line network.",
    verificationEndpoint: "/api/signals/verify",
  },

  // ==========================================
  // SIGNAL #4: TRAIN RIDE ON YELLOW LINE (0.45 - 0.62)
  // ==========================================
  {
    id: "signal-04",
    number: 4,
    name: "DMRC Yellow Line TCMS CAN-Bus Glitch",
    codename: "SIGNAL_YELLOW_LINE_GLITCH",
    chapterIndex: 4,
    chapterName: "Yellow Line Transit",
    progressRange: [0.45, 0.62],
    coordinates: [1.8, 2.2, -220],
    frequency: "500 kbps Differential ISO 11898",
    modulation: "NRZ / Two-wire Balanced CAN",
    category: "Crypto",
    difficulty: "Hard",
    points: 500,
    badgeName: "Subway Conductor",
    hint: "Pulling the train's emergency brake lever causes a burst of high-priority arbitration IDs (0x102). Reconstruct the CAN payload byte array.",
    transmissionSnippet: "CAN_ID: 0x102 [DLC: 8] 4E 45 4F 5F 44 45 4C 48 // CAN_ID: 0x103 [DLC: 8] 49 5F 54 52 41 49 4E 5F",
    description:
      "An illicit diagnostic harness wired into the Bombardier MOVIA carriage's Train Control & Management System (TCMS). Inducing an emergency stop causes the train to dump its internal arbitration bus frames containing flag fragments.",
    verificationEndpoint: "/api/signals/verify",
  },

  // ==========================================
  // SIGNAL #5: RAJIV CHOWK / CONNAUGHT PLACE (0.62 - 0.80)
  // ==========================================
  {
    id: "signal-05",
    number: 5,
    name: "Palika Subterranean Hardware Beacon",
    codename: "SIGNAL_PALIKA_UNDERGROUND",
    chapterIndex: 5,
    chapterName: "Rajiv Chowk",
    progressRange: [0.62, 0.80],
    coordinates: [-14, 1.5, -305],
    frequency: "868.100 MHz EU/IN ISM (LoRa)",
    modulation: "Chirp Spread Spectrum (CSS) SF12 / BW 125kHz",
    category: "Stego",
    difficulty: "Hard",
    points: 600,
    badgeName: "Palika Shadow Hacker",
    hint: "The hardware hacking village broadcasts long-range chirp packets. Hidden inside the audio spectrogram of the chirp waveform is an ASCII image.",
    transmissionSnippet: "LORA_PKT: [RSSI: -112dBm SNR: -4.5dB] 50 41 4C 49 4B 41 5F 53 55 42 54 45 52 52 41 4E 45 41 4E 5F 30 35",
    description:
      "Deep inside the underground concentric tunnels of Connaught Place, an unauthorized LoRa gateway transmits chirp-modulated packets. Extracting the spectral waterfall reveals an embedded ASCII matrix key.",
    verificationEndpoint: "/api/signals/verify",
  },

  // ==========================================
  // SIGNAL #6: SKYLINE (0.80 - 1.00)
  // ==========================================
  {
    id: "signal-06",
    number: 6,
    name: "Neo-Delhi Orbital Cubesat Downlink",
    codename: "SIGNAL_ORBITAL_DOWNLINK_FINAL",
    chapterIndex: 6,
    chapterName: "Skyline",
    progressRange: [0.80, 1.00],
    coordinates: [8, 48, -420],
    frequency: "10.450 GHz X-Band",
    modulation: "QPSK / DVB-S2 LDPC Encoded",
    category: "Satellite",
    difficulty: "Insane",
    points: 1000,
    badgeName: "Master of Neo-Delhi Cyberspace",
    hint: "Connect with the rooftop ground station phased array when the LEO satellite pass peaks above 45 degrees elevation. Combine the keys from all previous 5 signals to decipher the master orbital stream.",
    transmissionSnippet: "SAT_TLE: 1 99999U 27001A 27044.52083333 .00001234 00000-0 12345-4 0 9991 // PAYLOAD_HASH: 7a9e3b88...[COMBINE_ALL_5_KEYS]",
    description:
      "The pinnacle ARG challenge of BSides Delhi 2027. A low-earth-orbit research cubesat passes directly over the Delhi meridian, transmitting an encrypted ephemeris telemetry stream. Decrypting it yields the grand champion flag and unlocks the master summit trophy.",
    verificationEndpoint: "/api/signals/verify",
  },
];

/** Retrieve all 6 signals */
export function getAllSignals(): Signal[] {
  return SIGNALS;
}

/** Retrieve signal by its 1-indexed number (1 to 6) */
export function getSignalByNumber(num: number): Signal | undefined {
  return SIGNALS.find((s) => s.number === num);
}

/** Retrieve signal by unique ID */
export function getSignalById(id: string): Signal | undefined {
  return SIGNALS.find((s) => s.id === id);
}

/** Retrieve all signals located within a given journey chapter */
export function getSignalsForChapter(chapterIndex: 1 | 2 | 3 | 4 | 5 | 6): Signal[] {
  return SIGNALS.filter((s) => s.chapterIndex === chapterIndex);
}

/** Total cumulative points available across all signals */
export function getTotalSignalPoints(): number {
  return SIGNALS.reduce((acc, s) => acc + s.points, 0);
}
