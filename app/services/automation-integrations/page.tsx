import type { Metadata } from "next";
import {
  Bot,
  BrainCircuit,
  GitBranch,
  MessageSquareText,
  Workflow,
} from "lucide-react";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ServiceBenefits } from "@/components/service-page/service-benefits";
import { ServiceCTA } from "@/components/service-page/service-cta";
import { ServiceDeliverables } from "@/components/service-page/service-deliverables";
import { ServiceHero } from "@/components/service-page/service-hero";

export const metadata: Metadata = {
  title: "AI Automation & Integration Services",
  description:
    "Automate repetitive business workflows with AI, custom integrations, APIs, and intelligent systems built around the tools your business already uses.",
  alternates: {
    canonical: "/services/automation-integrations",
  },
};

const benefits = [
  {
    icon: BrainCircuit,
    title: "Put AI into real workflows",
    description:
      "Use AI where it creates practical value, from processing information and qualifying leads to assisting teams with everyday business tasks.",
  },
  {
    icon: Workflow,
    title: "Automate repetitive processes",
    description:
      "Turn manual, time-consuming steps into reliable workflows that can run automatically with clear rules and AI where needed.",
  },
  {
    icon: GitBranch,
    title: "Connect your existing tools",
    description:
      "Connect CRMs, payment platforms, communication tools, databases, and other services through APIs and custom integrations.",
  },
  {
    icon: Bot,
    title: "Build intelligent assistants",
    description:
      "Create AI-powered assistants and business tools that can understand requests, work with your data, and help your team get things done faster.",
  },
];

const deliverables = [
  "AI-powered business workflows",
  "AI chatbots and assistants",
  "AI lead qualification",
  "Document and data processing",
  "REST API integrations",
  "CRM and third-party integrations",
  "Automated notifications and follow-ups",
  "Custom AI business tools",
];

export default function AutomationIntegrationsPage() {
  return (
    <>
      <Navbar />

      <main>
        <ServiceHero
          eyebrow="Nawab Tech / AI Automation"
          title={
            <>
              Make your
              <br />
              business work
              <br />
              <span className="text-primary">smarter.</span>
            </>
          }
          description="We build AI-powered automations and integrations that connect your systems, reduce repetitive work, and help your team get more done with less manual effort."
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
              <span className="text-primary">More intelligence.</span>
            </>
          }
          items={deliverables}
        />

        <section className="section-border">
          <div className="container-main grid border-x border-border lg:grid-cols-12">
            <div className="p-6 sm:p-10 lg:col-span-4 lg:p-14">
              <div className="eyebrow text-muted-foreground">AI + integrations</div>
            </div>

            <div className="border-t border-border p-6 sm:p-10 lg:col-span-8 lg:border-l lg:border-t-0 lg:p-14">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="border border-border p-6">
                  <MessageSquareText size={22} strokeWidth={1.5} />
                  <h3 className="mt-8 text-xl font-medium">AI assistants</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Give customers or employees an intelligent interface for finding information and completing routine tasks.
                  </p>
                </div>

                <div className="border border-border p-6">
                  <Workflow size={22} strokeWidth={1.5} />
                  <h3 className="mt-8 text-xl font-medium">Workflow automation</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Connect triggers, business rules, APIs, and AI steps into workflows that keep work moving automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ServiceCTA
          title={
            <>
              Have a process
              <br />
              that still depends
              <br />
              <span className="text-primary">on manual work?</span>
            </>
          }
          description="Tell us what your team does manually today. We can help identify where AI, automation, or integrations can make the process faster and more reliable."
        />
      </main>

      <Footer />
    </>
  );
}
