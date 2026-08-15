import { slugify } from "@/lib/slugify";

type ValidCategoryInput = {
  name: string;
  slug: string;
  description: string;
};

type CategoryValidationResult =
  | { success: true; data: ValidCategoryInput }
  | { success: false; error: string };

export function validateCategoryInput(input: unknown): CategoryValidationResult {
  if (!input || typeof input !== "object") {
    return { success: false, error: "Invalid category data." };
  }

  const value = input as Record<string, unknown>;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const requestedSlug =
    typeof value.slug === "string" ? value.slug.trim() : "";
  const slug = slugify(requestedSlug || name);
  const description =
    typeof value.description === "string" ? value.description.trim() : "";

  if (!name) {
    return { success: false, error: "Category name is required." };
  }

  if (name.length > 100) {
    return {
      success: false,
      error: "Category name must be 100 characters or fewer.",
    };
  }

  if (!slug) {
    return { success: false, error: "A valid category slug is required." };
  }

  if (slug.length > 120) {
    return {
      success: false,
      error: "Category slug must be 120 characters or fewer.",
    };
  }

  if (description.length > 500) {
    return {
      success: false,
      error: "Description must be 500 characters or fewer.",
    };
  }

  return {
    success: true,
    data: { name, slug, description },
  };
}
