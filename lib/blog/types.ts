import type { CoverImageSource } from "@/lib/cover-image";

export type BlogPost = {
  _id?: string;
  slug: string;
  title: string;
  excerpt: string;

  category: {
    _id?: string;
    name: string;
    slug: string;
    description?: string;
  };

  tags: string[];

  author: {
    name: string;
    role: string;
    url?: string;
  };

  publishedAt: string;
  updatedAt?: string;

  readingTime: number;

  featured?: boolean;

  coverImage?: string;
  coverImageFileId?: string;
  /**
   * Where the cover lives:
   * - `upload` — the image was uploaded to ImageKit (has a `coverImageFileId`).
   * - `external` — the image is used straight from its own CDN (e.g. Pexels),
   *   so it costs nothing in ImageKit storage.
   */
  coverImageSource?: CoverImageSource;

  contentPath: string;
  content?: string;
  status?: "draft" | "published";
  focusKeyword?: string;
  originalityPrompts?: string[];
  originalityAnswers?: string[];
  noindex?: boolean;
  redirectTo?: string;

  seo: {
    title: string;
    description: string;
    keywords?: string[];
    ogImage?: string;
  };
};
