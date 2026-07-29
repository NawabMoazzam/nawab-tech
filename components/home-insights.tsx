import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { getAllPosts } from "@/lib/blog/posts";

export function HomeInsights() {
  const posts = getAllPosts().slice(0, 3);

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="section-border">
      <div className="container-main">
        <div className="grid border-x border-border lg:grid-cols-12">
          <div className="p-6 sm:p-10 lg:col-span-4 lg:p-14">
            <div className="eyebrow text-muted-foreground">
              From the insights
            </div>

            <h2 className="section-title mt-8">
              Ideas for building
              <br />
              <span className="text-primary">better digital products.</span>
            </h2>
          </div>

          <div className="border-t border-border lg:col-span-8 lg:border-l lg:border-t-0">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group border-b border-border last:border-b-0"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="block p-6 transition-colors hover:bg-muted/30 sm:p-10 lg:p-12"
                >
                  <div className="flex items-start justify-between gap-8">
                    <div>
                      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                        <span>{post.category.name}</span>
                        <span>·</span>
                        <span>{post.readingTime}</span>
                      </div>

                      <h3 className="max-w-3xl text-2xl font-medium tracking-[-0.04em] sm:text-3xl">
                        {post.title}
                      </h3>

                      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="flex size-10 shrink-0 items-center justify-center border border-border transition-colors group-hover:bg-foreground group-hover:text-background">
                      <ArrowUpRight size={17} />
                    </div>
                  </div>
                </Link>
              </article>
            ))}

            <div className="p-6 sm:p-10 lg:p-12">
              <Link
                href="/blog"
                className="group inline-flex items-center gap-3 text-sm font-medium"
              >
                Explore all insights
                <ArrowUpRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
