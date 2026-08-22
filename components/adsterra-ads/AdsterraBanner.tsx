"use client";
import { JSX, useEffect, useRef, useState } from "react";

type Variant =
  "468x60" | "300x250" | "160x300" | "160x600" | "320x50" | "728x90";

interface Props {
  variant: Variant;
}

const VARIANT_MAP: Record<
  Variant,
  { key: string; width: number; height: number; className?: string }
> = {
  "468x60": {
    key: "a1eff0f11ef55bc709b1a33c11d5b677",
    width: 468,
    height: 60,
    className: "min-h-15 max-w-117",
  },
  "300x250": {
    key: "a09f0b2fe9b273e745882b0935d13d8f",
    width: 300,
    height: 250,
    className: "min-h-62.5 max-w-75",
  },
  "160x300": {
    key: "4f5c230a6adb8702352ff6ea043d14e3",
    width: 160,
    height: 300,
    className: "min-h-75 max-w-40",
  },
  "160x600": {
    key: "3127a3424d48784e8f9fa492f83e0610",
    width: 160,
    height: 600,
    className: "min-h-150 max-w-40",
  },
  "320x50": {
    key: "3e908e7430b24d70c2fbd03f4e65d4b4",
    width: 320,
    height: 50,
    className: "min-h-12.5 max-w-80",
  },
  "728x90": {
    key: "3cb2c8de3ed9777942fc30fbceaed4af",
    width: 728,
    height: 90,
    className: "min-h-22.5 max-w-182",
  },
};

export default function AdsterraBanner({ variant }: Props): JSX.Element {
  const chosen = (variant ?? "468x60") as Variant;
  const cfg = VARIANT_MAP[chosen];
  return <GenericBanner cfg={cfg} />;
}

function GenericBanner({
  cfg,
}: {
  cfg: { key: string; width: number; height: number; className?: string };
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [fitsViewport, setFitsViewport] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const check = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setFitsViewport(w >= cfg.width && h >= cfg.height);
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [cfg.width, cfg.height]);

  useEffect(() => {
    if (!fitsViewport) return;
    const el = ref.current;
    if (!el || el.firstChild) return;

    const atOptions = {
      key: cfg.key,
      format: "iframe",
      height: cfg.height,
      width: cfg.width,
      params: {},
    };

    // Assign to window safely
    window.atOptions = atOptions;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `https://recallscarce.com/${cfg.key}/invoke.js`;

    el.appendChild(script);
  }, [cfg.key, cfg.height, cfg.width, fitsViewport]);

  if (!fitsViewport) return null;

  return (
    <div className="flex flex-1 items-center justify-center max-w-screen">
      <div
        ref={ref}
        className={`flex justify-center items-center border-border border-2 my-4 ${cfg.className ?? "min-h-15 max-w-117"}`}
      >
        <span className="text-muted text-center -z-10">
          Advertisement
          <br />
          {cfg.width}x{cfg.height}
        </span>
      </div>
    </div>
  );
}
