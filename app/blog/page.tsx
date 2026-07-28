import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { getAllPosts } from "@/lib/blog/posts";

export const metadata: Metadata = {
  title: "Insights & Resources",
  description:
    "Practical insights about web development, business websites, custom software, dashboards, automation, and digital products from Nawab Tech.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <Navbar />

      <main>
        <section className="editorial-grid">
          <div className="container-main">
            <div className="border-x border-border p-6 pt-24 sm:p-10 sm:pt-32 lg:p-20 lg:pt-40">
              <div className="eyebrow text-muted-foreground">
                Nawab Tech / Insights
              </div>

              <h1 className="display-text mt-10 max-w-6xl">
                Ideas for
                <br />
                building
                <br />
                <span className="text-primary">better digital products.</span>
              </h1>

              <p className="mt-12 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Practical guides, insights, and ideas about websites, software,
                automation, and digital systems for modern businesses.
              </p>
            </div>
          </div>
        </section>

        <section className="section-border">
          <div className="container-main">
            <div className="border-x border-border">
              {posts.map((post, index) => (
                <article
                  key={post.slug}
                  className="border-b border-border last:border-b-0"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group grid gap-8 p-6 sm:p-10 lg:grid-cols-12 lg:p-14"
                  >
                    <div className="lg:col-span-1">
                      <span className="text-xs text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="lg:col-span-8">
                      <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.1em] text-muted-foreground">
                        <span>{post.category.name}</span>

                        <span>•</span>

                        <span>{post.readingTime} min read</span>
                      </div>

                      <h2 className="mt-6 max-w-4xl text-3xl font-medium tracking-[-0.05em] transition-colors group-hover:text-primary sm:text-5xl">
                        {post.title}
                      </h2>

                      <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">
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

                      <div className="ml-6 flex size-12 shrink-0 items-center justify-center border border-border transition-colors group-hover:bg-foreground group-hover:text-background">
                        <ArrowUpRight size={18} />
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
