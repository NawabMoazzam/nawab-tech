import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { BlogCard } from "@/components/blog/blog-card";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import {
  getAllCategoriesFromDB,
  getCategoryBySlugFromDB,
} from "@/lib/categories";
import { getPostsByCategoryFromDB } from "@/lib/blog/queries";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export async function generateStaticParams() {
  const categories = await getAllCategoriesFromDB();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlugFromDB(slug);

  if (!category) return {};

  return {
    title: `${category.name} Insights | Nawab Tech`,
    description:
      category.description ||
      `Explore Nawab Tech insights and practical guides about ${category.name.toLowerCase()}.`,
    alternates: {
      canonical: `/blog/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [category, posts] = await Promise.all([
    getCategoryBySlugFromDB(slug),
    getPostsByCategoryFromDB(slug),
  ]);

  if (!category) notFound();

  return (
    <>
      <Navbar />

      <main>
        <section className="editorial-grid">
          <div className="container-main">
            <div className="border-x border-border p-6 pt-24 sm:p-10 sm:pt-32 lg:p-20 lg:pt-40">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft size={16} />
                All insights
              </Link>

              <div className="eyebrow mt-16 text-muted-foreground">
                Topic / {category.name}
              </div>

              <h1 className="display-text mt-10 max-w-5xl">
                {category.name}
                <br />
                <span className="text-primary">insights.</span>
              </h1>

              <p
                data-reveal="up"
                style={{ transitionDelay: "240ms" }}
                className="mt-12 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
              >
                {category.description ||
                  "Practical ideas and useful perspectives to help businesses make better decisions about their digital products and systems."}
              </p>
            </div>
          </div>
        </section>

        <section className="section-border">
          <div className="container-main">
            <div className="border-x border-border">
              <div className="border-b border-border p-6 sm:p-10 lg:p-14">
                <div className="eyebrow text-muted-foreground">
                  {posts.length} {posts.length === 1 ? "article" : "articles"}
                </div>
              </div>

              {posts.length > 0 ? (
                posts.map((post, index) => (
                  <BlogCard key={post.slug} post={post} index={index} />
                ))
              ) : (
                <div className="p-6 text-muted-foreground sm:p-10 lg:p-14">
                  No published articles in this topic yet.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="section-border">
          <div className="container-main">
            <div className="border-x border-border p-6 sm:p-10 lg:p-14">
              <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="eyebrow text-muted-foreground">
                    Need something built?
                  </div>

                  <h2 className="mt-5 text-3xl font-medium tracking-tighter">
                    Let&apos;s talk about your project.
                  </h2>
                </div>

                <Link
                  href="/contact"
                  className="premium-button flex w-fit items-center gap-3 bg-primary px-6 py-4 text-sm font-medium text-primary-foreground"
                >
                  Start a project
                  <span>↗</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
