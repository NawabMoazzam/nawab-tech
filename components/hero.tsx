import {
  ArrowDownRight,
  ArrowUpRight,
  Database,
  Globe2,
  LayoutDashboard,
  Workflow,
} from "lucide-react";

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

const systemNodes = [
  {
    label: "Website",
    icon: Globe2,
    position: "top-[8%] left-[4%] sm:left-[10%]",
  },
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    position: "top-[8%] right-[4%] sm:right-[10%]",
  },
  {
    label: "APIs",
    icon: Workflow,
    position: "bottom-[8%] left-[4%] sm:left-[10%]",
  },
  {
    label: "Data",
    icon: Database,
    position: "bottom-[8%] right-[4%] sm:right-[10%]",
  },
];

export function Hero() {
  return (
    <section className="hero-surface overflow-hidden">
      <div className="container-main">
        <div className="grid min-h-[calc(100svh-80px)] grid-cols-1 border-x border-border lg:grid-cols-12">
          {/* Main Content */}
          <div className="flex flex-col justify-between border-b border-border p-6 pt-16 sm:p-10 lg:col-span-7 lg:border-b-0 lg:border-r lg:p-14 lg:pt-24">
            <div>
              <div
                data-reveal="up"
                className="eyebrow mb-8 flex items-center gap-3 text-muted-foreground"
              >
                <span className="size-2 bg-primary" />
                Digital products for growing businesses
              </div>

              <h1 className="hero-title-split max-w-4xl text-[clamp(3.5rem,7vw,7.5rem)] font-medium leading-[0.88] tracking-[-0.075em]">
                <span className="hero-line" style={{ "--line": 0 } as CSSVars}>
                  <span>Digital products</span>
                </span>

                <span className="hero-line" style={{ "--line": 1 } as CSSVars}>
                  <span>built around</span>
                </span>

                <span className="hero-line" style={{ "--line": 2 } as CSSVars}>
                  <span>
                    <span className="shimmer-text">your business.</span>
                  </span>
                </span>
              </h1>
            </div>

            <div
              data-reveal="up"
              style={{ transitionDelay: "420ms" }}
              className="mt-16 grid gap-8 lg:mt-24 lg:grid-cols-2"
            >
              <p className="max-w-md text-lg leading-relaxed tracking-[-0.02em] text-muted-foreground">
                We build high-performing websites, custom web applications,
                dashboards, and connected digital systems that help businesses
                work better.
              </p>

              <div className="flex flex-col justify-end gap-5 lg:items-end">
                <a
                  href="/contact"
                  className="premium-button group flex w-fit items-center gap-3 bg-primary px-6 py-4 text-sm font-medium text-primary-foreground"
                >
                  Start a project
                  <ArrowUpRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </a>

                <a
                  href="/services"
                  className="flex w-fit items-center gap-2 text-sm font-medium"
                >
                  Explore our services
                  <ArrowDownRight size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* System Visual */}
          <div className="relative flex min-h-130 flex-col justify-between p-6 sm:p-10 lg:col-span-5 lg:min-h-0 lg:p-8">
            <div className="flex justify-between text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              <span>01 / Digital system</span>
              <span>Nawab Tech</span>
            </div>

            <div className="relative flex flex-1 items-center justify-center py-16">
              {/* Connection Lines */}
              <div className="absolute left-1/2 top-[18%] h-[64%] w-px -translate-x-1/2 bg-border" />

              <div className="absolute left-[14%] right-[14%] top-1/2 h-px -translate-y-1/2 bg-border" />
              <span
                aria-hidden="true"
                className="signal-dot signal-dot-horizontal"
              />
              <span
                aria-hidden="true"
                className="signal-dot signal-dot-vertical"
              />

              {/* Center System */}
              <span aria-hidden className="core-halo" />

              <div className="system-core relative z-10 flex size-32 flex-col items-center justify-center border border-foreground bg-background sm:size-40">
                <div className="text-3xl font-medium tracking-[-0.07em] sm:text-4xl">
                  NT
                </div>

                <div className="mt-2 text-[8px] uppercase tracking-[0.2em] text-muted-foreground">
                  One system
                </div>
              </div>

              {/* Nodes */}
              {systemNodes.map((node, index) => {
                const Icon = node.icon;

                return (
                  <div
                    key={node.label}
                    className={`float-soft absolute ${node.position} z-10`}
                    style={{ "--float-delay": `${index * 900}ms` } as CSSVars}
                  >
                    <div className="system-node flex items-center gap-2 border border-border bg-background px-3 py-2 sm:px-4 sm:py-3">
                      <Icon size={14} strokeWidth={1.5} />

                      <span className="text-[10px] font-medium uppercase tracking-[0.08em]">
                        {node.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-end justify-between gap-8 border-t border-border pt-5">
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                Connect your customer experience, internal workflows, data, and
                technology into something that works as one.
              </p>

              <div
                aria-hidden
                className="hidden shrink-0 flex-col items-center gap-3 sm:flex"
              >
                <span className="scroll-cue" />

                <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  Scroll
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
