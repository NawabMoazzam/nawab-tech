"use client";

import { useSyncExternalStore } from "react";

const noop = () => {};

function subscribeMediaQuery(query: string, callback: () => void): () => void {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return noop;
  }
  const mql = window.matchMedia(query);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getMediaQuerySnapshot(query: string): boolean {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false;
  }
  return window.matchMedia(query).matches;
}

/**
 * SSR-safe media query hook.
 *
 * Returns `false` during server rendering and the initial hydration render
 * (so server and client markup always match), then resolves to the real value
 * once the client has hydrated.
 *
 * Built on `useSyncExternalStore`: the server value is never painted — React
 * re-renders with the real value before the browser paints, so there is no
 * flash of the wrong value and no wasted work.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => subscribeMediaQuery(query, callback),
    () => getMediaQuerySnapshot(query),
    () => false,
  );
}
