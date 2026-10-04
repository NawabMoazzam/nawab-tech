import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { BlogPost } from "@/lib/blog/types";
import { PostCover } from "@/components/blog/post-cover";

type RelatedPostsProps = {
  posts: BlogPost[];
};

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts.length) {
    return null;
  }

  return (
    <section className="section-border">
      <div className="container-main">
        <div className="border-x border-border">
          <div className="flex items-end justify-between gap-8 p-6 sm:p-10 lg:p-14">
            <div>
              <div className="eyebrow text-muted-foreground">Keep reading</div>

              <h2 className="section-title mt-6">
                More
                <br />
                insights.
              </h2>
            </div>

            <Link
              href="/blog"
              className="hidden items-center gap-2 text-sm font-medium sm:flex"
            >
              View all
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="border-t border-border">
            {posts.map((post, index) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group grid gap-5 border-b border-border p-6 last:border-b-0 hover:bg-muted/40 sm:grid-cols-12 sm:p-10"
              >
                <span className="text-xs text-muted-foreground sm:col-span-1">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="sm:col-span-6">
                  <div className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                    {post.category.name}
                  </div>

                  <h3 className="mt-4 text-2xl font-medium tracking-[-0.04em] transition-colors group-hover:text-primary">
                    {post.title}
                  </h3>

                  <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>
                </div>

                <PostCover
                  src={post.coverImage}
                  alt={post.title}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 30vw, 280px"
                  className="order-first aspect-[16/10] w-full border border-border sm:order-none sm:col-span-3"
                  imageClassName="transition-transform duration-700 group-hover:scale-105"
                />

                <div className="flex items-center justify-end sm:col-span-2">
                  <span className="flex size-11 items-center justify-center border border-border transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:bg-foreground group-hover:text-background">
                    <ArrowUpRight size={17} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
