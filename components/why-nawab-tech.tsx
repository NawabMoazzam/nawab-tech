import {
  ArrowUpRight,
  Blocks,
  MessageCircle,
  MoveUpRight,
  Target,
} from "lucide-react";

const principles = [
  {
    number: "01",
    title: "Business-first thinking",
    description:
      "Technology is only useful when it improves something. We focus on the business problem before deciding what to build.",
    icon: Target,
  },
  {
    number: "02",
    title: "Clear communication",
    description:
      "No unnecessary technical jargon. You should always understand what we're building, why we're building it, and what happens next.",
    icon: MessageCircle,
  },
  {
    number: "03",
    title: "Solid engineering",
    description:
      "Clean architecture, thoughtful interfaces, performance, and maintainable code form the foundation of every product we build.",
    icon: Blocks,
  },
  {
    number: "04",
    title: "Built to evolve",
    description:
      "Your business will change. We build foundations that allow your digital product to grow instead of forcing you to start over.",
    icon: MoveUpRight,
  },
];

export function WhyNawabTech() {
  return (
    <section className="section-border">
      <div className="container-main">
        <div className="grid border-x border-border lg:grid-cols-12">
          {/* Heading */}
          <div className="p-6 sm:p-10 lg:col-span-5 lg:p-14">
            <div className="eyebrow text-muted-foreground">Why Nawab Tech</div>

            <h2 className="section-title mt-8">
              Built for the
              <br />
              <span className="text-primary">business.</span>
              <br />
              Not just the brief.
            </h2>

            <p className="mt-10 max-w-md leading-relaxed text-muted-foreground">
              The best digital products aren&apos;t created by blindly following
              a specification. They&apos;re created by understanding why the
              specification exists in the first place.
            </p>

            <a
              href="/contact"
              className="group mt-10 flex w-fit items-center gap-3 text-sm font-medium"
            >
              Let&apos;s talk about your project
              <ArrowUpRight
                size={17}
                className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </a>
          </div>

          {/* Principles */}
          <div className="border-t border-border lg:col-span-7 lg:border-l lg:border-t-0">
            {principles.map((principle) => {
              const Icon = principle.icon;

              return (
                <article
                  key={principle.number}
                  className="group grid border-b border-border p-6 sm:p-10 lg:grid-cols-12 lg:p-12"
                >
                  <div className="mb-8 flex items-start justify-between lg:col-span-2 lg:mb-0">
                    <span className="text-xs text-muted-foreground">
                      {principle.number}
                    </span>

                    <Icon
                      size={20}
                      strokeWidth={1.4}
                      className="text-muted-foreground transition-colors group-hover:text-primary lg:hidden"
                    />
                  </div>

                  <div className="lg:col-span-10">
                    <div className="flex items-start justify-between gap-8">
                      <h3 className="text-2xl font-medium tracking-[-0.04em] sm:text-3xl">
                        {principle.title}
                      </h3>

                      <Icon
                        size={22}
                        strokeWidth={1.4}
                        className="hidden shrink-0 text-muted-foreground transition-colors group-hover:text-primary lg:block"
                      />
                    </div>

                    <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">
                      {principle.description}
                    </p>
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
