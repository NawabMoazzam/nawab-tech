"use client";

import { useEffect, useId, useRef } from "react";
import { Loader2, TriangleAlert, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  busy = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => cancelButtonRef.current?.focus(), 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onOpenChange(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [busy, onOpenChange, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
        aria-label="Close confirmation dialog"
        onClick={() => !busy && onOpenChange(false)}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
      >
        <div className="flex items-start gap-4 p-6">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlert size={20} aria-hidden />
          </div>

          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-lg font-semibold tracking-tight">
              {title}
            </h2>
            <div
              id={descriptionId}
              className="mt-2 text-sm leading-relaxed text-muted-foreground"
            >
              {description}
            </div>
          </div>

          <button
            type="button"
            aria-label="Close dialog"
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            <X size={17} />
          </button>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/35 p-4 sm:flex-row sm:justify-end">
          <Button
            ref={cancelButtonRef}
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? <Loader2 className="mr-2 animate-spin" /> : null}
            {busy ? "Please wait…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
