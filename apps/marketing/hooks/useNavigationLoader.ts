'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to detect Next.js 14 App Router navigation starts.
 *
 * KEY BEHAVIOUR CHANGE:
 * Previously the loader waited for usePathname() to update before dismissing —
 * that meant waiting for ALL server data to finish loading (slow on heavy pages).
 *
 * Now the loader dismisses after a short fixed delay (600ms) from when the
 * click is detected. This gives instant visual feedback that navigation started,
 * then hands off to the page's own loading states (skeletons, Suspense, etc.)
 * without waiting for full data resolution.
 *
 * Flow:
 * 1. User clicks internal link → isLoading = true
 * 2. 300ms anti-flicker delay → overlay appears
 * 3. 600ms after click → overlay dismisses regardless of data load state
 * 4. Safety reset at 8s in case nothing else clears it
 */
export function useNavigationLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [destination, setDestination] = useState('');

  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flickerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    if (flickerTimer.current) clearTimeout(flickerTimer.current);
    if (safetyTimer.current)  clearTimeout(safetyTimer.current);
  }, []);

  const resetLoader = useCallback(() => {
    clearAllTimers();
    setIsLoading(false);
    setShowLoader(false);
  }, [clearAllTimers]);

  useEffect(() => {
    if (isLoading) {
      // Anti-flicker: only show overlay if navigation takes longer than 300ms
      flickerTimer.current = setTimeout(() => {
        setShowLoader(true);
      }, 300);

      // AUTO-DISMISS: hide the loader 600ms after navigation started.
      // We do NOT wait for data — the page's own Suspense/skeleton handles the rest.
      dismissTimer.current = setTimeout(() => {
        setIsLoading(false);
        setShowLoader(false);
      }, 600);

      // Safety net: force reset after 8s no matter what
      safetyTimer.current = setTimeout(() => {
        setIsLoading(false);
        setShowLoader(false);
      }, 8000);
    } else {
      clearAllTimers();
      setShowLoader(false);
    }

    return () => clearAllTimers();
  }, [isLoading, clearAllTimers]);

  const handleStartNavigation = useCallback((url: string) => {
    const currentPath = window.location.pathname.replace(/\/$/, '');
    const targetPath  = url.split('?')[0].replace(/\/$/, '');

    if (
      targetPath !== currentPath &&
      url.startsWith('/') &&
      !url.includes('#')
    ) {
      // If a navigation is already in progress, reset cleanly before starting new one
      clearAllTimers();
      setIsLoading(true);
      setDestination(url);
    }
  }, [clearAllTimers]);

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest('a');

      if (
        anchor &&
        anchor instanceof HTMLAnchorElement &&
        anchor.href &&
        anchor.target !== '_blank' &&
        !event.defaultPrevented &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey
      ) {
        const url = new URL(anchor.href);
        const isInternal = url.origin === window.location.origin;

        if (isInternal) {
          handleStartNavigation(url.pathname + url.search);
        }
      }
    };

    // Note: window.location already reflects the destination when popstate fires
    const handlePopState = () => {
      setIsLoading(true);
      setDestination(window.location.pathname + window.location.search);
    };

    window.addEventListener('click', handleAnchorClick);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [handleStartNavigation]);

  return {
    isLoading: showLoader,
    destination,
  };
}