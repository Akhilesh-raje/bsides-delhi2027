import { create } from 'zustand';

/**
 * Neo-Delhi 3D Cybersecurity Conference Design Tokens
 */
export const DESIGN_TOKENS = {
  obsidian: '#08090D', // Primary background
  surface: '#111319',  // Secondary surface / panel
  gunmetal: '#252831', // Structural wireframes & borders
  crimson: '#9D071A',  // Glow & volumetric lighting only
  signal: '#D62E42',   // Primary interactive signals / alert accents / headings
  silver: '#E5E1DF',   // Primary text & highlights
  muted: '#99949A',    // Secondary text & metadata
} as const;

export type GPUTier = 0 | 1 | 2 | 3;

export interface QualitySettings {
  dpr: [number, number];
  enablePostProcessing: boolean;
  enableBloom: boolean;
  bloomIntensity: number;
  enableChromaticAberration: boolean;
  enableNoise: boolean;
  enableVignette: boolean;
  enableShadows: boolean;
  particleCount: number;
  anisotropy: number;
  antialias: boolean;
}

export const DEFAULT_QUALITY_TIERS: Record<GPUTier, QualitySettings> = {
  0: {
    dpr: [1, 1],
    enablePostProcessing: false,
    enableBloom: false,
    bloomIntensity: 0,
    enableChromaticAberration: false,
    enableNoise: false,
    enableVignette: false,
    enableShadows: false,
    particleCount: 200,
    anisotropy: 1,
    antialias: false,
  },
  1: {
    dpr: [1, 1.25],
    enablePostProcessing: true,
    enableBloom: true,
    bloomIntensity: 0.8,
    enableChromaticAberration: false,
    enableNoise: false,
    enableVignette: true,
    enableShadows: false,
    particleCount: 600,
    anisotropy: 2,
    antialias: true,
  },
  2: {
    dpr: [1, 1.5],
    enablePostProcessing: true,
    enableBloom: true,
    bloomIntensity: 1.1,
    enableChromaticAberration: true,
    enableNoise: true,
    enableVignette: true,
    enableShadows: true,
    particleCount: 1400,
    anisotropy: 4,
    antialias: true,
  },
  3: {
    dpr: [1, 2],
    enablePostProcessing: true,
    enableBloom: true,
    bloomIntensity: 1.35,
    enableChromaticAberration: true,
    enableNoise: true,
    enableVignette: true,
    enableShadows: true,
    particleCount: 2500,
    anisotropy: 8,
    antialias: true,
  },
};

export type ChapterId =
  | 'india-gate'
  | 'kartavya-path'
  | 'central-secretariat'
  | 'train-ride'
  | 'rajiv-chowk'
  | 'skyline';

export interface ExperienceState {
  // Scroll & Journey Progress
  progress: number;            // Normalized smoothed scroll progress [0.00 - 1.00]
  targetProgress: number;      // Instant raw scroll progress [0.00 - 1.00]
  velocity: number;            // Current scroll velocity
  isScrolling: boolean;        // Whether the user is actively scrolling

  // Chapter Navigation
  currentChapterIndex: number; // 0 to 5
  currentChapterId: ChapterId; // Active chapter identifier
  chapterProgress: number;     // Normalized progress [0.00 - 1.00] within the active chapter

  // Hardware & Performance
  gpuTier: GPUTier;
  quality: QualitySettings;
  isMobile: boolean;
  fps: number;
  isLoaded: boolean;

  // Interactive & Debug State
  activeOverlay: string | null;
  debugMode: boolean;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];

  // Actions
  setProgress: (progress: number) => void;
  setTargetProgress: (targetProgress: number) => void;
  setScrollUpdate: (progress: number, velocity: number, isScrolling: boolean) => void;
  setCurrentChapter: (index: number, id: ChapterId, chapterProgress: number) => void;
  setGPUTier: (tier: GPUTier, customQuality?: Partial<QualitySettings>) => void;
  setIsMobile: (isMobile: boolean) => void;
  setIsLoaded: (isLoaded: boolean) => void;
  setActiveOverlay: (overlayId: string | null) => void;
  setDebugMode: (debug: boolean) => void;
  toggleDebugMode: () => void;
  setFps: (fps: number) => void;
  setCameraTelemetry: (position: [number, number, number], target: [number, number, number]) => void;
  resetExperience: () => void;
}

const INITIAL_STATE = {
  progress: 0,
  targetProgress: 0,
  velocity: 0,
  isScrolling: false,
  currentChapterIndex: 0,
  currentChapterId: 'india-gate' as ChapterId,
  chapterProgress: 0,
  gpuTier: 2 as GPUTier,
  quality: DEFAULT_QUALITY_TIERS[2],
  isMobile: false,
  fps: 60,
  isLoaded: false,
  activeOverlay: null,
  debugMode: false,
  cameraPosition: [0, 8, 48] as [number, number, number],
  cameraTarget: [0, 16, 0] as [number, number, number],
};

export const useExperienceStore = create<ExperienceState>()((set) => ({
  ...INITIAL_STATE,

  setProgress: (progress) =>
    set({
      progress: Math.max(0, Math.min(1, progress)),
    }),

  setTargetProgress: (targetProgress) =>
    set({
      targetProgress: Math.max(0, Math.min(1, targetProgress)),
    }),

  setScrollUpdate: (progress, velocity, isScrolling) =>
    set({
      progress: Math.max(0, Math.min(1, progress)),
      velocity,
      isScrolling,
    }),

  setCurrentChapter: (currentChapterIndex, currentChapterId, chapterProgress) =>
    set({
      currentChapterIndex,
      currentChapterId,
      chapterProgress: Math.max(0, Math.min(1, chapterProgress)),
    }),

  setGPUTier: (gpuTier, customQuality) =>
    set((state) => ({
      gpuTier,
      quality: {
        ...DEFAULT_QUALITY_TIERS[gpuTier],
        ...(customQuality || {}),
      },
    })),

  setIsMobile: (isMobile) => set({ isMobile }),

  setIsLoaded: (isLoaded) => set({ isLoaded }),

  setActiveOverlay: (activeOverlay) => set({ activeOverlay }),

  setDebugMode: (debugMode) => set({ debugMode }),

  toggleDebugMode: () => set((state) => ({ debugMode: !state.debugMode })),

  setFps: (fps) => set({ fps }),

  setCameraTelemetry: (cameraPosition, cameraTarget) =>
    set({ cameraPosition, cameraTarget }),

  resetExperience: () => set(INITIAL_STATE),
}));
