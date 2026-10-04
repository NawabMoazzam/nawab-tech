import Image from "next/image";
import { Image as ImageKitImage } from "@imagekit/next";
import { ImageIcon } from "lucide-react";

import { buildExternalCoverSources } from "@/lib/cover-image";
import { urlEndpoint } from "@/lib/imagekit";
import { cn } from "@/lib/utils";

type PostCoverProps = {
  /** Cover image URL or a local public path, e.g. `/cover.png`. */
  src?: string;
  /** Describe the image for screen readers. Use `""` for decorative images. */
  alt: string;
  /**
   * Responsive size hint for `srcset` generation. The box is sized by CSS, so
   * this is what keeps thumbnails light.
   */
  sizes: string;
  /** Classes for the cover box — controls size, aspect ratio and borders. */
  className?: string;
  /** Classes for the `<img>` itself, e.g. hover transitions. */
  imageClassName?: string;
  /** Load the image eagerly when it is above the fold (hero covers only). */
  preload?: boolean;
  /** Render a neutral placeholder when the post has no cover. Default `true`. */
  placeholder?: boolean;
};

/**
 * Renders a blog cover image inside its own positioned box.
 *
 * Three kinds of cover are handled:
 * - ImageKit uploads go through the ImageKit loader (responsive srcset +
 *   transformations).
 * - Local public paths go through `next/image`.
 * - External images (Pexels, etc.) are loaded straight from their own CDN with
 *   that CDN's sizing parameters, so they never cost ImageKit storage.
 */
export function PostCover({
  src,
  alt,
  sizes,
  className,
  imageClassName,
  preload = false,
  placeholder = true,
}: PostCoverProps) {
  const cover = src?.trim();

  if (!cover) {
    if (!placeholder) return null;

    return (
      <div
        aria-hidden
        className={cn("flex items-center justify-center bg-muted", className)}
      >
        <ImageIcon className="size-5 text-muted-foreground/40" />
      </div>
    );
  }

  const isLocalPath = cover.startsWith("/");
  const useImageKit =
    !isLocalPath && Boolean(urlEndpoint) && cover.startsWith(urlEndpoint);

  const imageClassNameCombined = cn("object-cover", imageClassName);

  if (useImageKit) {
    return (
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        <ImageKitImage
          urlEndpoint={urlEndpoint}
          src={cover}
          alt={alt}
          fill
          sizes={sizes}
          preload={preload}
          className={imageClassNameCombined}
        />
      </div>
    );
  }

  if (isLocalPath) {
    return (
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        <Image
          src={cover}
          alt={alt}
          fill
          sizes={sizes}
          preload={preload}
          className={imageClassNameCombined}
        />
      </div>
    );
  }

  // External cover: serve it from its own CDN instead of copying it into
  // ImageKit. A plain <img> lets us hand over that CDN's own srcset, which
  // `next/image` cannot generate for a host it does not manage.
  const { src: externalSrc, srcSet } = buildExternalCoverSources(cover);

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- external CDN, sized via its own srcset */}
      <img
        src={externalSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={preload ? "eager" : "lazy"}
        fetchPriority={preload ? "high" : "auto"}
        decoding="async"
        className={cn(
          "absolute inset-0 size-full object-cover",
          imageClassName,
        )}
      />
    </div>
  );
}
