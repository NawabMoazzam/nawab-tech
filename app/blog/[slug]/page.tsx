import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import {
  getAllPublishedPosts,
  getPostBySlugWithContent,
} from "@/lib/blog/queries";
import { ArticleContent } from "@/components/blog/article-content";
import { PostCover } from "@/components/blog/post-cover";
import { articleSchema } from "@/lib/schema-markup";
import AdsterraBanner, {
  AdsterraLeaderboard,
} from "@/components/adsterra-ads/AdsterraBanner";
import AdsterraSocialBar from "@/components/adsterra-ads/AdsterraSocialBar";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getAllPublishedPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;

  const post = await getPostBySlugWithContent(slug);

  if (!post) {
    return {};
  }

  const cleanSeoTitle = (post.seo?.title || post.title)
    .replace(/\s*\|\s*Nawab\s*Tech.*$/i, "")
    .trim();
  const seoDescription = post.seo?.description || post.excerpt;
  const seoKeywords =
    post.seo?.keywords && post.seo.keywords.length > 0
      ? post.seo.keywords
      : post.tags;
  const ogImage = post.seo?.ogImage || post.coverImage;

  return {
    title: cleanSeoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: "article",
      title: `${cleanSeoTitle} | Nawab Tech`,
      description: seoDescription,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt
        ? new Date(post.publishedAt).toISOString()
        : undefined,
      modifiedTime: post.updatedAt
        ? new Date(post.updatedAt).toISOString()
        : undefined,
      authors: [post.author?.name || "Nawab Tech"],
      section: post.category?.name,
      tags: seoKeywords,
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${cleanSeoTitle} | Nawab Tech`,
      description: seoDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  const post = await getPostBySlugWithContent(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <Navbar />

      <main>
        <article>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(articleSchema(post)),
            }}
          />

          <section className="editorial-grid">
            <div className="container-main">
              <div className="border-x border-border p-6 pt-24 sm:p-10 sm:pt-32 lg:p-20 lg:pt-40">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft size={16} />
                  Back to insights
                </Link>

                <div
                  data-reveal="up"
                  className="mt-16 flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground"
                >
                  <span>{post.category.name}</span>

                  <span>•</span>

                  <span>{post.readingTime} min read</span>
                </div>

                <h1 className="display-text mt-8 max-w-6xl">{post.title}</h1>

                <p
                  data-reveal="up"
                  style={{ transitionDelay: "120ms" }}
                  className="mt-10 max-w-3xl text-xl leading-relaxed text-muted-foreground sm:text-2xl"
                >
                  {post.excerpt}
                </p>

                <div className="mt-10 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{post.author?.name || "Nawab Tech"}</span>

                  <span>•</span>

                  <time
                    dateTime={
                      post.publishedAt
                        ? new Date(post.publishedAt).toISOString()
                        : ""
                    }
                  >
                    {post.publishedAt
                      ? new Intl.DateTimeFormat("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }).format(new Date(post.publishedAt))
                      : ""}
                  </time>
                </div>

                <div
                  data-reveal="scale"
                  className="mt-12 overflow-hidden rounded-lg"
                >
                  <PostCover
                    src={post.coverImage}
                    alt={post.title}
                    sizes="(max-width: 1280px) 100vw, 1024px"
                    preload
                    placeholder={false}
                    className="aspect-video w-full rounded-lg border border-border"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="section-border">
            <div className="container-main">
              <div className="border-x border-border">
                {/* Responsive three-column layout: left ad | main content | right ads */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Left sidebar - appears on large screens only */}
                  <aside className="hidden lg:flex lg:col-span-1 sticky top-24 min-w-40 flex-col items-center gap-6">
                    <AdsterraBanner variant="160x600" />
                    <AdsterraBanner variant="160x300" />
                  </aside>

                  {/* Main content column */}
                  <main className="lg:col-span-3 mx-auto max-w-3xl px-6 py-16 sm:px-10 sm:py-20 lg:py-24">
                    {/* Top leaderboard — responsive size, only one mounts */}
                    <div className="mb-10 flex justify-center">
                      <AdsterraLeaderboard />
                    </div>

                    <ArticleContent content={post.content || ""} />

                    <div className="flex flex-wrap justify-center gap-6 mt-10">
                      <AdsterraBanner variant="300x250" />
                      <AdsterraBanner variant="300x250" />
                    </div>
                  </main>

                  {/* Right sidebar - appears on large screens only */}
                  <aside className="hidden lg:flex lg:col-span-1 sticky top-24 min-w-40 flex-col items-center gap-6">
                    <AdsterraBanner variant="160x600" />
                    <AdsterraBanner variant="160x300" />
                  </aside>
                </div>
              </div>
            </div>
          </section>
        </article>
      </main>

      <Footer />
      <AdsterraSocialBar />
    </>
  );
}
