import type { Metadata } from "next";
import { Code2, Gauge, Globe2, Search } from "lucide-react";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ServiceBenefits } from "@/components/service-page/service-benefits";
import { ServiceCTA } from "@/components/service-page/service-cta";
import { ServiceDeliverables } from "@/components/service-page/service-deliverables";
import { ServiceHero } from "@/components/service-page/service-hero";

export const metadata: Metadata = {
  title: "Web Development Services",
  description:
    "Nawab Tech provides custom web development services for businesses that need fast, modern, SEO-friendly, and scalable websites.",
  alternates: {
    canonical: "/services/web-development",
  },
};

const benefits = [
  {
    icon: Globe2,
    title: "Built around your business",
    description:
      "Your website should communicate what makes your business different instead of looking like another template.",
  },
  {
    icon: Gauge,
    title: "Performance-focused",
    description:
      "Fast loading times, responsive interfaces, and a technical foundation designed for a smooth user experience.",
  },
  {
    icon: Search,
    title: "SEO-friendly architecture",
    description:
      "Semantic HTML, structured metadata, clean URLs, and a site structure designed to help search engines understand your content.",
  },
  {
    icon: Code2,
    title: "Modern technology",
    description:
      "We use modern web technologies to create maintainable, scalable websites that can evolve with your business.",
  },
];

const deliverables = [
  "Business and corporate websites",
  "Marketing websites",
  "Landing pages",
  "Service-based business websites",
  "SEO-focused website architecture",
  "Performance optimisation",
  "CMS and content integrations",
  "Third-party API integrations",
];

export default function WebDevelopmentPage() {
  return (
    <>
      <Navbar />

      <main>
        <ServiceHero
          eyebrow="Nawab Tech / Web Development"
          title={
            <>
              Web development
              <br />
              built around
              <br />
              <span className="text-primary">your business.</span>
            </>
          }
          description="We build modern, high-performing websites that help businesses communicate clearly, build trust, and turn visitors into customers."
        />

        <ServiceBenefits benefits={benefits} />

        <ServiceDeliverables
          title={
            <>
              More than
              <br />
              just a
              <br />
              <span className="text-primary">website.</span>
            </>
          }
          items={deliverables}
        />

        <ServiceCTA
          title={
            <>
              Need a website
              <br />
              that actually
              <br />
              works for your business?
            </>
          }
        />
      </main>

      <Footer />
    </>
  );
}
