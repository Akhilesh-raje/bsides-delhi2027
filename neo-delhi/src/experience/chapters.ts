import { DESIGN_TOKENS, type ChapterId } from './store';

export interface CameraWaypoint {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export interface ChapterConfig {
  id: ChapterId;
  index: number;
  title: string;
  subtitle: string;
  codename: string;
  description: string;
  scrollRange: [number, number]; // [start, end] normalized to 0.0 - 1.0
  camera: {
    start: CameraWaypoint;
    end: CameraWaypoint;
  };
  spatialCenter: [number, number, number]; // World coordinate anchor
  atmosphere: {
    fogNear: number;
    fogFar: number;
    fogColor: string;
    ambientColor: string;
    ambientIntensity: number;
    accentColor: string;
    glowColor: string;
  };
  cybersecurityFocus: string;
  keyThemes: string[];
  coordinates: {
    lat: number;
    lng: number;
    locationName: string;
  };
}

export const CHAPTERS: readonly ChapterConfig[] = [
  {
    id: 'india-gate',
    index: 0,
    title: 'India Gate',
    subtitle: 'Perimeter Monolith & Sentinel Gate',
    codename: 'OP_AMAR_JAWAN',
    description:
      'The ceremonial threshold of Neo-Delhi. A 42-meter triumphal stone cyber-fortress fitted with high-frequency laser scans and zero-trust perimeter sentinels.',
    scrollRange: [0.0, 0.1],
    spatialCenter: [0, 0, 0],
    camera: {
      start: {
        position: [0, 5, 50],
        target: [0, 18, 0],
        fov: 52,
      },
      end: {
        position: [0, 10, 22],
        target: [0, 22, 0],
        fov: 48,
      },
    },
    atmosphere: {
      fogNear: 15,
      fogFar: 140,
      fogColor: DESIGN_TOKENS.obsidian,
      ambientColor: DESIGN_TOKENS.surface,
      ambientIntensity: 0.45,
      accentColor: DESIGN_TOKENS.signal,
      glowColor: DESIGN_TOKENS.crimson,
    },
    cybersecurityFocus: 'Perimeter Defense, Zero-Trust Architecture, & Physical Security Matrix',
    keyThemes: ['Perimeter Firewall', 'Hardware Security Modules', 'Identity Verification', 'National Gateway'],
    coordinates: {
      lat: 28.6129,
      lng: 77.2295,
      locationName: 'Kartavya Path East, Central Delhi',
    },
  },
  {
    id: 'kartavya-path',
    index: 1,
    title: 'Kartavya Path',
    subtitle: 'The Grand Cyber Boulevard',
    codename: 'OP_CORRIDOR_TRANSIT',
    description:
      'A 3-kilometer cybernetic boulevard flanked by red laser bollards, encrypted telemetry pylons, and reflective water channels channeling encrypted data packets.',
    scrollRange: [0.1, 0.28],
    spatialCenter: [0, 0, -85],
    camera: {
      start: {
        position: [0, 8, 18],
        target: [0, 5, -90],
        fov: 50,
      },
      end: {
        position: [0, 6, -145],
        target: [0, 4, -195],
        fov: 46,
      },
    },
    atmosphere: {
      fogNear: 20,
      fogFar: 180,
      fogColor: DESIGN_TOKENS.obsidian,
      ambientColor: DESIGN_TOKENS.surface,
      ambientIntensity: 0.4,
      accentColor: DESIGN_TOKENS.signal,
      glowColor: DESIGN_TOKENS.crimson,
    },
    cybersecurityFocus: 'High-Throughput Backbone Security, Signal Interception, & Encrypted Conduits',
    keyThemes: ['Quantum-Safe Transport', 'Optical Intercepts', 'Telemetry Analysis', 'Critical Backbone'],
    coordinates: {
      lat: 28.6143,
      lng: 77.2155,
      locationName: 'Kartavya Path Central, New Delhi',
    },
  },
  {
    id: 'central-secretariat',
    index: 2,
    title: 'Central Secretariat Metro',
    subtitle: 'Subterranean Vault & Access Node',
    codename: 'OP_DEEP_SECRETARIAT',
    description:
      'Descending into the capital’s underground SCADA infrastructure. Brutalist concrete portal, biometric security barriers, and deep-level air-gapped server vaults.',
    scrollRange: [0.28, 0.45],
    spatialCenter: [0, -10, -210],
    camera: {
      start: {
        position: [4, 5, -155],
        target: [0, -5, -200],
        fov: 52,
      },
      end: {
        position: [0, -11, -225],
        target: [0, -12, -265],
        fov: 45,
      },
    },
    atmosphere: {
      fogNear: 10,
      fogFar: 110,
      fogColor: DESIGN_TOKENS.obsidian,
      ambientColor: DESIGN_TOKENS.gunmetal,
      ambientIntensity: 0.35,
      accentColor: DESIGN_TOKENS.signal,
      glowColor: DESIGN_TOKENS.crimson,
    },
    cybersecurityFocus: 'Air-Gapped Enclaves, SCADA/ICS Defense, & Biometric Access Controls',
    keyThemes: ['SCADA Protection', 'Hardware Bypass', 'Underground Vaults', 'Zero Trust Access'],
    coordinates: {
      lat: 28.6149,
      lng: 77.2119,
      locationName: 'Central Secretariat Underground Complex',
    },
  },
  {
    id: 'train-ride',
    index: 3,
    title: 'Yellow Line Transit',
    subtitle: 'High-Speed Darknet Conduit',
    codename: 'OP_YELLOW_PACKET',
    description:
      'High-speed transit through the subterranean Delhi Metro Yellow Line tube. Real-time telemetry, pulsing power rails, and encrypted cyber packet routing at 80 km/h.',
    scrollRange: [0.45, 0.62],
    spatialCenter: [0, -14, -320],
    camera: {
      start: {
        position: [1.4, -12.5, -245],
        target: [0, -13.5, -295],
        fov: 54,
      },
      end: {
        position: [0, -13.5, -385],
        target: [0, -13.5, -445],
        fov: 50,
      },
    },
    atmosphere: {
      fogNear: 8,
      fogFar: 100,
      fogColor: DESIGN_TOKENS.obsidian,
      ambientColor: DESIGN_TOKENS.surface,
      ambientIntensity: 0.3,
      accentColor: DESIGN_TOKENS.signal,
      glowColor: DESIGN_TOKENS.crimson,
    },
    cybersecurityFocus: 'In-Transit Packet Injection, Sub-Millisecond Latency, & Wireless Interception',
    keyThemes: ['Mobile Cyber Range', 'Subway Mesh Networks', 'CAN Bus Exploitation', 'Side-Channel Analysis'],
    coordinates: {
      lat: 28.6200,
      lng: 77.215,
      locationName: 'Yellow Line Subterranean Tube, Chanakyapuri-Connaught Tunnel',
    },
  },
  {
    id: 'rajiv-chowk',
    index: 4,
    title: 'Rajiv Chowk / Connaught Place',
    subtitle: 'Concentric Core Interchange',
    codename: 'OP_RADIAL_NEXUS',
    description:
      'Emerging into the legendary concentric Georgian colonnade of Connaught Place. Illuminated by crimson holographic billboards, threat-sharing centers, and cyber bazaars.',
    scrollRange: [0.62, 0.8],
    spatialCenter: [0, 0, -500],
    camera: {
      start: {
        position: [35, 14, -465],
        target: [0, 8, -500],
        fov: 54,
      },
      end: {
        position: [-30, 24, -535],
        target: [0, 10, -500],
        fov: 50,
      },
    },
    atmosphere: {
      fogNear: 25,
      fogFar: 200,
      fogColor: DESIGN_TOKENS.obsidian,
      ambientColor: DESIGN_TOKENS.surface,
      ambientIntensity: 0.5,
      accentColor: DESIGN_TOKENS.signal,
      glowColor: DESIGN_TOKENS.crimson,
    },
    cybersecurityFocus: 'Decentralized Intelligence Exchange, Threat Mesh, & Open-Source Security',
    keyThemes: ['Threat Intelligence', 'Community Exchange', 'Autonomous Swarms', 'Bazaar of Zero-Days'],
    coordinates: {
      lat: 28.6328,
      lng: 77.2197,
      locationName: 'Connaught Place Inner & Outer Circles',
    },
  },
  {
    id: 'skyline',
    index: 5,
    title: 'Neo-Delhi Skyline',
    subtitle: 'Orbital Defense & Tropospheric Canopy',
    codename: 'OP_SOVEREIGN_SKY',
    description:
      'Ascending above the megacity to witness Neo-Delhi in its entirety: cybernetic skyscrapers, laser antenna spires, and the sovereign defense umbrella protecting India.',
    scrollRange: [0.8, 1.0],
    spatialCenter: [0, 120, -500],
    camera: {
      start: {
        position: [0, 45, -490],
        target: [0, 15, -500],
        fov: 55,
      },
      end: {
        position: [0, 155, -360],
        target: [0, 10, -500],
        fov: 58,
      },
    },
    atmosphere: {
      fogNear: 40,
      fogFar: 350,
      fogColor: DESIGN_TOKENS.obsidian,
      ambientColor: DESIGN_TOKENS.gunmetal,
      ambientIntensity: 0.55,
      accentColor: DESIGN_TOKENS.signal,
      glowColor: DESIGN_TOKENS.crimson,
    },
    cybersecurityFocus: 'National Cyber Umbrella, Space-Ground Uplinks, & Critical Infrastructure Shield',
    keyThemes: ['Tropospheric Defense', 'Satellite Uplinks', 'National CISO Grid', 'Future Resilience'],
    coordinates: {
      lat: 28.625,
      lng: 77.22,
      locationName: 'National Capital Region Stratosphere',
    },
  },
];

/**
 * Returns the active chapter and normalized local progress within that chapter
 */
export function getChapterByProgress(progress: number): {
  chapter: ChapterConfig;
  index: number;
  localProgress: number;
} {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  for (let i = 0; i < CHAPTERS.length; i++) {
    const chapter = CHAPTERS[i];
    const [start, end] = chapter.scrollRange;

    // Last chapter covers up to 1.0 inclusive
    if (clampedProgress >= start && (clampedProgress <= end || i === CHAPTERS.length - 1)) {
      const rangeLength = end - start;
      const localProgress = rangeLength > 0 ? (clampedProgress - start) / rangeLength : 0;
      return {
        chapter,
        index: i,
        localProgress: Math.max(0, Math.min(1, localProgress)),
      };
    }
  }

  // Fallback to first chapter
  return {
    chapter: CHAPTERS[0],
    index: 0,
    localProgress: 0,
  };
}

/**
 * Helper to smoothly interpolate 3D coordinates between chapters and waypoints
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothStep(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Calculates continuous interpolated camera position, target look-at, and fov
 * based on the global scroll progress [0.0 - 1.0].
 */
export function interpolateCamera(progress: number): CameraWaypoint {
  const { chapter, localProgress } = getChapterByProgress(progress);
  const smoothed = smoothStep(localProgress);

  const startPos = chapter.camera.start.position;
  const endPos = chapter.camera.end.position;

  const startTarget = chapter.camera.start.target;
  const endTarget = chapter.camera.end.target;

  return {
    position: [
      lerp(startPos[0], endPos[0], smoothed),
      lerp(startPos[1], endPos[1], smoothed),
      lerp(startPos[2], endPos[2], smoothed),
    ],
    target: [
      lerp(startTarget[0], endTarget[0], smoothed),
      lerp(startTarget[1], endTarget[1], smoothed),
      lerp(startTarget[2], endTarget[2], smoothed),
    ],
    fov: lerp(chapter.camera.start.fov, chapter.camera.end.fov, smoothed),
  };
}
