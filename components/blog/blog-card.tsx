import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { BlogPost } from "@/lib/blog/types";

type BlogCardProps = {
  post: BlogPost;
  index?: number;
};

export function BlogCard({ post, index }: BlogCardProps) {
  return (
    <article className="group border-b border-border last:border-b-0">
      <Link
        href={`/blog/${post.slug}`}
        className="grid gap-6 p-6 transition-colors hover:bg-muted/40 sm:p-8 lg:grid-cols-12 lg:gap-10 lg:p-10"
      >
        <div className="lg:col-span-1">
          <span className="text-xs text-muted-foreground">
            {index !== undefined ? String(index + 1).padStart(2, "0") : "—"}
          </span>
        </div>

        <div className="lg:col-span-8">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.1em] text-muted-foreground">
            <span>{post.category.name}</span>

            <span>•</span>

            <span>{post.readingTime} min read</span>
          </div>

          <h3 className="mt-5 max-w-3xl text-2xl font-medium tracking-[-0.04em] transition-colors group-hover:text-primary sm:text-3xl">
            {post.title}
          </h3>

          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        </div>

        <div className="flex items-end justify-between lg:col-span-3 lg:items-center lg:justify-end">
          <time
            dateTime={post.publishedAt}
            className="text-xs text-muted-foreground"
          >
            {new Intl.DateTimeFormat("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(new Date(post.publishedAt))}
          </time>

          <div className="ml-6 flex size-11 shrink-0 items-center justify-center border border-border transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:bg-foreground group-hover:text-background">
            <ArrowUpRight size={17} />
          </div>
        </div>
      </Link>
    </article>
  );
}
