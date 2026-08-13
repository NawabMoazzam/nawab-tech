"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageKitUploader } from "./imagekit-uploader";

// MDEditor is client-only
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type PostFormData = {
  _id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: { name: string; slug: string };
  tags: string[];
  coverImage: string;
  coverImageFileId: string;
  status: "draft" | "published";
  featured: boolean;
  seo: { title: string; description: string; keywords: string[] };
};

const initialData: PostFormData = {
  slug: "",
  title: "",
  excerpt: "",
  content: "# Hello World\n\nStart writing your post in markdown...",
  category: { name: "Web Development", slug: "web-development" },
  tags: [],
  coverImage: "",
  coverImageFileId: "",
  status: "draft",
  featured: false,
  seo: { title: "", description: "", keywords: [] },
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function PostForm({ initialPost }: { initialPost?: any }) {
  const router = useRouter();
  const [form, setForm] = useState<PostFormData>(() => {
    if (initialPost) {
      return {
        ...initialData,
        ...initialPost,
        tags: initialPost.tags || [],
        category: initialPost.category || initialData.category,
        seo: initialPost.seo || initialData.seo,
      };
    }
    return initialData;
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

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault();
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
      const url = isEditing ? `/api/admin/posts/${initialPost._id}` : "/api/admin/posts";
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
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={(e) => handleSubmit(e)}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{isEditing ? "Edit Post" : "New Post"}</h1>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/posts")} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="secondary" disabled={saving} onClick={(e) => handleSubmit(e as any, false)}>
            {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button type="button" onClick={(e) => handleSubmit(e as any, true)} disabled={saving}>
            {saving ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>

      {error && <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">{error}</div>}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Content</CardTitle></CardHeader>
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
                    onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                    required
                    placeholder="how-much-does-website-cost"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">URL: /blog/{form.slug || "your-slug"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    className="mt-1 w-full rounded-md border border-input px-3 py-2"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Excerpt * (max 300)</label>
                <textarea
                  className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
                  rows={3}
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  required
                  maxLength={300}
                  placeholder="Short description for SEO and cards..."
                />
                <p className="text-[11px] text-muted-foreground text-right">{form.excerpt.length}/300</p>
              </div>

              <div>
                <label className="text-sm font-medium">Content (Markdown) *</label>
                <div className="mt-2" data-color-mode="light">
                  <MDEditor
                    value={form.content}
                    onChange={(v) => setForm({ ...form, content: v || "" })}
                    height={500}
                    preview="edit"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Supports GFM, code blocks, images via ![alt](url)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>SEO</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">SEO Title</label>
                <input
                  className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
                  value={form.seo.title}
                  onChange={(e) => setForm({ ...form, seo: { ...form.seo, title: e.target.value } })}
                  placeholder="Auto from title + | Nawab Tech"
                />
              </div>
              <div>
                <label className="text-sm font-medium">SEO Description</label>
                <textarea
                  className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
                  value={form.seo.description}
                  onChange={(e) => setForm({ ...form, seo: { ...form.seo, description: e.target.value } })}
                  rows={2}
                  placeholder="Auto from excerpt"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Keywords (comma separated)</label>
                <input
                  className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
                  value={form.seo.keywords.join(", ")}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      seo: { ...form.seo, keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) },
                    })
                  }
                  placeholder="web development, business website"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Cover Image (ImageKit)</CardTitle></CardHeader>
            <CardContent>
              <ImageKitUploader
                value={form.coverImage}
                fileId={form.coverImageFileId}
                onChange={(url, fileId) => setForm({ ...form, coverImage: url, coverImageFileId: fileId })}
              />
              <p className="text-[11px] text-muted-foreground mt-2">
                Complete Free: 20GB BW + 3GB storage. Auto WebP/AVIF on delivery.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Category & Tags</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Category Name</label>
                <input
                  className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
                  value={form.category.name}
                  onChange={(e) => setForm({ ...form, category: { ...form.category, name: e.target.value } })}
                  placeholder="Web Development"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category Slug</label>
                <input
                  className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm font-mono"
                  value={form.category.slug}
                  onChange={(e) => setForm({ ...form, category: { ...form.category, slug: slugify(e.target.value) } })}
                  placeholder="web-development"
                />
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
                        if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
                          setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
                          setTagInput("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
                        setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
                        setTagInput("");
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-muted px-2 py-1 rounded-full flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, tags: form.tags.filter((t) => t !== tag) })}
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
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
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
