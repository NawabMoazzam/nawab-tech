import type { Metadata } from "next";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { BlogCard } from "@/components/blog/blog-card";
import { BlogTopics } from "@/components/blog/blog-topics";
import { FeaturedPost } from "@/components/blog/featured-post";
import { getAllPosts, getFeaturedPosts } from "@/lib/blog/posts";

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
  const featuredPost = getFeaturedPosts()[0];

  const latestPosts = posts.filter((post) => post.slug !== featuredPost?.slug);

  return (
    <>
      <Navbar />

      <main>
        {/* Hero */}
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

        {/* Featured */}
        {featuredPost && (
          <section className="section-border">
            <div className="container-main">
              <FeaturedPost post={featuredPost} />
            </div>
          </section>
        )}

        {/* Latest */}
        <section className="section-border">
          <div className="container-main">
            <div className="border-x border-border">
              <div className="p-6 sm:p-10 lg:p-14">
                <div className="eyebrow text-muted-foreground">
                  Latest insights
                </div>

                <h2 className="section-title mt-8">
                  Things worth
                  <br />
                  <span className="text-primary">knowing.</span>
                </h2>
              </div>

              <div className="border-t border-border">
                {latestPosts.length > 0 ? (
                  latestPosts.map((post, index) => (
                    <BlogCard key={post.slug} post={post} index={index} />
                  ))
                ) : (
                  <div className="p-6 text-muted-foreground sm:p-10">
                    More insights are on the way.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Topics */}
        <BlogTopics />

        {/* CTA */}
        <section className="section-border">
          <div className="container-main">
            <div className="border-x border-border bg-foreground p-6 text-background sm:p-10 lg:p-20">
              <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
                <div>
                  <div className="eyebrow text-background/60">
                    Have a project in mind?
                  </div>

                  <h2 className="mt-8 max-w-3xl text-4xl font-medium leading-[0.95] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
                    Let&apos;s turn the idea into something real.
                  </h2>
                </div>

                <div className="lg:flex lg:justify-end">
                  <a
                    href="/contact"
                    className="group flex w-fit items-center gap-3 bg-background px-7 py-4 text-sm font-medium text-foreground transition-transform hover:-translate-y-1"
                  >
                    Start a project
                    <span className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                      ↗
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
