"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Custom hook to safely subscribe to a CSS media query in React 19 / Next.js.
 *
 * Uses React's `useSyncExternalStore` to ensure synchronous, tear-free updates
 * and avoid SSR hydration mismatch bugs between server and client renders.
 *
 * @param query - The CSS media query string (e.g. `"(max-width: 768px)"`)
 * @param serverFallback - Initial value returned during server-side rendering (defaults to false)
 * @returns boolean indicating whether the query currently matches
 *
 * @example
 * const isMobile = useMediaQuery("(max-width: 767px)");
 */
export function useMediaQuery(
  query: string,
  serverFallback: boolean = false
): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof window === "undefined" || !("matchMedia" in window)) {
        return () => {};
      }

      const mediaQueryList = window.matchMedia(query);

      // Modern API with event listener
      if (typeof mediaQueryList.addEventListener === "function") {
        mediaQueryList.addEventListener("change", callback);
        return () => mediaQueryList.removeEventListener("change", callback);
      }

      // Legacy fallback for older Safari/iOS versions
      mediaQueryList.addListener(callback);
      return () => mediaQueryList.removeListener(callback);
    },
    [query]
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) {
      return serverFallback;
    }
    return window.matchMedia(query).matches;
  }, [query, serverFallback]);

  const getServerSnapshot = useCallback(() => {
    return serverFallback;
  }, [serverFallback]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Convenience hooks matching Tailwind CSS v4 breakpoints:
 * - sm: 640px
 * - md: 768px
 * - lg: 1024px
 * - xl: 1280px
 * - 2xl: 1536px
 */

/**
 * Returns true if viewport is mobile (< 768px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)", false);
}

/**
 * Returns true if viewport is tablet (768px - 1023px)
 */
export function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)", false);
}

/**
 * Returns true if viewport is desktop (>= 1024px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)", true);
}

/**
 * Returns true if viewport is widescreen (>= 1280px)
 */
export function useIsLargeScreen(): boolean {
  return useMediaQuery("(min-width: 1280px)", true);
}

/**
 * Detects if the device has a coarse pointer (touchscreen / mobile / tablet)
 */
export function useIsTouchDevice(): boolean {
  return useMediaQuery("(pointer: coarse)", false);
}

/**
 * Detects if user OS prefers high contrast mode
 */
export function usePrefersHighContrast(): boolean {
  return useMediaQuery("(prefers-contrast: more)", false);
}

/**
 * Detects if user OS prefers dark mode
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery("(prefers-color-scheme: dark)", true);
}
