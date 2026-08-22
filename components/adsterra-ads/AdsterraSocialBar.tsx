"use client";
import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface Props {
  id?: string;
  strategy?: "lazyOnload" | "afterInteractive" | "beforeInteractive" | "worker";
  // If true, script will only load when the component becomes visible
  loadOnVisible?: boolean;
  // Consent flag for GDPR/CCPA — if false, the script won't load
  consent?: boolean;
}

export default function AdsterraSocialBar({
  id = "adsterra-socialbar",
  strategy = "lazyOnload",
  loadOnVisible = false,
  consent = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Compute whether the script already exists synchronously at render
  const existsAtRender =
    typeof document !== "undefined" && !!document.getElementById(id);

  // Initialize shouldLoad without needing to set state inside an effect
  const [shouldLoad, setShouldLoad] = useState(() => {
    if (!consent) return false;
    if (!loadOnVisible) return !existsAtRender;
    return false;
  });

  useEffect(() => {
    if (!loadOnVisible || !consent) return;

    // If script already injected, don't attempt to observe or load
    if (existsAtRender) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
          break;
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadOnVisible, consent, id]);

  // Check current existence again before rendering the <Script />
  const exists =
    typeof document !== "undefined" && !!document.getElementById(id);

  return (
    <div ref={containerRef} aria-hidden>
      {shouldLoad && consent && !exists ? (
        <Script
          id={id}
          src="https://recallscarce.com/4d/ac/8c/4dac8c463d5f01a352b8b669a8173c88.js"
          strategy={strategy}
        />
      ) : null}
    </div>
  );
}
