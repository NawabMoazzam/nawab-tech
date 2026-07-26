import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function Hero() {
  return (
    <section className="grid-lines overflow-hidden">
      <div className="container-main">
        <div className="grid min-h-[calc(100vh-80px)] grid-cols-1 border-x border-border lg:grid-cols-12">
          <div className="flex flex-col justify-between border-b border-border p-6 pt-16 sm:p-10 lg:col-span-8 lg:border-b-0 lg:border-r lg:p-14 lg:pt-24">
            <div>
              <div className="eyebrow mb-8 flex items-center gap-3 text-muted">
                <span className="size-2 bg-accent" />
                Web development · Custom software · Digital systems
              </div>

              <h1 className="max-w-5xl text-[clamp(3.5rem,8vw,8rem)] font-medium leading-[0.88] tracking-[-0.07em]">
                Build the
                <br />
                <span className="text-accent">right</span> digital
                <br />
                system.
              </h1>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:mt-24">
              <p className="body-large max-w-md">
                Nawab Tech builds modern websites, custom web applications,
                dashboards, and digital tools around the way your business
                actually works.
              </p>

              <div className="flex flex-col justify-end gap-5 sm:items-end">
                <a
                  href="#contact"
                  className="group flex w-fit items-center gap-3 bg-foreground px-6 py-4 text-sm font-medium text-white transition-transform hover:-translate-y-1"
                >
                  Start a project
                  <ArrowUpRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </a>

                <a
                  href="#work"
                  className="flex w-fit items-center gap-2 text-sm font-medium"
                >
                  Explore our work
                  <ArrowDownRight size={16} />
                </a>
              </div>
            </div>
          </div>

          <div className="relative flex min-h-100 flex-col justify-between p-6 sm:p-10 lg:col-span-4 lg:min-h-0 lg:p-8">
            <div className="flex justify-between text-[10px] uppercase tracking-[0.15em] text-muted">
              <span>01 / 01</span>
              <span>Digital partner</span>
            </div>

            <div className="relative mx-auto w-full max-w-sm py-16 lg:py-0">
              <div className="absolute inset-0 m-auto size-48 border border-(--border-strong) sm:size-64" />

              <div className="absolute inset-0 m-auto size-32 rotate-45 border border-foreground sm:size-44" />

              <div className="relative m-auto flex aspect-square size-40 items-center justify-center bg-accent text-white sm:size-52">
                <div className="text-center">
                  <div className="text-5xl font-medium tracking-[-0.08em]">
                    NT
                  </div>
                  <div className="mt-2 text-[9px] uppercase tracking-[0.2em]">
                    Nawab Tech
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-5">
              <p className="text-sm leading-relaxed text-muted">
                From a high-performing business website to a custom system that
                connects your entire workflow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
