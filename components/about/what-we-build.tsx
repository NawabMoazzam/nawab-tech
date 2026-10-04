import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const services = [
  {
    number: "01",
    title: "Websites",
    description:
      "Fast, thoughtful websites that communicate what your business does clearly and turn visitors into opportunities.",
    href: "/services/web-development",
  },
  {
    number: "02",
    title: "Web Applications",
    description:
      "Custom software built around the specific workflows, processes, and requirements of your business.",
    href: "/services/custom-web-applications",
  },
  {
    number: "03",
    title: "Dashboards",
    description:
      "Clear interfaces that bring important business data together and make it easier to understand and act on.",
    href: "/services/dashboard-development",
  },
  {
    number: "04",
    title: "Integrations",
    description:
      "Connecting the tools your business already uses so information moves between systems with less manual work.",
    href: "/services/api-integrations",
  },
];

export function WhatWeBuild() {
  return (
    <section className="section-border">
      <div className="container-main">
        <div className="grid border-x border-border lg:grid-cols-12">
          <div className="p-6 sm:p-10 lg:col-span-4 lg:p-14">
            <div className="eyebrow text-muted-foreground">What we build</div>

            <h2 className="section-title mt-8">
              Technology
              <br />
              with a
              <br />
              <span className="text-primary">purpose.</span>
            </h2>
          </div>

          <div className="border-t border-border lg:col-span-8 lg:border-l lg:border-t-0">
            {services.map((service, index) => (
              <Link
                key={service.number}
                href={service.href}
                data-reveal="up"
                style={{ transitionDelay: `${index * 80}ms` }}
                className="group grid gap-6 border-b border-border p-6 transition-colors last:border-b-0 hover:bg-muted/40 sm:grid-cols-12 sm:p-10"
              >
                <span className="text-xs text-muted-foreground sm:col-span-1">
                  {service.number}
                </span>

                <div className="sm:col-span-10">
                  <h3 className="text-2xl font-medium tracking-[-0.04em] transition-colors group-hover:text-primary sm:text-3xl">
                    {service.title}
                  </h3>

                  <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                </div>

                <div className="flex items-start justify-end sm:col-span-1">
                  <span className="flex size-10 items-center justify-center border border-border transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:bg-foreground group-hover:text-background">
                    <ArrowUpRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
