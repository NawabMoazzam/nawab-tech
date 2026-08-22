"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe media query hook.
 *
 * Always returns `false` during the initial (server + first client) render so
 * the markup matches between server and client, then updates to the real value
 * inside an effect — guaranteeing no React hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();

    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);

  return matches;
}
