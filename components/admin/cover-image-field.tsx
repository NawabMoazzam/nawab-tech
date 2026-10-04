"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ImageKitUploader } from "@/components/admin/imagekit-uploader";
import type { CoverImageSource } from "@/lib/cover-image";
import type { PexelsResult } from "@/lib/pexels";
import { cn } from "@/lib/utils";

type CoverImageValue = {
  coverImage: string;
  coverImageFileId: string;
  coverImageSource: CoverImageSource;
};

type CoverImageFieldProps = {
  value: CoverImageValue;
  onChange: (next: CoverImageValue) => void;
};

const TABS: { id: CoverImageSource; label: string; hint: string }[] = [
  {
    id: "upload",
    label: "Upload",
    hint: "Stored in ImageKit and resized by its CDN.",
  },
  {
    id: "external",
    label: "Pexels / URL",
    hint: "Used straight from its own CDN — no ImageKit storage.",
  },
];

export function CoverImageField({ value, onChange }: CoverImageFieldProps) {
  const [source, setSource] = useState<CoverImageSource>(
    value.coverImageSource,
  );
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState<PexelsResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [pexelsAvailable, setPexelsAvailable] = useState<boolean | null>(null);
  // Captured once: if this post started with an ImageKit upload, remind the
  // editor that switching to an external cover does not delete that file.
  const [hadUploadedCover] = useState(
    () =>
      value.coverImageSource === "upload" && Boolean(value.coverImageFileId),
  );
  const [urlDraft, setUrlDraft] = useState(
    value.coverImageSource === "external" ? value.coverImage : "",
  );

  // A missing PEXELS_API_KEY is not an error — the URL field still works.
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const response = await fetch("/api/admin/pexels");
        const data = (await response.json()) as { available?: boolean };
        if (active) setPexelsAvailable(Boolean(data.available));
      } catch {
        if (active) setPexelsAvailable(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  /**
   * Switching tabs is just navigation: the saved cover only changes once a new
   * image is picked, so browsing Pexels never drops an existing upload.
   */
  const selectSource = (next: CoverImageSource) => {
    setSource(next);
    setUrlDraft(
      next === "external" && value.coverImageSource === "external"
        ? value.coverImage
        : "",
    );
  };

  const runSearch = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmed = query.trim();
    if (!trimmed) return;

    setSearching(true);
    setSearchError("");

    try {
      const response = await fetch(
        `/api/admin/pexels?q=${encodeURIComponent(trimmed)}`,
      );
      const data = (await response.json()) as {
        photos?: PexelsResult[];
        error?: string;
      };

      setPhotos(data.photos || []);
      if (data.error) setSearchError(data.error);
      if (!data.photos?.length && !data.error) {
        setSearchError("No photos found. Try a different search.");
      }
    } catch {
      setSearchError("Pexels search failed. You can still paste an image URL.");
    } finally {
      setSearching(false);
    }
  };

  const selectPhoto = (photo: PexelsResult) => {
    setUrlDraft(photo.url);
    onChange({
      coverImage: photo.url,
      coverImageFileId: "",
      coverImageSource: "external",
    });
    setSource("external");
  };

  const applyUrl = () => {
    const trimmed = urlDraft.trim();
    onChange({
      coverImage: trimmed,
      coverImageFileId: "",
      coverImageSource: "external",
    });
  };

  const clearExternal = () => {
    setUrlDraft("");
    onChange({
      coverImage: "",
      coverImageFileId: "",
      coverImageSource: "external",
    });
  };

  const activeTab = TABS.find((tab) => tab.id === source) || TABS[0];

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Cover image source"
        className="grid grid-cols-2 gap-1 rounded-md border border-border bg-muted p-1"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={source === tab.id}
            onClick={() => selectSource(tab.id)}
            className={cn(
              "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
              source === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">{activeTab.hint}</p>

      {source === "upload" ? (
        <ImageKitUploader
          value={value.coverImageSource === "upload" ? value.coverImage : ""}
          fileId={
            value.coverImageSource === "upload" ? value.coverImageFileId : ""
          }
          onChange={(url, fileId) =>
            onChange({
              coverImage: url,
              coverImageFileId: fileId,
              coverImageSource: "upload",
            })
          }
        />
      ) : (
        <div className="space-y-4">
          {pexelsAvailable ? (
            <form onSubmit={runSearch} className="space-y-3">
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search Pexels — e.g. developer laptop"
                  aria-label="Search Pexels"
                />
                <Button type="submit" size="sm" disabled={searching}>
                  {searching ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Search />
                  )}
                  Search
                </Button>
              </div>

              {photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {photos.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => selectPhoto(photo)}
                      className={cn(
                        "group relative aspect-[3/2] overflow-hidden rounded border border-border bg-muted transition-colors",
                        value.coverImage === photo.url
                          ? "border-primary ring-1 ring-primary"
                          : "hover:border-foreground/40",
                      )}
                      title={`Photo by ${photo.photographer}`}
                    >
                      <Image
                        src={photo.thumb}
                        alt={photo.alt || `Photo by ${photo.photographer}`}
                        fill
                        sizes="(max-width: 640px) 45vw, 200px"
                        unoptimized
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : null}

              {searchError ? (
                <p className="text-xs text-muted-foreground">{searchError}</p>
              ) : null}

              <p className="text-[11px] text-muted-foreground">
                Photos are loaded from Pexels directly, so they use no ImageKit
                storage.{" "}
                <a
                  href="https://www.pexels.com/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 underline underline-offset-2"
                >
                  pexels.com
                  <ExternalLink size={11} />
                </a>
              </p>
            </form>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="cover-image-url" className="text-sm font-medium">
              Image URL
            </label>
            <div className="flex gap-2">
              <input
                id="cover-image-url"
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={urlDraft}
                onChange={(event) => setUrlDraft(event.target.value)}
                placeholder="https://images.pexels.com/photos/..."
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={applyUrl}
                disabled={!urlDraft.trim()}
              >
                Use
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              External covers are served straight from this URL.
            </p>

            {hadUploadedCover && value.coverImageSource === "external" ? (
              <p className="text-[11px] text-muted-foreground">
                The previously uploaded file is still in ImageKit. Delete it
                from the Upload tab if you no longer need it.
              </p>
            ) : null}
          </div>

          {value.coverImageSource === "external" && value.coverImage ? (
            <div className="space-y-2">
              <div className="relative h-44 overflow-hidden rounded-md border bg-muted">
                <Image
                  src={value.coverImage}
                  alt="Cover image preview"
                  fill
                  sizes="(max-width: 1024px) 100vw, 420px"
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="truncate">{value.coverImage}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={clearExternal}
                >
                  <Trash2 className="mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
