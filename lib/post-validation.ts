import { isObjectIdOrHexString } from "mongoose";

import { inferCoverImageSource } from "@/lib/cover-image";
import { slugify } from "@/lib/slugify";

export type ValidPostInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverImage: string;
  coverImageFileId: string;
  coverImageSource: "upload" | "external";
  status: "draft" | "published";
  featured: boolean;
  focusKeyword: string;
  originalityPrompts: string[];
  originalityAnswers: string[];
  noindex: boolean;
  redirectTo: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
  };
};

type PostValidationResult =
  | { success: true; data: ValidPostInput }
  | { success: false; error: string };

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function stringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(value.map(stringValue).filter(Boolean).slice(0, 30)),
  );
}

export function validatePostInput(input: unknown): PostValidationResult {
  if (!input || typeof input !== "object") {
    return { success: false, error: "Invalid post data." };
  }

  const value = input as Record<string, unknown>;
  const seoValue =
    value.seo && typeof value.seo === "object"
      ? (value.seo as Record<string, unknown>)
      : {};
  const rawCategory = value.category;
  const category =
    typeof rawCategory === "string"
      ? rawCategory
      : rawCategory && typeof rawCategory === "object"
        ? stringValue((rawCategory as Record<string, unknown>)._id)
        : "";

  const title = stringValue(value.title);
  const slug = slugify(stringValue(value.slug) || title);
  const excerpt = stringValue(value.excerpt);
  const content = typeof value.content === "string" ? value.content.trim() : "";
  const status = value.status === "published" ? "published" : "draft";

  if (!title || !slug || !excerpt || !content) {
    return {
      success: false,
      error: "Title, slug, excerpt, and content are required.",
    };
  }

  if (title.length > 200) {
    return { success: false, error: "Title must be 200 characters or fewer." };
  }

  if (excerpt.length > 300) {
    return { success: false, error: "Excerpt must be 300 characters or fewer." };
  }

  if (!isObjectIdOrHexString(category)) {
    return { success: false, error: "Select a valid category." };
  }

  const originalityPrompts = stringList(value.originalityPrompts).slice(0, 3);
  const originalityAnswers = Array.isArray(value.originalityAnswers)
    ? value.originalityAnswers.slice(0, 3).map((answer) => stringValue(answer))
    : [];
  if (status === "published" && originalityPrompts.length > 0 && originalityPrompts.some((_, index) => !originalityAnswers[index])) {
    return { success: false, error: "Answer all originality prompts before publishing this draft." };
  }

  const coverImage = stringValue(value.coverImage);
  const coverImageSource = inferCoverImageSource({
    coverImage,
    coverImageFileId: stringValue(value.coverImageFileId),
    coverImageSource: stringValue(value.coverImageSource),
  });

  const isAbsoluteUrl = /^https?:\/\//i.test(coverImage);

  if (coverImage && coverImageSource === "external" && !isAbsoluteUrl) {
    return {
      success: false,
      error: "Cover image URL must start with http:// or https://.",
    };
  }

  return {
    success: true,
    data: {
      title,
      slug,
      excerpt,
      content,
      category,
      tags: stringList(value.tags),
      coverImage,
      // External covers have no ImageKit file to clean up.
      coverImageFileId:
        coverImageSource === "external"
          ? ""
          : stringValue(value.coverImageFileId),
      coverImageSource,
      status,
      featured: value.featured === true,
      focusKeyword: stringValue(value.focusKeyword).toLowerCase(),
      originalityPrompts,
      originalityAnswers,
      noindex: value.noindex === true,
      redirectTo: stringValue(value.redirectTo),
      seo: {
        title: stringValue(seoValue.title),
        description: stringValue(seoValue.description) || excerpt,
        keywords: stringList(seoValue.keywords),
        ogImage: stringValue(seoValue.ogImage),
      },
    },
  };
}
