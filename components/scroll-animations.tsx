"use client";

import { useEffect } from "react";

/** Adds a small, progressive reveal to page sections as they enter the viewport. */
export function ScrollAnimations() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.04, rootMargin: "0px 0px -36px 0px" },
    );
    const observed = new WeakSet<Element>();
    const observeSections = () => {
      document
        .querySelectorAll<HTMLElement>("main section, main [data-reveal-item]")
        .forEach((element) => {
          if (observed.has(element)) return;
          observed.add(element);
          observer.observe(element);
        });
    };
    const mutations = new MutationObserver(observeSections);

    document.documentElement.classList.add("motion-ready");
    observeSections();
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
