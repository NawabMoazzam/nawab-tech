import type { Metadata } from "next";
import { Cable, GitBranch, RefreshCw, Workflow } from "lucide-react";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ServiceBenefits } from "@/components/service-page/service-benefits";
import { ServiceCTA } from "@/components/service-page/service-cta";
import { ServiceDeliverables } from "@/components/service-page/service-deliverables";
import { ServiceHero } from "@/components/service-page/service-hero";

export const metadata: Metadata = {
  title: "API Integration & Business Automation",
  description:
    "Nawab Tech connects business tools, APIs, and platforms to reduce repetitive work and create more connected digital workflows.",
  alternates: {
    canonical: "/services/api-integrations",
  },
};

const benefits = [
  {
    icon: Cable,
    title: "Connect your tools",
    description:
      "Bring the systems your business already uses together so information can move between them without constant manual work.",
  },
  {
    icon: Workflow,
    title: "Automate repetitive work",
    description:
      "Replace repetitive data entry and manual processes with reliable automated workflows.",
  },
  {
    icon: RefreshCw,
    title: "Keep information in sync",
    description:
      "Create integrations that help keep important business information consistent across connected platforms.",
  },
  {
    icon: GitBranch,
    title: "Built around your systems",
    description:
      "We work with the APIs and platforms your business already depends on instead of forcing unnecessary replacements.",
  },
];

const deliverables = [
  "REST API integrations",
  "Third-party API connections",
  "Payment gateway integrations",
  "CRM integrations",
  "Marketing platform integrations",
  "Data synchronisation",
  "Automated business workflows",
  "Custom backend integrations",
];

export default function ApiIntegrationsPage() {
  return (
    <>
      <Navbar />

      <main>
        <ServiceHero
          eyebrow="Nawab Tech / API Integrations"
          title={
            <>
              Make your
              <br />
              systems work
              <br />
              <span className="text-primary">together.</span>
            </>
          }
          description="We connect the tools your business already uses and automate the flow of information between them, reducing manual work and creating more efficient workflows."
        />

        <ServiceBenefits benefits={benefits} />

        <ServiceDeliverables
          eyebrow="What we can build"
          title={
            <>
              Less manual
              <br />
              work.
              <br />
              <span className="text-primary">More flow.</span>
            </>
          }
          items={deliverables}
        />

        <ServiceCTA
          title={
            <>
              Still moving
              <br />
              data between
              <br />
              systems manually?
            </>
          }
          description="Tell us which tools you're using and what information you currently have to move or manage by hand."
        />
      </main>

      <Footer />
    </>
  );
}
