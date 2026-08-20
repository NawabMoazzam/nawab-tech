"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Props = {
  value?: string;
  fileId?: string;
  onChange: (url: string, fileId: string) => void;
  folder?: string;
  variant?: "cover" | "avatar";
  uploadLabel?: string;
  fallbackPreview?: string;
};

type UploadResponse = {
  error?: string;
  url?: string;
  fileId?: string;
};

async function readResponse(response: Response): Promise<UploadResponse> {
  try {
    return (await response.json()) as UploadResponse;
  } catch {
    return {};
  }
}

export function ImageKitUploader({
  value,
  fileId,
  onChange,
  folder = "/nawab-tech/blog",
  variant = "cover",
  uploadLabel,
  fallbackPreview,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || value) return;

    setUploading(true);
    setError("");

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("fileName", file.name);
      form.append("folder", folder);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const data = await readResponse(response);

      if (!response.ok || !data.url || !data.fileId) {
        throw new Error(data.error || "Upload failed.");
      }

      onChange(data.url, data.fileId);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!fileId) {
      setError(
        "This image is missing its ImageKit file ID and cannot be safely replaced.",
      );
      setDeleteDialogOpen(false);
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/upload?fileId=${encodeURIComponent(fileId)}`,
        { method: "DELETE" },
      );
      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.error || "Image could not be deleted.");
      }

      // Clear the form only after ImageKit confirms deletion. This prevents a
      // replacement upload from leaving the previous file orphaned.
      onChange("", "");
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Image could not be deleted.",
      );
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const isAvatar = variant === "avatar";

  return (
    <div className="space-y-3">
      {value ? (
        <div className={isAvatar ? "max-w-52" : "w-full"}>
          <div
            className={`relative overflow-hidden rounded-md border bg-muted ${
              isAvatar ? "aspect-square" : "h-48 w-full"
            }`}
          >
            <Image
              src={value}
              alt={isAvatar ? "Client avatar preview" : "Cover image preview"}
              fill
              sizes={isAvatar ? "208px" : "(max-width: 1024px) 100vw, 420px"}
              className="object-cover"
            />
          </div>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            type="button"
            className="mt-3"
            disabled={deleting || uploading}
          >
            {deleting ? (
              <Loader2 className="mr-1 animate-spin" />
            ) : (
              <Trash2 className="mr-1" />
            )}
            {deleting ? "Deleting…" : "Delete image"}
          </Button>
        </div>
      ) : (
        <>
          <div
            className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed text-center text-muted-foreground ${
              isAvatar ? "aspect-square max-w-52 p-6" : "p-8"
            }`}
          >
            {fallbackPreview ? (
              <div className="relative size-24 overflow-hidden rounded-full border border-border bg-background">
                <Image
                  src={fallbackPreview}
                  alt="Default avatar preview"
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
            ) : (
              <ImageIcon size={24} strokeWidth={1.5} />
            )}
            <p className="mt-2 text-sm">
              {fallbackPreview
                ? "Using the default avatar"
                : isAvatar
                  ? "No avatar selected"
                  : "No image selected"}
            </p>
          </div>

          <label htmlFor={inputId} className="block w-fit cursor-pointer">
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="sr-only"
              disabled={uploading || deleting}
            />
            <span className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted">
              {uploading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Upload />
              )}
              {uploading
                ? "Uploading…"
                : uploadLabel || (isAvatar ? "Upload avatar" : "Upload cover")}
            </span>
          </label>
        </>
      )}

      {value ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Deletion is immediate. Delete this image before uploading a replacement,
          then save the form.
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => void handleDelete()}
        title={`Delete ${isAvatar ? "avatar" : "image"}?`}
        description="This permanently removes the file from ImageKit. You cannot undo this action."
        confirmLabel="Delete permanently"
        busy={deleting}
      />
    </div>
  );
}
