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
import { Image } from "@imagekit/next";
import { urlEndpoint } from "@/lib/imagekit";
import { articleSchema } from "@/lib/schema-markup";
import Script from "next/script";
import AdsterraBanner from "@/components/AdsterraBanner";

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

  return {
    title: post.seo?.title || `${post.title} | Nawab Tech`,
    description: post.seo?.description || post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: "article",
      title: post.seo?.title || post.title,
      description: post.seo?.description || post.excerpt,
      publishedTime: post.publishedAt
        ? new Date(post.publishedAt).toISOString()
        : undefined,
      modifiedTime: post.updatedAt
        ? new Date(post.updatedAt).toISOString()
        : undefined,
      authors: [post.author?.name || "Nawab Tech"],
      tags: post.tags,
      images: post.coverImage ? [post.coverImage] : undefined,
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
      {/* <Script id="adsterra-config" strategy="afterInteractive">
        {`
            window.atOptions = {
              'key' : '30857032',
              'format' : 'iframe',
              'height' : 250,
              'width' : 300,
              'params' : {}
            };
          `}
      </Script>
      <Script
        src="https://recallscarce.com/1b/be/fc/1bbefc53739325cc426f5382741da6cb.js"
        strategy="afterInteractive"
      /> */}
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

                <div className="mt-16 flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
                  <span>{post.category.name}</span>

                  <span>•</span>

                  <span>{post.readingTime} min read</span>
                </div>

                <h1 className="display-text mt-8 max-w-6xl">{post.title}</h1>

                <p className="mt-10 max-w-3xl text-xl leading-relaxed text-muted-foreground sm:text-2xl">
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

                {post.coverImage && (
                  <div className="mt-12">
                    <Image
                      urlEndpoint={urlEndpoint}
                      src={post.coverImage}
                      alt={post.title}
                      width={1280}
                      height={720}
                      priority
                      className="w-full aspect-video object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="section-border">
            <div className="container-main">
              <div className="border-x border-border">
                <AdsterraBanner />
                <div className="mx-auto max-w-3xl px-6 py-16 sm:px-10 sm:py-20 lg:py-24">
                  <ArticleContent content={post.content || ""} />
                </div>
                <AdsterraBanner />
              </div>
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </>
  );
}
