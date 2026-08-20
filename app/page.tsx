import type { Metadata } from "next";

import { CapabilityStrip } from "@/components/capability-strip";
import { ContactCTA } from "@/components/contact-cta";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { HomeInsights } from "@/components/home-insights";
import { Navbar } from "@/components/navbar";
import { Process } from "@/components/process";
import { Services } from "@/components/services";
import { Testimonials } from "@/components/testimonials";
import { Transformation } from "@/components/transformation";
import { WhyNawabTech } from "@/components/why-nawab-tech";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Web Development & Digital Products",
  description:
    "Nawab Tech builds high-performing websites, custom web applications, business dashboards, and digital systems for businesses in Pakistan and around the world.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <CapabilityStrip />
        <Transformation />
        <Services />
        <Process />
        <WhyNawabTech />
        <Testimonials />
        <FAQ />
        <HomeInsights />
        <ContactCTA />
      </main>

      <Footer />
    </>
  );
}
