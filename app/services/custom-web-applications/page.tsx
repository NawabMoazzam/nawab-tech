import type { Metadata } from "next";
import { Boxes, Database, Layers3, Workflow } from "lucide-react";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ServiceBenefits } from "@/components/service-page/service-benefits";
import { ServiceCTA } from "@/components/service-page/service-cta";
import { ServiceDeliverables } from "@/components/service-page/service-deliverables";
import { ServiceHero } from "@/components/service-page/service-hero";

export const metadata: Metadata = {
  title: "Custom Web Application Development",
  description:
    "Nawab Tech builds custom web applications that help businesses replace manual processes, connect systems, and create better digital workflows.",
  alternates: {
    canonical: "/services/custom-web-applications",
  },
};

const benefits = [
  {
    icon: Workflow,
    title: "Built around your workflow",
    description:
      "Instead of forcing your business into an off-the-shelf tool, we build software around the way your team actually works.",
  },
  {
    icon: Layers3,
    title: "Designed for real users",
    description:
      "We focus on clear interfaces and practical user experiences so your team can get work done without unnecessary complexity.",
  },
  {
    icon: Database,
    title: "Structured data",
    description:
      "Your application's data is organised around your business requirements, giving you a reliable foundation for future growth.",
  },
  {
    icon: Boxes,
    title: "Built to evolve",
    description:
      "We create a foundation that can grow with your business rather than becoming a technical dead end.",
  },
];

const deliverables = [
  "Custom business applications",
  "Internal business tools",
  "Client portals",
  "Customer management systems",
  "Workflow management platforms",
  "Role-based applications",
  "Authentication and user management",
  "Third-party service integrations",
];

export default function CustomWebApplicationsPage() {
  return (
    <>
      <Navbar />

      <main>
        <ServiceHero
          eyebrow="Nawab Tech / Custom Web Applications"
          title={
            <>
              Software built
              <br />
              around how
              <br />
              <span className="text-primary">you work.</span>
            </>
          }
          description="We build custom web applications that turn complicated workflows, disconnected tools, and repetitive processes into focused digital systems."
        />

        <ServiceBenefits benefits={benefits} />

        <ServiceDeliverables
          eyebrow="What we can build"
          title={
            <>
              Your workflow.
              <br />
              Your
              <br />
              <span className="text-primary">software.</span>
            </>
          }
          items={deliverables}
        />

        <ServiceCTA
          title={
            <>
              Have a process
              <br />
              that should be
              <br />a lot simpler?
            </>
          }
          description="Tell us what you're currently doing manually, what tools you're using, and where the process breaks down."
        />
      </main>

      <Footer />
    </>
  );
}
