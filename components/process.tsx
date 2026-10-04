import { ArrowUpRight, Brain, Hammer, Layers3, RefreshCw } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Understand",
    description:
      "We start by understanding your business, your users, and the problem you're trying to solve. The goal is to build the right thing—not simply build what was first requested.",
    icon: Brain,
    detail: "Context before code.",
  },
  {
    number: "02",
    title: "Structure",
    description:
      "We turn the problem into a clear plan. We define the product structure, user experience, technical approach, and the features that actually matter.",
    icon: Layers3,
    detail: "Clarity before complexity.",
  },
  {
    number: "03",
    title: "Build",
    description:
      "We design and develop the product with a focus on performance, usability, maintainability, and a solid technical foundation that won't become a problem later.",
    icon: Hammer,
    detail: "Quality without overengineering.",
  },
  {
    number: "04",
    title: "Improve",
    description:
      "Launching is not the end. We look at what users do, what can be improved, and where the product can create even more value for your business.",
    icon: RefreshCw,
    detail: "Launch, learn, improve.",
  },
];

export function Process() {
  return (
    <section id="process" className="section-border">
      <div className="container-main">
        {/* Header */}
        <div className="grid border-x border-border lg:grid-cols-12">
          <div className="p-6 sm:p-10 lg:col-span-4 lg:p-14">
            <div className="eyebrow text-muted-foreground">How we work</div>
          </div>

          <div className="border-t border-border p-6 sm:p-10 lg:col-span-8 lg:border-l lg:border-t-0 lg:p-14">
            <h2 className="section-title max-w-4xl">
              Good software
              <br />
              starts with
              <br />
              <span className="text-primary">good thinking.</span>
            </h2>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
              We don&apos;t believe in adding technology for the sake of
              technology. Every project starts with understanding the problem
              and ends with building something useful.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="grid border-x border-t border-border md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                key={step.number}
                data-tilt
                data-reveal-item
                style={{ transitionDelay: `${index * 70}ms` }}
                className="group relative flex min-h-107.5 flex-col justify-between border-b border-border p-6 sm:p-10 md:border-r md:last:border-r-0 lg:min-h-125 lg:border-b-0"
              >
                {/* Number + Icon */}
                <div className="flex items-start justify-between">
                  <span className="text-xs text-muted-foreground">
                    {step.number}
                  </span>

                  <div className="flex size-12 items-center justify-center border border-border transition-all duration-500 group-hover:scale-105 group-hover:rotate-6 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon size={20} strokeWidth={1.4} />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-3xl font-medium tracking-tighter">
                    {step.title}
                  </h3>

                  <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>

                  <div className="mt-8 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em]">
                    <span className="size-1.5 bg-primary" />

                    {step.detail}
                  </div>
                </div>

                {/* Decorative Arrow */}
                <ArrowUpRight
                  size={18}
                  className="absolute bottom-6 right-6 text-muted-foreground/40 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary"
                />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
