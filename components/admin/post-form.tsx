"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CoverImageField } from "./cover-image-field";
import { useTheme } from "next-themes";
import {
  inferCoverImageSource,
  type CoverImageSource,
} from "@/lib/cover-image";

// MDEditor is client-only
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type PostFormData = {
  _id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverImage: string;
  coverImageFileId: string;
  coverImageSource: CoverImageSource;
  status: "draft" | "published";
  featured: boolean;
  focusKeyword: string;
  originalityPrompts: string[];
  originalityAnswers: string[];
  noindex: boolean;
  redirectTo: string;
  seo: { title: string; description: string; keywords: string[] };
};

const initialData: PostFormData = {
  slug: "",
  title: "",
  excerpt: "",
  content: "# Hello World\n\nStart writing your post in markdown...",
  category: "",
  tags: [],
  coverImage: "",
  coverImageFileId: "",
  coverImageSource: "upload",
  status: "draft",
  featured: false,
  focusKeyword: "",
  originalityPrompts: [],
  originalityAnswers: [],
  noindex: false,
  redirectTo: "",
  seo: { title: "", description: "", keywords: [] },
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

type CategoryOption = {
  _id: string;
  name: string;
  slug: string;
};

type InitialPost = Partial<Omit<PostFormData, "category">> & {
  category?: string | { _id?: string };
};

export function PostForm({
  initialPost,
  categories,
}: {
  initialPost?: InitialPost;
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [form, setForm] = useState<PostFormData>(() => {
    const initialCategory =
      typeof initialPost?.category === "string"
        ? initialPost.category
        : initialPost?.category?._id || categories[0]?._id || "";

    if (initialPost) {
      return {
        ...initialData,
        ...initialPost,
        tags: initialPost.tags || [],
        originalityPrompts: initialPost.originalityPrompts || [],
        originalityAnswers: initialPost.originalityAnswers || [],
        category: initialCategory,
        // Posts saved before covers had a source are inferred from their data.
        coverImageSource: inferCoverImageSource(initialPost),
        seo: initialPost.seo || initialData.seo,
      };
    }

    return { ...initialData, category: initialCategory };
  });
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!initialPost?._id;

  const handleTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: f.slug || slugify(title),
      seo: { ...f.seo, title: f.seo.title || `${title} | Nawab Tech` },
    }));
  };

  const handleSubmit = async (publish = false) => {
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      status: publish ? "published" : form.status,
      seo: {
        ...form.seo,
        description: form.seo.description || form.excerpt,
      },
    };

    try {
      const url = isEditing
        ? `/api/admin/posts/${initialPost._id}`
        : "/api/admin/posts";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save");
      }

      router.push("/admin/posts");
      router.refresh();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Failed to save post.");
      setSaving(false);
    }
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit(false);
      }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">
          {isEditing ? "Edit Post" : "New Post"}
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/posts")}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="secondary"
            disabled={saving || categories.length === 0}
          >
            {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit(true)}
            disabled={saving || categories.length === 0}
          >
            {saving ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <input
                  className="mt-1 w-full rounded-md border border-input px-3 py-2"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  placeholder="How much does a business website cost?"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Slug *</label>
                  <input
                    className="mt-1 w-full rounded-md border border-input px-3 py-2 font-mono text-sm"
                    value={form.slug}
                    onChange={(e) =>
                      setForm({ ...form, slug: slugify(e.target.value) })
                    }
                    required
                    placeholder="how-much-does-website-cost"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    URL: /blog/{form.slug || "your-slug"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    className="mt-1 w-full rounded-md border border-input px-3 py-2"
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status:
                          e.target.value === "published" ? "published" : "draft",
                      })
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Excerpt * (max 300)
                </label>
                <textarea
                  className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
                  rows={3}
                  value={form.excerpt}
                  onChange={(e) =>
                    setForm({ ...form, excerpt: e.target.value })
                  }
                  required
                  maxLength={300}
                  placeholder="Short description for SEO and cards..."
                />
                <p className="text-[11px] text-muted-foreground text-right">
                  {form.excerpt.length}/300
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Content (Markdown) *
                </label>
                <div className="mt-2" data-color-mode={resolvedTheme}>
                  <MDEditor
                    value={form.content}
                    onChange={(v) => setForm({ ...form, content: v || "" })}
                    height={500}
                    preview="edit"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Supports GFM, code blocks, images via ![alt](url)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">SEO Title</label>
                <input
                  className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
                  value={form.seo.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      seo: { ...form.seo, title: e.target.value },
                    })
                  }
                  placeholder="Auto from title + | Nawab Tech"
                />
              </div>
              <div>
                <label className="text-sm font-medium">SEO Description</label>
                <textarea
                  className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
                  value={form.seo.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      seo: { ...form.seo, description: e.target.value },
                    })
                  }
                  rows={2}
                  placeholder="Auto from excerpt"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Keywords (comma separated)
                </label>
                <input
                  className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
                  value={form.seo.keywords.join(", ")}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      seo: {
                        ...form.seo,
                        keywords: e.target.value
                          .split(",")
                          .map((k) => k.trim())
                          .filter(Boolean),
                      },
                    })
                  }
                  placeholder="web development, business website"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Focus keyword</label>
                <input
                  className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
                  value={form.focusKeyword}
                  onChange={(e) => setForm({ ...form, focusKeyword: e.target.value })}
                  placeholder="e.g. small business website cost"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Originality prompts (one question per line)</label>
                <textarea
                  className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
                  rows={4}
                  value={form.originalityPrompts.join("\n")}
                  onChange={(e) => setForm({ ...form, originalityPrompts: e.target.value.split("\n").map((item) => item.trim()).filter(Boolean).slice(0, 3) })}
                  placeholder={"What real project number can you add?\nWhat did you learn first-hand?\nWhich trade-off would you choose and why?"}
                />
                <p className="mt-1 text-xs text-muted-foreground">Generated drafts include three questions to help add first-hand evidence. Answer every prompt before publishing.</p>
              </div>
              {form.originalityPrompts.map((prompt, index) => (
                <div key={`${index}-${prompt}`}>
                  <label className="text-sm font-medium">Author answer {index + 1}: {prompt}</label>
                  <textarea
                    className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
                    rows={2}
                    value={form.originalityAnswers[index] || ""}
                    onChange={(e) => {
                      const originalityAnswers = [...form.originalityAnswers];
                      originalityAnswers[index] = e.target.value;
                      setForm({ ...form, originalityAnswers });
                    }}
                    placeholder="Add a real project detail, number, decision, or firsthand observation…"
                  />
                </div>
              ))}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.noindex} onChange={(e) => setForm({ ...form, noindex: e.target.checked })} />
                Exclude from search indexing and sitemap
              </label>
              <div>
                <label className="text-sm font-medium">Redirect to (optional path or URL)</label>
                <input
                  className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
                  value={form.redirectTo}
                  onChange={(e) => setForm({ ...form, redirectTo: e.target.value })}
                  placeholder="/blog/replacement-article"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                Cover Image <span className="font-normal text-muted-foreground">(optional)</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Posts can be saved and published without a cover image.
              </p>
            </CardHeader>
            <CardContent>
              <CoverImageField
                value={{
                  coverImage: form.coverImage,
                  coverImageFileId: form.coverImageFileId,
                  coverImageSource: form.coverImageSource,
                }}
                onChange={(cover) =>
                  setForm((current) => ({ ...current, ...cover }))
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category & Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="post-category" className="text-sm font-medium">
                  Category *
                </label>
                <select
                  id="post-category"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  required
                  disabled={categories.length === 0}
                >
                  {categories.length === 0 ? (
                    <option value="">No categories available</option>
                  ) : (
                    <>
                      <option value="" disabled>
                        Select a category
                      </option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {categories.length === 0 ? (
                    <>
                      Create a category on the{" "}
                      <Link
                        href="/admin/categories"
                        className="font-medium text-primary underline-offset-2 hover:underline"
                      >
                        categories page
                      </Link>{" "}
                      before saving this post.
                    </>
                  ) : (
                    "Categories are managed separately so topics stay consistent."
                  )}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Tags</label>
                <div className="flex gap-2 mt-1">
                  <input
                    className="flex-1 rounded-md border border-input px-3 py-2 text-sm"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag + Enter"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (
                          tagInput.trim() &&
                          !form.tags.includes(tagInput.trim())
                        ) {
                          setForm({
                            ...form,
                            tags: [...form.tags, tagInput.trim()],
                          });
                          setTagInput("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (
                        tagInput.trim() &&
                        !form.tags.includes(tagInput.trim())
                      ) {
                        setForm({
                          ...form,
                          tags: [...form.tags, tagInput.trim()],
                        });
                        setTagInput("");
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-muted px-2 py-1 rounded-full flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            tags: form.tags.filter((t) => t !== tag),
                          })
                        }
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm({ ...form, featured: e.target.checked })
                  }
                />
                Featured post (homepage highlight)
              </label>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
