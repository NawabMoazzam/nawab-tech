import Image from "next/image";
import { Image as ImageKitImage } from "@imagekit/next";
import { ImageIcon } from "lucide-react";

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
  /** Preload the image when it is the LCP element (hero covers only). */
  preload?: boolean;
  /** Render a neutral placeholder when the post has no cover. Default `true`. */
  placeholder?: boolean;
};

/**
 * Renders a blog cover image inside its own positioned box.
 *
 * Cover images live on ImageKit, so when a URL endpoint is configured they are
 * served through the ImageKit loader (responsive srcset + transformations).
 * Local paths and plain remote URLs fall back to `next/image`.
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
        className={cn(
          "flex items-center justify-center bg-muted",
          className,
        )}
      >
        <ImageIcon className="size-5 text-muted-foreground/40" />
      </div>
    );
  }

  const imageProps = {
    fill: true,
    sizes,
    preload,
    className: cn("object-cover", imageClassName),
  };

  // Uploaded covers are absolute ImageKit URLs — those go through the
  // ImageKit loader so they get responsive srcset + transformations.
  // Local paths (and setups without an ImageKit endpoint) use `next/image`.
  const useImageKit = Boolean(urlEndpoint) && /^https?:\/\//i.test(cover);

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {useImageKit ? (
        <ImageKitImage
          urlEndpoint={urlEndpoint}
          src={cover}
          alt={alt}
          {...imageProps}
        />
      ) : (
        <Image src={cover} alt={alt} {...imageProps} />
      )}
    </div>
  );
}
