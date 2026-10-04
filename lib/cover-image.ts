/**
 * Helpers for blog cover images.
 *
 * A cover is stored in one of two ways:
 * - `upload`   — the file was uploaded to ImageKit, so it carries a
 *                `coverImageFileId` and can be transformed/resized by
 *                ImageKit's CDN.
 * - `external` — the image is used straight from its own CDN (Pexels, etc.).
 *                Nothing is stored in ImageKit, and the image is served with
 *                that CDN's own sizing parameters.
 */

import { PEXELS_IMAGE_HOST } from "@/lib/pexels";

export const COVER_IMAGE_SOURCES = ["upload", "external"] as const;

export type CoverImageSource = (typeof COVER_IMAGE_SOURCES)[number];

/**
 * Hosts whose image URLs accept imgix-style query parameters, so we can ask
 * for a smaller file instead of downloading the full-size original.
 */
const RESIZABLE_HOSTS = [PEXELS_IMAGE_HOST];

/** Widths offered to the browser for external covers. */
const EXTERNAL_WIDTHS = [360, 480, 640, 828, 1080, 1280, 1600, 1920];

function isResizableUrl(url: URL) {
  return (
    (url.protocol === "https:" || url.protocol === "http:") &&
    RESIZABLE_HOSTS.includes(url.hostname)
  );
}

/**
 * Rewrites an external cover URL to request a specific width from the image
 * CDN. URLs we do not know how to resize are returned untouched.
 */
export function externalCoverSrc(src: string, width: number): string {
  let url: URL;

  try {
    url = new URL(src);
  } catch {
    return src;
  }

  if (!isResizableUrl(url)) return src;

  // `h` and `dpr` would re-crop / upscale the image; width alone keeps the
  // original aspect ratio.
  url.searchParams.delete("h");
  url.searchParams.delete("dpr");
  url.searchParams.delete("fit");
  url.searchParams.set("w", String(width));
  url.searchParams.set("auto", "compress");
  url.searchParams.set("cs", "tinysrgb");

  return url.toString();
}

type ExternalCoverSources = {
  src: string;
  srcSet?: string;
};

/**
 * Builds the `src` / `srcSet` pair for a cover hosted outside ImageKit. The
 * original URL is kept as the largest candidate so nothing is upscaled.
 */
export function buildExternalCoverSources(src: string): ExternalCoverSources {
  let url: URL;

  try {
    url = new URL(src);
  } catch {
    return { src };
  }

  if (!isResizableUrl(url)) return { src };

  const candidates = EXTERNAL_WIDTHS.filter((width) => {
    const originalWidth = Number(url.searchParams.get("w"));
    return Number.isNaN(originalWidth) || width <= originalWidth;
  });

  // Always let the browser fall back to the stored URL.
  if (!candidates.length) return { src };

  return {
    src: externalCoverSrc(src, candidates[0]),
    srcSet: candidates
      .map((width) => `${externalCoverSrc(src, width)} ${width}w`)
      .join(", "),
  };
}

/**
 * Existing posts predate `coverImageSource`, so fall back to what the stored
 * data tells us: a file ID means the image lives in ImageKit.
 */
export function inferCoverImageSource(cover: {
  coverImage?: string;
  coverImageFileId?: string;
  coverImageSource?: string;
}): CoverImageSource {
  if (cover.coverImageSource === "external") return "external";
  if (cover.coverImageSource === "upload") return "upload";
  return cover.coverImageFileId ? "upload" : "external";
}

export function isExternalCoverUrl(src: string): boolean {
  return /^https?:\/\//i.test(src);
}
