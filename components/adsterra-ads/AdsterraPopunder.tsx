"use client";

import Script from "next/script";

interface Props {
  /** Unique id for the injected script tag. Defaults to "adsterra-popunder". */
  id?: string;
  /**
   * `next/script` loading strategy. A popunder only triggers on user
   * interaction, so the default "lazyOnload" keeps it from competing with the
   * initial page load.
   */
  strategy?: "lazyOnload" | "afterInteractive" | "beforeInteractive" | "worker";
  /** Consent / kill-switch. When `false` the script is never injected. */
  consent?: boolean;
}

const POPUNDER_SRC =
  "https://recallscarce.com/1b/be/fc/1bbefc53739325cc426f5382741da6cb.js";

/**
 * Adsterra popunder ad.
 *
 * Unlike the banners, the popunder has no dimensions and no `atOptions` — it is
 * a single global script that registers itself and fires on user interaction.
 *
 * `next/script` de-duplicates by `id`, so mounting this component more than
 * once (e.g. across nested layouts, or on every page via the root layout)
 * injects the script exactly once.
 */
export default function AdsterraPopunder({
  id = "adsterra-popunder",
  strategy = "lazyOnload",
  consent = true,
}: Props) {
  if (!consent) return null;

  return <Script id={id} src={POPUNDER_SRC} strategy={strategy} />;
}
