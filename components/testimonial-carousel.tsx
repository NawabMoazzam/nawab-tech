"use client";

import Image from "next/image";
import { useRef } from "react";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";

import { Button } from "@/components/ui/button";

type TestimonialCard = {
  _id: string;
  name: string;
  role: string;
  testimonial: string;
  avatar: string;
};

const cardThemes = [
  {
    card: "border-border bg-card text-card-foreground",
    muted: "text-muted-foreground",
    quote: "bg-primary text-primary-foreground",
    footer: "border-border bg-background/70",
  },
  {
    card: "border-primary bg-primary text-primary-foreground",
    muted: "text-primary-foreground/70",
    quote: "bg-primary-foreground text-primary",
    footer: "border-primary-foreground/20 bg-primary-foreground/10",
  },
  {
    card: "border-foreground bg-foreground text-background",
    muted: "text-background/65",
    quote: "bg-background text-foreground",
    footer: "border-background/20 bg-background/10",
  },
];

export function TestimonialCarousel({
  testimonials,
}: {
  testimonials: TestimonialCard[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;

    track.scrollBy({
      left: direction * Math.min(track.clientWidth * 0.82, 580),
      behavior: "smooth",
    });
  };

  return (
    <div className="border-t border-border bg-muted/25 py-6 sm:py-8">
      <div className="flex items-center justify-between gap-4 px-6 sm:px-10 lg:px-14">
        <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
          Scroll to read more
        </p>
        <div className="flex gap-2" aria-label="Testimonial carousel controls">
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="rounded-full"
            aria-label="Previous testimonials"
            onClick={() => scroll(-1)}
          >
            <ArrowLeft />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="rounded-full"
            aria-label="Next testimonials"
            onClick={() => scroll(1)}
          >
            <ArrowRight />
          </Button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-6 pb-5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:px-10 lg:gap-6 lg:px-14 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]"
        aria-label="Client testimonials"
        tabIndex={0}
      >
        {testimonials.map((item, index) => {
          const theme = cardThemes[index % cardThemes.length];

          return (
            <figure
              key={item._id}
              className={`relative flex min-h-[25rem] w-[86vw] max-w-[34rem] shrink-0 snap-start snap-always flex-col justify-between overflow-hidden rounded-[2rem] border p-7 shadow-[0_20px_60px_-36px_rgba(0,0,0,0.55)] sm:w-[30rem] sm:p-9 lg:w-[34rem] ${theme.card}`}
            >
              <div
                className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full border border-current opacity-10"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-16 -left-16 size-40 rounded-full bg-current opacity-[0.04]"
                aria-hidden
              />

              <div className="relative">
                <div className="flex items-start justify-between gap-6">
                  <span
                    className={`flex size-12 items-center justify-center rounded-2xl ${theme.quote}`}
                  >
                    <Quote size={21} strokeWidth={1.5} aria-hidden />
                  </span>
                  <span className={`text-xs tracking-[0.15em] ${theme.muted}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <blockquote className="mt-9 text-xl leading-relaxed tracking-[-0.025em] sm:text-2xl">
                  “{item.testimonial}”
                </blockquote>
              </div>

              <figcaption
                className={`relative mt-10 flex items-center gap-4 rounded-2xl border p-4 backdrop-blur-sm ${theme.footer}`}
              >
                <div className="relative size-14 shrink-0 overflow-hidden rounded-full border border-current/15 bg-background">
                  <Image
                    src={item.avatar || "/avatar.svg"}
                    alt={`${item.name} avatar`}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold">{item.name}</div>
                  <div
                    className={`mt-1 truncate text-xs uppercase tracking-[0.08em] ${theme.muted}`}
                  >
                    {item.role || "Client"}
                  </div>
                </div>
              </figcaption>
            </figure>
          );
        })}
        <div className="w-1 shrink-0" aria-hidden />
      </div>
    </div>
  );
}
