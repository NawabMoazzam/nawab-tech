import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { WebsiteCostCalculator } from "@/components/tools/website-cost-calculator";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Website & Web App Cost Calculator",
  description:
    "Estimate a planning range in USD for a business website, ecommerce project, custom web app, or workflow automation. See the assumptions behind the estimate.",
  alternates: { canonical: "/tools/website-cost-calculator" },
  openGraph: {
    title: "Website & Web App Cost Calculator | Nawab Tech",
    description: "Build a practical USD project estimate and see what assumptions affect it.",
    url: "/tools/website-cost-calculator",
    type: "website",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Website & Web App Cost Calculator",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: metadata.description,
  url: `${siteConfig.url}/tools/website-cost-calculator`,
  creator: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
};

export default function WebsiteCostCalculatorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <Navbar />
      <main>
        <section className="editorial-grid">
          <div className="container-main">
            <div className="border-x border-border px-6 pb-14 pt-24 sm:px-10 sm:pt-32 lg:px-20 lg:pt-40">
              <p className="eyebrow text-muted-foreground">Free planning tool</p>
              <h1 className="display-text mt-8 max-w-5xl">What might your <span className="text-primary">project cost?</span></h1>
              <p className="mt-8 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Choose the scope you have in mind to see an indicative USD range. The estimate is transparent about its assumptions—and is a starting point for a conversation, not a quote.
              </p>
            </div>
          </div>
        </section>
        <section className="section-border">
          <div className="container-main">
            <div className="border-x border-border p-6 sm:p-10 lg:p-14">
              <WebsiteCostCalculator />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
