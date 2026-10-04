import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getFeaturedPost } from "@/lib/blog/queries";

import { PostCover } from "@/components/blog/post-cover";

export async function HomeInsights() {
  const posts = await getFeaturedPost();

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
              <article key={post.slug} className="group border-b border-border">
                <Link
                  href={`/blog/${post.slug}`}
                  className="block p-6 transition-colors hover:bg-muted/30 sm:p-10 lg:p-12"
                >
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
                    <PostCover
                      src={post.coverImage}
                      alt={post.title}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 160px, 224px"
                      className="aspect-[16/10] w-full shrink-0 border border-border sm:w-40 lg:w-56"
                      imageClassName="transition-transform duration-700 group-hover:scale-105"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                        <span>{post.category.name}</span>
                        <span>·</span>
                        <span>{post.readingTime} min read</span>
                      </div>

                      <h3 className="max-w-3xl text-2xl font-medium tracking-[-0.04em] sm:text-3xl">
                        {post.title}
                      </h3>

                      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="flex size-10 shrink-0 items-center justify-center self-end border border-border transition-colors group-hover:bg-foreground group-hover:text-background sm:self-start">
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
