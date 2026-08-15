"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Trash2 } from "lucide-react";

type Props = {
  value?: string;
  fileId?: string;
  onChange: (url: string, fileId: string) => void;
  folder?: string;
};

export function ImageKitUploader({ value, fileId, onChange, folder = "/nawab-tech/blog" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("fileName", file.name);
      form.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onChange(data.url, data.fileId);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!fileId) {
      onChange("", "");
      return;
    }
    try {
      await fetch(`/api/admin/upload?fileId=${fileId}`, { method: "DELETE" });
      onChange("", "");
    } catch {
      onChange("", "");
    }
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative group">
          <img src={value} alt="cover" className="w-full h-48 object-cover rounded-md border" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
            <Button size="sm" variant="secondary" onClick={handleDelete} type="button">
              <Trash2 size={14} className="mr-1" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-md p-8 text-center text-muted-foreground">
          <ImageIcon />
          <p className="text-sm mt-2">No image selected</p>
        </div>
      )}

      <div className="flex gap-2">
        <label className="flex-1 cursor-pointer">
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" id="file-upload" />
          <Button type="button" variant="outline" className="w-full cursor-pointer pointer-events-none" disabled={uploading}>
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {uploading ? "Uploading..." : value ? "Change Image" : "Upload Cover"}
          </Button>
        </label>
      </div>

      {value && (
        <p className="text-[11px] text-muted-foreground break-all">
          URL: {value}
          <br />
          Tip: ImageKit will auto serve WebP/AVIF via ?tr=w-800
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function ImageIcon() {
  return (
    <div className="mx-auto w-8 h-8 rounded bg-muted flex items-center justify-center">
      <Upload size={16} />
    </div>
  );
}
