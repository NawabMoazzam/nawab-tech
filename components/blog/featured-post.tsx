import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { BlogPost } from "@/lib/blog/types";

type FeaturedPostProps = {
  post: BlogPost;
};

export function FeaturedPost({ post }: FeaturedPostProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block border-x border-border"
    >
      <article className="grid lg:grid-cols-2">
        <div className="relative min-h-[420px] overflow-hidden border-b border-border bg-primary p-6 text-primary-foreground sm:p-10 lg:min-h-[600px] lg:border-b-0 lg:border-r lg:p-14">
          {/* Decorative editorial element */}
          <div className="absolute -right-24 -top-24 size-72 rounded-full border border-primary-foreground/20 transition-transform duration-700 group-hover:scale-125" />

          <div className="absolute bottom-10 right-10 size-32 border border-primary-foreground/20 transition-transform duration-700 group-hover:rotate-12 sm:bottom-14 sm:right-14 sm:size-48" />

          <div className="relative flex h-full flex-col justify-between">
            <div className="eyebrow text-primary-foreground/70">
              Featured insight
            </div>

            <div>
              <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.1em] text-primary-foreground/70">
                <span>{post.category.name}</span>

                <span>•</span>

                <span>{post.readingTime} min read</span>
              </div>

              <h2 className="max-w-xl text-4xl font-medium leading-[0.95] tracking-[-0.06em] sm:text-5xl lg:text-6xl">
                {post.title}
              </h2>
            </div>
          </div>
        </div>

        <div className="flex min-h-[420px] flex-col justify-between p-6 sm:p-10 lg:min-h-[600px] lg:p-14">
          <div>
            <div className="eyebrow text-muted-foreground">
              Why this matters
            </div>

            <p className="mt-8 max-w-xl text-xl leading-relaxed tracking-[-0.02em] sm:text-2xl">
              {post.excerpt}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-6">
            <time
              dateTime={post.publishedAt}
              className="text-xs text-muted-foreground"
            >
              {new Intl.DateTimeFormat("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(new Date(post.publishedAt))}
            </time>

            <div className="flex items-center gap-3 text-sm font-medium">
              Read article
              <span className="flex size-10 items-center justify-center border border-border transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:bg-foreground group-hover:text-background">
                <ArrowUpRight size={17} />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
