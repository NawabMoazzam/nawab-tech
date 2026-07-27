import type { Metadata } from "next";
import { BarChart3, Eye, Gauge, LayoutDashboard } from "lucide-react";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ServiceBenefits } from "@/components/service-page/service-benefits";
import { ServiceCTA } from "@/components/service-page/service-cta";
import { ServiceDeliverables } from "@/components/service-page/service-deliverables";
import { ServiceHero } from "@/components/service-page/service-hero";

export const metadata: Metadata = {
  title: "Custom Dashboard Development",
  description:
    "Nawab Tech builds custom business dashboards that bring important data, metrics, and workflows into one clear and actionable interface.",
  alternates: {
    canonical: "/services/dashboard-development",
  },
};

const benefits = [
  {
    icon: Eye,
    title: "See what matters",
    description:
      "Bring important information into one place so your team can understand what's happening without searching across multiple tools.",
  },
  {
    icon: BarChart3,
    title: "Turn data into decisions",
    description:
      "Present business metrics in a way that makes trends, problems, and opportunities easier to identify.",
  },
  {
    icon: LayoutDashboard,
    title: "Designed for your workflow",
    description:
      "Your dashboard should show the information your team actually needs rather than forcing everyone to work around generic software.",
  },
  {
    icon: Gauge,
    title: "Fast and responsive",
    description:
      "We focus on responsive interfaces and efficient data handling so your dashboard remains useful as the amount of data grows.",
  },
];

const deliverables = [
  "Business intelligence dashboards",
  "Analytics dashboards",
  "Sales dashboards",
  "Marketing dashboards",
  "Employee performance dashboards",
  "Financial reporting dashboards",
  "Admin dashboards",
  "Real-time data visualisation",
];

export default function DashboardDevelopmentPage() {
  return (
    <>
      <Navbar />

      <main>
        <ServiceHero
          eyebrow="Nawab Tech / Dashboard Development"
          title={
            <>
              Make your
              <br />
              business data
              <br />
              <span className="text-primary">easier to see.</span>
            </>
          }
          description="We build custom dashboards that bring your most important data, metrics, and workflows together so your team can understand what's happening and act faster."
        />

        <ServiceBenefits benefits={benefits} />

        <ServiceDeliverables
          eyebrow="What we can build"
          title={
            <>
              One view.
              <br />
              Better
              <br />
              <span className="text-primary">decisions.</span>
            </>
          }
          items={deliverables}
        />

        <ServiceCTA
          title={
            <>
              Tired of
              <br />
              managing your
              <br />
              business in spreadsheets?
            </>
          }
          description="Tell us what you're currently tracking, where your data lives, and what you wish you could see at a glance."
        />
      </main>

      <Footer />
    </>
  );
}
