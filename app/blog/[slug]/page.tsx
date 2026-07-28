import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { getAllPosts, getPostBySlug } from "@/lib/blog/posts";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;

  const post = getPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.seo.title,
    description: post.seo.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: "article",
      title: post.seo.title,
      description: post.seo.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seo.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: {
      "@type": "Organization",
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "Nawab Tech",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://nawabtech.com/blog/${post.slug}`,
    },
  };

  return (
    <>
      <Navbar />

      <main>
        <article>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(articleStructuredData),
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

                <div className="mt-16 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.1em] text-muted-foreground">
                  <span>{post.category.name}</span>

                  <span>•</span>

                  <span>{post.readingTime} min read</span>
                </div>

                <h1 className="display-text mt-8 max-w-6xl">{post.title}</h1>

                <p className="mt-10 max-w-3xl text-xl leading-relaxed text-muted-foreground sm:text-2xl">
                  {post.excerpt}
                </p>

                <div className="mt-10 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{post.author.name}</span>

                  <span>•</span>

                  <time dateTime={post.publishedAt}>
                    {new Intl.DateTimeFormat("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(post.publishedAt))}
                  </time>
                </div>
              </div>
            </div>
          </section>

          <section className="section-border">
            <div className="container-main">
              <div className="border-x border-border">
                <div className="mx-auto max-w-3xl px-6 py-16 sm:px-10 sm:py-20 lg:py-24">
                  <div className="whitespace-pre-line text-lg leading-[1.8] text-foreground/90">
                    {post.content}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </>
  );
}
