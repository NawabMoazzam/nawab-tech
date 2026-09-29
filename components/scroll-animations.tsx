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
        .querySelectorAll<HTMLElement>(
          "main section, main article, main a.group, main [data-reveal-item]",
        )
        .forEach((element) => {
          if (observed.has(element)) return;
          observed.add(element);
          observer.observe(element);
        });
    };
    const mutations = new MutationObserver(observeSections);
    let activeSection: HTMLElement | null = null;
    let pointerX = 0;
    let pointerY = 0;
    let frame = 0;

    const updateSpotlight = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      activeSection = event.target.closest<HTMLElement>("main section");
      if (!activeSection || event.pointerType === "touch") return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (frame) return;

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (!activeSection) return;
        const bounds = activeSection.getBoundingClientRect();
        activeSection.style.setProperty("--spotlight-x", `${pointerX - bounds.left}px`);
        activeSection.style.setProperty("--spotlight-y", `${pointerY - bounds.top}px`);
      });
    };

    document.documentElement.classList.add("motion-ready");
    observeSections();
    mutations.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("pointermove", updateSpotlight, { passive: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
      window.removeEventListener("pointermove", updateSpotlight);
      if (frame) window.cancelAnimationFrame(frame);
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
