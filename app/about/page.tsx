import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { FounderCard } from "@/components/about/founder-card";
import { HowWeWork } from "@/components/about/how-we-work";
import { TechStack } from "@/components/about/tech-stack";
import { WhatWeBuild } from "@/components/about/what-we-build";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Nawab Tech, a Pakistan-based technology studio building websites, custom web applications, dashboards, and digital systems for businesses globally.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Nawab Tech",
    description:
      "A Pakistan-based technology studio building practical digital products for businesses globally.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* Hero */}
        <section className="editorial-grid">
          <div className="container-main">
            <div className="border-x border-border p-6 pt-24 sm:p-10 sm:pt-32 lg:p-20 lg:pt-40">
              <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
                <div className="eyebrow text-muted-foreground">
                  About Nawab Tech
                </div>

                <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  Based in Pakistan · Working globally
                </div>
              </div>

              <h1 className="display-text mt-12 max-w-6xl">
                Building digital
                <br />
                products around
                <br />
                <span className="text-primary">how businesses work.</span>
              </h1>

              <div className="mt-14 grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-5 lg:col-start-8">
                  <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    Nawab Tech is a technology studio focused on building
                    practical digital products for businesses — from
                    high-performing websites to custom applications, dashboards,
                    and connected systems.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Studio introduction */}
        <section className="section-border">
          <div className="container-main">
            <div className="grid border-x border-border lg:grid-cols-12">
              <div className="p-6 sm:p-10 lg:col-span-4 lg:p-14">
                <div className="eyebrow text-muted-foreground">The studio</div>
              </div>

              <div className="border-t border-border p-6 sm:p-10 lg:col-span-8 lg:border-l lg:border-t-0 lg:p-14">
                <div className="max-w-3xl space-y-8 text-xl leading-relaxed tracking-[-0.02em] sm:text-2xl">
                  <p>
                    Businesses are different. Their processes are different. The
                    way their teams work is different.
                  </p>

                  <p>
                    We believe the technology supporting them should reflect
                    that.
                  </p>

                  <p className="text-muted-foreground">
                    Instead of starting with a template or forcing a business
                    into an off-the-shelf workflow, Nawab Tech focuses on
                    understanding the problem first and building the right
                    digital solution around it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <HowWeWork />

        <WhatWeBuild />

        <TechStack />

        <FounderCard />

        {/* Closing CTA */}
        <section className="section-border">
          <div className="container-main">
            <div className="border-x border-border bg-foreground p-6 text-background sm:p-10 lg:p-20">
              <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-8">
                  <div className="eyebrow text-background/60">
                    Have something in mind?
                  </div>

                  <h2 className="mt-8 max-w-4xl text-4xl font-medium leading-[0.95] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
                    Let&apos;s build something useful.
                  </h2>
                </div>

                <div className="lg:col-span-4 lg:flex lg:justify-end">
                  <Link
                    href="/contact"
                    className="group flex w-fit items-center gap-3 bg-background px-7 py-4 text-sm font-medium text-foreground transition-transform hover:-translate-y-1"
                  >
                    Start a project
                    <span className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                      <ArrowUpRight size={17} />
                    </span>
                  </Link>
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
