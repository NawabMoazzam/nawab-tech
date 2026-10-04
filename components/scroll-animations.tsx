"use client";

import { useEffect } from "react";

const REVEAL_SELECTOR =
  "main section, main article, main a.group, main [data-reveal-item], main [data-reveal]";
const TILT_SELECTOR = '[data-tilt]:not([data-tilt="off"])';
const TILT_STRENGTH = 3; // degrees

/**
 * Progressive enhancement for the site's motion:
 * - reveals sections / items as they scroll into view
 * - tracks pointer position for section spotlights and card tilt
 * - drives the reading-progress bar and the navbar's scroll state
 *
 * Nothing is hidden until this component confirms animations are welcome, so
 * the site stays fully readable without JS or with reduced motion enabled.
 */
export function ScrollAnimations() {
  useEffect(() => {
    // Scroll position drives the reading-progress bar and the header's
    // condensed state. It is not decorative motion, so it stays on even when
    // the visitor asked for reduced motion.
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motionAllowed =
      !reducedMotion.matches && "IntersectionObserver" in window;

    // Tilt is a mouse affordance — never on touch, never on hover-less devices.
    const canTilt =
      motionAllowed &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

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
        .querySelectorAll<HTMLElement>(REVEAL_SELECTOR)
        .forEach((element) => {
          if (observed.has(element)) return;
          observed.add(element);
          observer.observe(element);
        });
    };
    const mutations = new MutationObserver(observeSections);

    /* ---------------------------------------------------------------
       Pointer spotlight + card tilt
    --------------------------------------------------------------- */
    let activeSection: HTMLElement | null = null;
    let tiltTarget: HTMLElement | null = null;
    let pointerX = 0;
    let pointerY = 0;
    let frame = 0;

    const resetTilt = (element: HTMLElement) => {
      element.style.removeProperty("--tilt-x");
      element.style.removeProperty("--tilt-y");
      element.style.removeProperty("--tilt-lift");
    };

    const updatePointer = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;

      const section = event.target.closest<HTMLElement>("main section");
      const tilt = canTilt
        ? event.target.closest<HTMLElement>(TILT_SELECTOR)
        : null;

      if (tilt !== tiltTarget) {
        if (tiltTarget) resetTilt(tiltTarget);
        tiltTarget = tilt;
      }

      if (!section && !tilt) return;
      if (event.pointerType === "touch") return;

      activeSection = section;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (frame) return;

      frame = window.requestAnimationFrame(() => {
        frame = 0;

        if (activeSection) {
          const bounds = activeSection.getBoundingClientRect();
          activeSection.style.setProperty(
            "--spotlight-x",
            `${pointerX - bounds.left}px`,
          );
          activeSection.style.setProperty(
            "--spotlight-y",
            `${pointerY - bounds.top}px`,
          );
        }

        if (tiltTarget) {
          const bounds = tiltTarget.getBoundingClientRect();
          const ratioX = (pointerX - bounds.left) / bounds.width - 0.5;
          const ratioY = (pointerY - bounds.top) / bounds.height - 0.5;
          tiltTarget.style.setProperty(
            "--tilt-y",
            `${(ratioX * TILT_STRENGTH).toFixed(2)}deg`,
          );
          tiltTarget.style.setProperty(
            "--tilt-x",
            `${(-ratioY * TILT_STRENGTH).toFixed(2)}deg`,
          );
          tiltTarget.style.setProperty("--tilt-lift", "-2px");
        }
      });
    };

    const clearTilt = () => {
      if (tiltTarget) resetTilt(tiltTarget);
      tiltTarget = null;
    };

    /* ---------------------------------------------------------------
       Reading progress + scroll direction (used by the navbar)
    --------------------------------------------------------------- */
    let scrollFrame = 0;
    let lastScrollY = window.scrollY;

    const updateScroll = () => {
      if (scrollFrame) return;

      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = 0;

        const scrollY = window.scrollY;
        const scrollable =
          document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? Math.min(1, scrollY / scrollable) : 0;

        document.documentElement.style.setProperty(
          "--scroll-progress",
          progress.toFixed(4),
        );
        document.documentElement.dataset.scrolled =
          scrollY > 24 ? "true" : "false";

        if (Math.abs(scrollY - lastScrollY) > 6) {
          document.documentElement.dataset.scrollDirection =
            scrollY > lastScrollY && scrollY > 320 ? "down" : "up";
          lastScrollY = scrollY;
        }
      });
    };

    if (motionAllowed) {
      document.documentElement.classList.add("motion-ready");
      observeSections();
      mutations.observe(document.body, { childList: true, subtree: true });
      window.addEventListener("pointermove", updatePointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", clearTilt);
      window.addEventListener("blur", clearTilt);
    }

    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();

    return () => {
      mutations.disconnect();
      observer.disconnect();
      window.removeEventListener("pointermove", updatePointer);
      document.documentElement.removeEventListener("pointerleave", clearTilt);
      window.removeEventListener("blur", clearTilt);
      window.removeEventListener("scroll", updateScroll);
      if (frame) window.cancelAnimationFrame(frame);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      document.documentElement.classList.remove("motion-ready");
      delete document.documentElement.dataset.scrolled;
      delete document.documentElement.dataset.scrollDirection;
    };
  }, []);

  return null;
}
