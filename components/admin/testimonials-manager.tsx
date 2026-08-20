"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Edit3,
  Loader2,
  MessageSquareQuote,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { ImageKitUploader } from "@/components/admin/imagekit-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Testimonial = {
  _id: string;
  name: string;
  role: string;
  testimonial: string;
  avatar: string;
  avatarFileId: string;
  published: boolean;
  order: number;
};

type TestimonialForm = Omit<Testimonial, "_id">;

const DEFAULT_AVATAR = "/avatar.svg";

const emptyForm: TestimonialForm = {
  name: "",
  role: "",
  testimonial: "",
  avatar: DEFAULT_AVATAR,
  avatarFileId: "",
  published: true,
  order: 0,
};

export function TestimonialsManager({
  initialTestimonials,
  initialError = "",
}: {
  initialTestimonials: Testimonial[];
  initialError?: string;
}) {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [form, setForm] = useState<TestimonialForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Testimonial | null>(null);
  const [error, setError] = useState(initialError);
  const [success, setSuccess] = useState("");

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const refreshTestimonials = async () => {
    const response = await fetch("/api/admin/testimonials", {
      cache: "no-store",
    });
    const data = (await response.json()) as {
      error?: string;
      testimonials?: Testimonial[];
    };

    if (!response.ok || !data.testimonials) {
      throw new Error(data.error || "Failed to reload testimonials.");
    }

    setTestimonials(data.testimonials);
  };

  const startEditing = (testimonial: Testimonial) => {
    setEditingId(testimonial._id);
    setForm({
      name: testimonial.name,
      role: testimonial.role,
      testimonial: testimonial.testimonial,
      avatar: testimonial.avatar || DEFAULT_AVATAR,
      avatarFileId: testimonial.avatarFileId || "",
      published: testimonial.published,
      order: testimonial.order,
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
          ? `/api/admin/testimonials/${editingId}`
          : "/api/admin/testimonials",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to save testimonial.");
      }

      const message = editingId
        ? "Testimonial updated."
        : "Testimonial created.";
      resetForm();
      await refreshTestimonials();
      setSuccess(message);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Failed to save testimonial.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (testimonial: Testimonial) => {
    setDeletingId(testimonial._id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/testimonials/${testimonial._id}`,
        { method: "DELETE" },
      );
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete testimonial.");
      }

      if (editingId === testimonial._id) resetForm();
      setTestimonials((current) =>
        current.filter((item) => item._id !== testimonial._id),
      );
      setSuccess("Testimonial deleted.");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Failed to delete testimonial.",
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
            Testimonials
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage the client feedback displayed on the homepage.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {testimonials.length}{" "}
          {testimonials.length === 1 ? "testimonial" : "testimonials"}
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              {editingId ? <Edit3 size={18} /> : <Plus size={18} />}
              {editingId ? "Edit testimonial" : "Add testimonial"}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Add the client’s words and identity. A custom avatar is optional.
            </p>
          </div>
          {editingId ? (
            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
              <RotateCcw className="mr-2" /> Cancel edit
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_15rem]">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="testimonial-name"
                      className="text-sm font-medium"
                    >
                      Client name <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="testimonial-name"
                      value={form.name}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      required
                      maxLength={100}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Ayesha Khan"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="testimonial-role"
                      className="text-sm font-medium"
                    >
                      Role or company
                    </label>
                    <input
                      id="testimonial-role"
                      value={form.role}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          role: event.target.value,
                        }))
                      }
                      maxLength={140}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Founder, Example Co."
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <label
                      htmlFor="testimonial-copy"
                      className="text-sm font-medium"
                    >
                      Testimonial <span className="text-destructive">*</span>
                    </label>
                    <span className="text-[11px] text-muted-foreground">
                      {form.testimonial.length}/1500
                    </span>
                  </div>
                  <textarea
                    id="testimonial-copy"
                    value={form.testimonial}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        testimonial: event.target.value,
                      }))
                    }
                    required
                    minLength={10}
                    maxLength={1500}
                    rows={6}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed"
                    placeholder="What did the client say about working with Nawab Tech?"
                  />
                </div>

                <div>
                  <label
                    htmlFor="testimonial-order"
                    className="text-sm font-medium"
                  >
                    Display order
                  </label>
                  <div className="flex gap-4 items-center justify-between">
                    <input
                      id="testimonial-order"
                      type="number"
                      min={0}
                      max={9999}
                      step={1}
                      value={form.order}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          order: Number(event.target.value),
                        }))
                      }
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    <label className="flex min-h-10 items-center gap-2 rounded-md border border-input px-3 text-sm">
                      <input
                        type="checkbox"
                        checked={form.published}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            published: event.target.checked,
                          }))
                        }
                      />
                      Show on homepage
                    </label>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Lower numbers appear first.
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">
                  Client avatar{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </p>
                <ImageKitUploader
                  value={form.avatarFileId ? form.avatar : ""}
                  fileId={form.avatarFileId}
                  folder="/nawab-tech/testimonials"
                  variant="avatar"
                  uploadLabel="Upload custom avatar"
                  fallbackPreview={DEFAULT_AVATAR}
                  onChange={(avatar, avatarFileId) =>
                    setForm((current) => ({
                      ...current,
                      avatar: avatar || DEFAULT_AVATAR,
                      avatarFileId: avatarFileId || "",
                    }))
                  }
                />
              </div>
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
                <Loader2 className="mr-2 animate-spin" />
              ) : editingId ? (
                <Edit3 className="mr-2" />
              ) : (
                <Plus className="mr-2" />
              )}
              {saving
                ? "Saving…"
                : editingId
                  ? "Save changes"
                  : "Create testimonial"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {testimonials.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center p-10 text-center">
            <MessageSquareQuote
              size={32}
              className="mb-3 text-muted-foreground"
            />
            <h2 className="font-semibold">No testimonials yet</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Add client feedback above and publish it when it is ready.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {testimonials.map((item) => (
            <Card key={item._id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-full border bg-muted">
                      <Image
                        src={item.avatar}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold">{item.name}</h2>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.role || "Client"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[11px] ${
                      item.published
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.published ? "Published" : "Hidden"}
                  </span>
                </div>

                <blockquote className="mt-5 line-clamp-5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  “{item.testimonial}”
                </blockquote>

                <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4">
                  <span className="text-xs text-muted-foreground">
                    Order {item.order}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(item)}
                    >
                      <Edit3 className="mr-2" /> Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label={`Delete ${item.name} testimonial`}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={deletingId === item._id}
                      onClick={() => setPendingDelete(item)}
                    >
                      {deletingId === item._id ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Trash2 />
                      )}
                    </Button>
                  </div>
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
        title="Delete testimonial?"
        description={
          pendingDelete
            ? `This will permanently delete ${pendingDelete.name}’s testimonial${
                pendingDelete.avatarFileId ? " and its ImageKit avatar" : ""
              }.`
            : "This testimonial will be permanently deleted."
        }
        confirmLabel="Delete testimonial"
        busy={Boolean(deletingId)}
      />
    </div>
  );
}
