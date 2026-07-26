import {
  ArrowUpRight,
  Boxes,
  Code2,
  Gauge,
  LayoutDashboard,
} from "lucide-react";

const solutions = [
  {
    number: "01",
    icon: Code2,
    title: "Business Websites",
    description:
      "Fast, modern websites designed to make your business look credible, communicate clearly, and turn visitors into enquiries.",
  },
  {
    number: "02",
    icon: LayoutDashboard,
    title: "Web Applications",
    description:
      "Custom platforms, dashboards, admin panels, and internal tools built around your specific business workflows.",
  },
  {
    number: "03",
    icon: Boxes,
    title: "Digital Systems",
    description:
      "Connect your tools, APIs, data, and processes into systems that reduce manual work and give your team better visibility.",
  },
  {
    number: "04",
    icon: Gauge,
    title: "Performance & Growth",
    description:
      "Technical improvements focused on speed, SEO foundations, usability, and creating a stronger digital experience.",
  },
];

export function Solutions() {
  return (
    <section id="services" className="section-border">
      <div className="container-main">
        <div className="grid lg:grid-cols-12">
          <div className="border-x border-border p-6 sm:p-10 lg:col-span-4 lg:p-14">
            <div className="eyebrow text-muted">What we build</div>

            <h2 className="section-title mt-8">
              More than
              <br />
              <span className="text-accent">just websites.</span>
            </h2>
          </div>

          <div className="lg:col-span-8">
            {solutions.map((solution) => {
              const Icon = solution.icon;

              return (
                <article
                  key={solution.number}
                  className="group grid border-b border-border p-6 transition-colors hover:bg-(--surface) sm:grid-cols-12 sm:p-10 lg:p-14"
                >
                  <div className="mb-8 sm:col-span-2 sm:mb-0">
                    <span className="text-xs text-muted">
                      {solution.number}
                    </span>
                  </div>

                  <div className="sm:col-span-8">
                    <div className="mb-6 flex items-center gap-4">
                      <Icon size={24} strokeWidth={1.5} />

                      <h3 className="text-2xl font-medium tracking-[-0.04em] sm:text-3xl">
                        {solution.title}
                      </h3>
                    </div>

                    <p className="max-w-xl text-base leading-relaxed text-muted">
                      {solution.description}
                    </p>
                  </div>

                  <div className="mt-8 flex justify-end sm:col-span-2 sm:mt-0">
                    <ArrowUpRight
                      size={22}
                      className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
