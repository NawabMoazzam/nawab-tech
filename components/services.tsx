import {
  ArrowUpRight,
  BarChart3,
  Globe2,
  Layers3,
  Workflow,
} from "lucide-react";

const services = [
  {
    number: "01",
    title: "Business Websites",
    description:
      "Websites designed to make your business look credible, communicate clearly, and turn the right visitors into enquiries.",
    features: [
      "Marketing & business websites",
      "Landing pages",
      "SEO-focused architecture",
      "Performance optimisation",
    ],
    icon: Globe2,
    href: "/services/web-development",
  },
  {
    number: "02",
    title: "Custom Web Applications",
    description:
      "Purpose-built applications that replace scattered tools and manual processes with software designed around your workflow.",
    features: [
      "Custom business applications",
      "Customer portals",
      "Internal platforms",
      "Role-based systems",
    ],
    icon: Layers3,
    href: "/services/custom-web-applications",
  },
  {
    number: "03",
    title: "Dashboards & Internal Tools",
    description:
      "Clear, practical interfaces that turn business data into something your team can actually use to make better decisions.",
    features: [
      "Analytics dashboards",
      "Operations dashboards",
      "Admin panels",
      "Reporting systems",
    ],
    icon: BarChart3,
    href: "/services/dashboard-development",
  },
  {
    number: "04",
    title: "Automation & Integrations",
    description:
      "Connect the systems you already use and remove repetitive work through APIs, integrations, and smarter workflows.",
    features: [
      "API integrations",
      "Third-party services",
      "Automated workflows",
      "Data synchronisation",
    ],
    icon: Workflow,
    href: "/services/automation-integrations",
  },
];

export function Services() {
  return (
    <section id="services" className="section-border">
      <div className="container-main">
        {/* Header */}
        <div className="grid border-x border-border lg:grid-cols-12">
          <div className="p-6 sm:p-10 lg:col-span-4 lg:p-14">
            <div className="eyebrow text-muted-foreground">What we build</div>
          </div>

          <div className="border-t border-border p-6 sm:p-10 lg:col-span-8 lg:border-l lg:border-t-0 lg:p-14">
            <h2 className="section-title max-w-5xl">
              Technology should
              <br />
              <span className="text-primary">solve problems.</span>
            </h2>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Whether you need a better website or a complete internal platform,
              we build digital products around the problems your business
              actually needs to solve.
            </p>
          </div>
        </div>

        {/* Services */}
        <div className="border-x border-t border-border">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <article
                key={service.number}
                className="group grid border-b border-border last:border-b-0 lg:grid-cols-12"
              >
                {/* Number */}
                <div className="hidden border-r border-border p-8 lg:col-span-1 lg:block">
                  <span className="text-xs text-muted-foreground">
                    {service.number}
                  </span>
                </div>

                {/* Main */}
                <div className="p-6 sm:p-10 lg:col-span-7 lg:p-14">
                  <div className="mb-10 flex items-center justify-between lg:hidden">
                    <span className="text-xs text-muted-foreground">
                      {service.number}
                    </span>

                    <Icon size={22} strokeWidth={1.5} />
                  </div>

                  <h3 className="max-w-3xl text-3xl font-medium tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                    {service.title}
                  </h3>

                  <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                    {service.description}
                  </p>

                  <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
                    {service.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs uppercase tracking-[0.08em] text-muted-foreground"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Visual */}
                <div className="relative flex min-h-72 items-center justify-center overflow-hidden border-t border-border bg-muted/30 p-8 lg:col-span-4 lg:min-h-0 lg:border-l lg:border-t-0">
                  <ServiceVisual index={index} />

                  <a
                    href={service.href}
                    aria-label={`Learn more about ${service.title}`}
                    className="absolute right-6 top-6 flex size-12 items-center justify-center border border-border bg-background transition-colors group-hover:bg-foreground group-hover:text-background"
                  >
                    <ArrowUpRight size={18} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ServiceVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="w-full max-w-sm">
        <div className="border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-[9px] uppercase tracking-[0.15em]">
              Your business
            </span>

            <div className="flex gap-1">
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="size-1.5 rounded-full bg-muted-foreground/30" />
              <span className="size-1.5 rounded-full bg-muted-foreground/30" />
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="h-4 w-2/3 bg-foreground/10" />
            <div className="h-2 w-full bg-foreground/5" />
            <div className="h-2 w-4/5 bg-foreground/5" />

            <div className="grid grid-cols-3 gap-2 pt-4">
              <div className="h-16 bg-primary" />
              <div className="h-16 bg-foreground/10" />
              <div className="h-16 bg-foreground/10" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="relative size-56">
        <div className="absolute left-1/2 top-1/2 flex size-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-foreground bg-background">
          <Layers3 size={28} strokeWidth={1.2} />
        </div>

        <div className="absolute left-0 top-1/2 flex size-14 -translate-y-1/2 items-center justify-center border border-border bg-background">
          <span className="text-[8px] uppercase">Data</span>
        </div>

        <div className="absolute right-0 top-1/2 flex size-14 -translate-y-1/2 items-center justify-center border border-border bg-background">
          <span className="text-[8px] uppercase">Users</span>
        </div>

        <div className="absolute left-1/2 top-0 h-14 w-px bg-border" />
        <div className="absolute bottom-0 left-1/2 h-14 w-px bg-border" />

        <div className="absolute left-1/2 top-0 flex size-10 -translate-x-1/2 items-center justify-center border border-border bg-background">
          <span className="text-[7px] uppercase">API</span>
        </div>

        <div className="absolute bottom-0 left-1/2 flex size-10 -translate-x-1/2 items-center justify-center border border-border bg-background">
          <span className="text-[7px] uppercase">App</span>
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="w-full max-w-sm border border-border bg-background p-5">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-[0.15em]">
            Overview
          </span>

          <BarChart3 size={16} strokeWidth={1.5} />
        </div>

        <div className="flex h-32 items-end gap-2">
          {[35, 55, 42, 78, 64, 92, 74, 100].map((height, index) => (
            <div
              key={index}
              className={`flex-1 ${
                index === 7 ? "bg-primary" : "bg-foreground/10"
              }`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>

        <div className="mt-5 flex justify-between border-t border-border pt-4">
          <span className="text-[9px] text-muted-foreground">Performance</span>

          <span className="text-[9px] text-primary">+24.8%</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex size-56 items-center justify-center">
      <div className="absolute size-36 rounded-full border border-border" />

      <div className="absolute size-24 rounded-full border border-foreground" />

      <div className="relative flex size-12 items-center justify-center bg-primary text-primary-foreground">
        <Workflow size={20} />
      </div>

      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[8px] uppercase tracking-[0.1em]">
        CRM
      </span>

      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[8px] uppercase tracking-[0.1em]">
        API
      </span>

      <span className="absolute left-1/2 top-0 -translate-x-1/2 text-[8px] uppercase tracking-[0.1em]">
        Data
      </span>

      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-[0.1em]">
        Automation
      </span>
    </div>
  );
}
