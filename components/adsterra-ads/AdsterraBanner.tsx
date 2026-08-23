"use client";

import { JSX, useEffect, useRef, useState } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export type AdsterraVariant =
  "728x90" | "468x60" | "320x50" | "300x250" | "160x600" | "160x300";

interface VariantConfig {
  key: string;
  width: number;
  height: number;
}

export const ADSTERRA_VARIANTS: Record<AdsterraVariant, VariantConfig> = {
  "728x90": { key: "3cb2c8de3ed9777942fc30fbceaed4af", width: 728, height: 90 },
  "468x60": { key: "a1eff0f11ef55bc709b1a33c11d5b677", width: 468, height: 60 },
  "320x50": { key: "3e908e7430b24d70c2fbd03f4e65d4b4", width: 320, height: 50 },
  "300x250": {
    key: "a09f0b2fe9b273e745882b0935d13d8f",
    width: 300,
    height: 250,
  },
  "160x600": {
    key: "3127a3424d48784e8f9fa492f83e0610",
    width: 160,
    height: 600,
  },
  "160x300": {
    key: "4f5c230a6adb8702352ff6ea043d14e3",
    width: 160,
    height: 300,
  },
};

type AtOptions = {
  key: string;
  format: "iframe";
  height: number;
  width: number;
  params: Record<string, unknown>;
};

type AtOptionsWindow = Window & typeof globalThis & { atOptions?: AtOptions };

/* -------------------------------------------------------------------------- */
/*  Ad loader                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Adsterra's `invoke.js` reads the shared global `window.atOptions`
 * synchronously the instant it executes. When several banners live on a single
 * page they would otherwise race for that one global and render with the wrong
 * dimensions / key.
 *
 * Serialising injection — set `atOptions` → append the script → wait for it to
 * finish → only then move to the next banner — guarantees every banner always
 * sees its own configuration.
 */
let adLoadChain: Promise<void> = Promise.resolve();

function enqueueAdLoad(container: HTMLElement, cfg: VariantConfig): void {
  adLoadChain = adLoadChain.then(
    () =>
      new Promise<void>((resolve) => {
        if (typeof window === "undefined") {
          resolve();
          return;
        }

        const atOptions: AtOptions = {
          key: cfg.key,
          format: "iframe",
          height: cfg.height,
          width: cfg.width,
          params: {},
        };
        (window as AtOptionsWindow).atOptions = atOptions;

        let settled = false;
        const settle = () => {
          if (!settled) {
            settled = true;
            resolve();
          }
        };

        const script = document.createElement("script");
        script.type = "text/javascript";
        // Preserve insertion order so the queue above stays meaningful.
        script.async = false;
        script.src = `https://recallscarce.com/${cfg.key}/invoke.js`;
        script.onload = settle;
        script.onerror = settle;

        container.appendChild(script);

        // Never let one slow / hung banner block the rest of the queue.
        window.setTimeout(settle, 6000);
      }),
  );
}

/* -------------------------------------------------------------------------- */
/*  Single banner slot                                                        */
/* -------------------------------------------------------------------------- */

interface BannerProps {
  variant: AdsterraVariant;
  className?: string;
  /** Show the small "Advertisement" label above the slot. @default true */
  showLabel?: boolean;
  /**
   * Only request the ad once the slot scrolls near the viewport. Also prevents
   * ads inside `display:none` containers (e.g. desktop-only sidebars on mobile)
   * from ever firing a request.
   * @default true
   */
  lazy?: boolean;
}

export default function AdsterraBanner({
  variant,
  className,
  showLabel = true,
  lazy = true,
}: BannerProps): JSX.Element {
  const cfg = ADSTERRA_VARIANTS[variant] ?? ADSTERRA_VARIANTS["728x90"];

  const wrapRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const queuedRef = useRef(false);

  const [visible, setVisible] = useState(!lazy);
  const [filled, setFilled] = useState(false);

  /* Lazy-load: mark the slot as active the first time it is near the viewport. */
  useEffect(() => {
    if (!lazy) return;
    const el = wrapRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      // Very old browsers without IntersectionObserver — load eagerly.
      const id = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [lazy]);

  /* Once visible, inject the ad and watch for the iframe so the placeholder
     can be hidden. */
  useEffect(() => {
    if (!visible) return;
    const el = slotRef.current;
    if (!el) return;

    const mutationObserver = new MutationObserver(() => {
      if (el.querySelector("iframe, ins, img")) {
        setFilled(true);
      }
    });
    mutationObserver.observe(el, { childList: true, subtree: true });

    if (!queuedRef.current && !el.querySelector("script")) {
      queuedRef.current = true;
      enqueueAdLoad(el, cfg);
    }

    return () => mutationObserver.disconnect();
  }, [visible, cfg]);

  return (
    <div
      ref={wrapRef}
      className={cn(
        "mx-auto flex w-fit max-w-full flex-col items-center",
        className,
      )}
      role="complementary"
      aria-label="Advertisement"
    >
      {showLabel ? (
        <span className="mb-1.5 select-none text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
          Advertisement
        </span>
      ) : null}

      <div
        ref={slotRef}
        className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30"
        style={{ width: cfg.width, height: cfg.height, maxWidth: "100%" }}
      >
        {!filled ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-2 text-center text-muted-foreground/40">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em]">
              Ad
            </span>
            <span className="text-[10px] tabular-nums tracking-wide">
              {cfg.width}&times;{cfg.height}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Responsive leaderboard                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Renders a single leaderboard banner that automatically picks the size which
 * fits the current viewport:
 *
 *   • large screens (≥ 1024px) → 728×90
 *   • tablets      (≥ 768px)   → 468×60
 *   • mobile       (< 768px)   → 320×50
 *
 * Only one banner is ever mounted, so no ad requests are wasted on hidden
 * slots and the banners never fight over `window.atOptions`.
 */
export function AdsterraLeaderboard({
  className,
  showLabel = true,
  lazy = false,
}: {
  className?: string;
  showLabel?: boolean;
  lazy?: boolean;
}): JSX.Element {
  const isLarge = useMediaQuery("(min-width: 1024px)");
  const isMedium = useMediaQuery("(min-width: 768px)");

  const variant: AdsterraVariant = isLarge
    ? "728x90"
    : isMedium
      ? "468x60"
      : "320x50";

  return (
    <AdsterraBanner
      key={variant}
      variant={variant}
      className={className}
      showLabel={showLabel}
      lazy={lazy}
    />
  );
}
