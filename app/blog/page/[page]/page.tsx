import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { BlogCard } from "@/components/blog/blog-card";
import { BlogPagination } from "@/components/blog/blog-pagination";
import { BlogTopics } from "@/components/blog/blog-topics";
import { getAllPublishedPosts } from "@/lib/blog/queries";
import type { BlogPost } from "@/lib/blog/types";
import { AdsterraLeaderboard } from "@/components/adsterra-ads/AdsterraBanner";
import AdsterraSocialBar from "@/components/adsterra-ads/AdsterraSocialBar";

const POSTS_PER_PAGE = 12;

type Props = {
  params: Promise<{ page: string }>;
};

export const revalidate = 3600;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  const pageNum = Number.parseInt(page, 10);
  if (!Number.isFinite(pageNum) || pageNum <= 1) {
    return {
      title: "Insights & Resources",
      alternates: { canonical: "/blog" },
    };
  }

  return {
    title: `Insights & Resources - Page ${pageNum}`,
    description:
      "Practical insights about web development, business websites, custom software, dashboards, automation, and digital products from Nawab Tech.",
    alternates: {
      canonical: `/blog/page/${pageNum}`,
    },
  };
}

export default async function BlogPagePaginated({ params }: Props) {
  const { page } = await params;
  const pageNum = Number.parseInt(page, 10);

  if (!Number.isFinite(pageNum) || pageNum < 1) {
    notFound();
  }
  if (pageNum === 1) {
    redirect("/blog");
  }

  const posts = await getAllPublishedPosts();
  const featuredPost = posts.find((p: BlogPost) => p.featured) || posts[0];
  const latestPosts = posts.filter((post) => post.slug !== featuredPost?.slug);
  const totalPages = Math.max(1, Math.ceil(latestPosts.length / POSTS_PER_PAGE));

  if (pageNum > totalPages) {
    notFound();
  }

  const currentPage = pageNum;
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = latestPosts.slice(start, start + POSTS_PER_PAGE);

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

              <p
                data-reveal="up"
                style={{ transitionDelay: "240ms" }}
                className="mt-12 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
              >
                Practical guides, insights, and ideas about websites, software,
                automation, and digital systems for modern businesses.
              </p>
            </div>
          </div>
        </section>

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
                {paginatedPosts.length > 0 ? (
                  paginatedPosts.map((post, index) => (
                    <BlogCard key={post.slug} post={post} index={index} />
                  ))
                ) : (
                  <div className="p-6 text-muted-foreground sm:p-10">
                    No posts on this page.
                  </div>
                )}
                <BlogPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                />
                <div className="p-6 flex justify-center">
                  <AdsterraLeaderboard />
                </div>
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
      <AdsterraSocialBar />
    </>
  );
}
