"use client";

import { useState } from "react";
import {
  Edit3,
  FolderTree,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { slugify } from "@/lib/slugify";

type Category = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  postCount?: number;
};

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
};

const emptyForm: CategoryForm = {
  name: "",
  slug: "",
  description: "",
};

export function CategoriesManager({
  initialCategories,
  initialError = "",
}: {
  initialCategories: Category[];
  initialError?: string;
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugWasEdited, setSlugWasEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [error, setError] = useState(initialError);
  const [success, setSuccess] = useState("");

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setSlugWasEdited(false);
  };

  const refreshCategories = async () => {
    const response = await fetch("/api/admin/categories", {
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to reload categories.");
    }
    setCategories(data.categories);
  };

  const handleNameChange = (name: string) => {
    setForm((current) => ({
      ...current,
      name,
      slug: slugWasEdited ? current.slug : slugify(name),
    }));
  };

  const startEditing = (category: Category) => {
    setEditingId(category._id);
    setSlugWasEdited(true);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
    });
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        editingId
          ? `/api/admin/categories/${editingId}`
          : "/api/admin/categories",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save category.");
      }

      const message = editingId ? "Category updated." : "Category created.";
      resetForm();
      await refreshCategories();
      setSuccess(message);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Failed to save category.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    setDeletingId(category._id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/categories/${category._id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete category.");
      }

      if (editingId === category._id) resetForm();
      setCategories((current) =>
        current.filter((item) => item._id !== category._id),
      );
      setSuccess("Category deleted.");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Failed to delete category.",
      );
    } finally {
      setDeletingId(null);
      setPendingDelete(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Categories
          </h1>
          <p className="text-sm text-muted-foreground">
            Organise posts and manage the topics shown on the public blog.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {categories.length} {categories.length === 1 ? "category" : "categories"}
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              {editingId ? <Edit3 size={18} /> : <Plus size={18} />}
              {editingId ? "Edit category" : "Add category"}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              The name, URL slug, and description are used on the blog.
            </p>
          </div>
          {editingId ? (
            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
              <RotateCcw size={15} className="mr-2" />
              Cancel edit
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="category-name" className="text-sm font-medium">
                  Name <span className="text-destructive">*</span>
                </label>
                <input
                  id="category-name"
                  value={form.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  required
                  maxLength={100}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Web Development"
                />
              </div>
              <div>
                <label htmlFor="category-slug" className="text-sm font-medium">
                  Slug <span className="text-destructive">*</span>
                </label>
                <input
                  id="category-slug"
                  value={form.slug}
                  onChange={(event) => {
                    setSlugWasEdited(true);
                    setForm((current) => ({
                      ...current,
                      slug: slugify(event.target.value),
                    }));
                  }}
                  required
                  maxLength={120}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
                  placeholder="web-development"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  /blog/category/{form.slug || "category-slug"}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4">
                <label
                  htmlFor="category-description"
                  className="text-sm font-medium"
                >
                  Description
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {form.description.length}/500
                </span>
              </div>
              <textarea
                id="category-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={3}
                maxLength={500}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="What readers can expect from this topic…"
              />
            </div>

            {error ? (
              <div
                role="alert"
                className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </div>
            ) : null}
            {success ? (
              <div
                role="status"
                className="rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400"
              >
                {success}
              </div>
            ) : null}

            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : editingId ? (
                <Edit3 size={16} className="mr-2" />
              ) : (
                <Plus size={16} className="mr-2" />
              )}
              {saving
                ? "Saving…"
                : editingId
                  ? "Save changes"
                  : "Create category"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center p-10 text-center">
            <FolderTree size={32} className="mb-3 text-muted-foreground" />
            <h2 className="font-semibold">No categories yet</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Create the first category above before adding a blog post.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Card key={category._id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="truncate text-lg">
                      {category.name}
                    </CardTitle>
                    <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                      /{category.slug}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                    {category.postCount || 0}{" "}
                    {(category.postCount || 0) === 1 ? "post" : "posts"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {category.description || "No description added."}
                </p>
                <div className="mt-5 flex gap-2 border-t pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => startEditing(category)}
                  >
                    <Edit3 size={14} className="mr-2" /> Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label={`Delete ${category.name}`}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={deletingId === category._id}
                    onClick={() => setPendingDelete(category)}
                  >
                    {deletingId === category._id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={() => pendingDelete && void handleDelete(pendingDelete)}
        title="Delete category?"
        description={
          pendingDelete
            ? `“${pendingDelete.name}” will be permanently deleted. Categories used by posts cannot be deleted.`
            : "This category will be permanently deleted."
        }
        confirmLabel="Delete category"
        busy={Boolean(deletingId)}
      />
    </div>
  );
}
