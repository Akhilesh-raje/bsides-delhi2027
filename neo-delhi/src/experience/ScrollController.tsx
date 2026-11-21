'use client';

import { useEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import { useExperienceStore } from './store';
import { CHAPTERS, getChapterByProgress } from './chapters';

interface ScrollControllerProps {
  /**
   * Overall multiplier for scroll length relative to viewport height (default: 6 for 6 chapters)
   */
  heightMultiplier?: number;
  /**
   * Smoothness damping factor for progress interpolation (0.01 - 0.2, default 0.08)
   */
  dampFactor?: number;
  /**
   * Whether to initialize and manage Lenis smooth scrolling instance
   */
  manageLenis?: boolean;
  /**
   * Optional callback when chapter changes
   */
  onChapterChange?: (chapterIndex: number, chapterId: string) => void;
  children?: React.ReactNode;
}

/**
 * ScrollController
 * Bridges window scroll / Lenis smooth scrolling with the 3D Experience state.
 * Normalizes scroll coordinates into global progress [0.0 - 1.0], computes
 * active journey chapters, and smoothly interpolates camera velocity.
 */
export function ScrollController({
  heightMultiplier = 6,
  dampFactor = 0.08,
  manageLenis = true,
  onChapterChange,
  children,
}: ScrollControllerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const targetProgressRef = useRef<number>(0);
  const smoothedProgressRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastProgressRef = useRef<number>(0);
  const lastChapterIndexRef = useRef<number>(-1);

  const setProgress = useExperienceStore((state) => state.setProgress);
  const setTargetProgress = useExperienceStore((state) => state.setTargetProgress);
  const setScrollUpdate = useExperienceStore((state) => state.setScrollUpdate);
  const setCurrentChapter = useExperienceStore((state) => state.setCurrentChapter);

  // Jump to a specific chapter smoothly
  const scrollToChapter = useCallback((chapterIndex: number) => {
    if (chapterIndex < 0 || chapterIndex >= CHAPTERS.length) return;
    const targetChapter = CHAPTERS[chapterIndex];
    const targetNormProgress = targetChapter.scrollRange[0];

    const maxScroll = (heightMultiplier - 1) * window.innerHeight;
    const targetScrollY = targetNormProgress * maxScroll;

    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetScrollY, { duration: 1.6, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    } else {
      window.scrollTo({
        top: targetScrollY,
        behavior: 'smooth',
      });
    }
  }, [heightMultiplier]);

  useEffect(() => {
    // Expose jump controller globally for navigation links
    if (typeof window !== 'undefined') {
      (window as unknown as { __neoDelhiScrollToChapter?: (idx: number) => void }).__neoDelhiScrollToChapter = scrollToChapter;
    }
  }, [scrollToChapter]);

  useEffect(() => {
    let lenis: Lenis | null = null;

    if (manageLenis && typeof window !== 'undefined') {
      lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
      });

      lenisRef.current = lenis;

      lenis.on('scroll', (e) => {
        const maxScroll = (heightMultiplier - 1) * window.innerHeight;
        const normalized = maxScroll > 0 ? Math.max(0, Math.min(1, e.scroll / maxScroll)) : 0;
        targetProgressRef.current = normalized;
        setTargetProgress(normalized);
      });
    }

    const handleNativeScroll = () => {
      if (manageLenis && lenisRef.current) return;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = (heightMultiplier - 1) * window.innerHeight;
      const normalized = maxScroll > 0 ? Math.max(0, Math.min(1, scrollY / maxScroll)) : 0;
      targetProgressRef.current = normalized;
      setTargetProgress(normalized);
    };

    if (!manageLenis) {
      window.addEventListener('scroll', handleNativeScroll, { passive: true });
    }

    // Keyboard navigation support (Arrow keys, PageUp/Down)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        const state = useExperienceStore.getState();
        const nextIdx = Math.min(CHAPTERS.length - 1, state.currentChapterIndex + 1);
        scrollToChapter(nextIdx);
        if (e.key === ' ') e.preventDefault();
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        const state = useExperienceStore.getState();
        const prevIdx = Math.max(0, state.currentChapterIndex - 1);
        scrollToChapter(prevIdx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Continuous animation loop for high-frequency progress smoothing & velocity tracking
    const updateLoop = (currentTime: number) => {
      if (lenis) {
        lenis.raf(currentTime);
      }

      const deltaTime = lastTimeRef.current ? (currentTime - lastTimeRef.current) / 1000 : 0.016;
      lastTimeRef.current = currentTime;

      // Exponential smoothing towards target
      const current = smoothedProgressRef.current;
      const target = targetProgressRef.current;
      const diff = target - current;

      const smoothed = Math.abs(diff) < 0.00005 ? target : current + diff * dampFactor;
      smoothedProgressRef.current = smoothed;

      // Calculate instantaneous scroll velocity
      const velocity = deltaTime > 0 ? (smoothed - lastProgressRef.current) / deltaTime : 0;
      lastProgressRef.current = smoothed;

      const isScrolling = Math.abs(diff) > 0.0005 || Math.abs(velocity) > 0.01;

      // Update experience store
      setProgress(smoothed);
      setScrollUpdate(smoothed, velocity, isScrolling);

      // Determine active chapter
      const { chapter, index, localProgress } = getChapterByProgress(smoothed);
      setCurrentChapter(index, chapter.id, localProgress);

      if (index !== lastChapterIndexRef.current) {
        lastChapterIndexRef.current = index;
        if (onChapterChange) {
          onChapterChange(index, chapter.id);
        }
      }

      rafIdRef.current = requestAnimationFrame(updateLoop);
    };

    rafIdRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (lenis) {
        lenis.destroy();
        lenisRef.current = null;
      }
      window.removeEventListener('scroll', handleNativeScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    heightMultiplier,
    dampFactor,
    manageLenis,
    onChapterChange,
    setProgress,
    setTargetProgress,
    setScrollUpdate,
    setCurrentChapter,
    scrollToChapter,
  ]);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{
        height: `${heightMultiplier * 100}vh`,
      }}
    >
      {children}
    </div>
  );
}
