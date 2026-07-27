import { ArrowRight } from "lucide-react";

type ServiceHeroProps = {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function ServiceHero({
  eyebrow,
  title,
  description,
  ctaLabel = "Start a project",
  ctaHref = "/#contact",
}: ServiceHeroProps) {
  return (
    <section className="editorial-grid">
      <div className="container-main">
        <div className="border-x border-border p-6 pt-24 sm:p-10 sm:pt-32 lg:p-20 lg:pt-40">
          <div className="eyebrow text-muted-foreground">{eyebrow}</div>

          <h1 className="display-text mt-10 max-w-6xl">{title}</h1>

          <div className="mt-12 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-xl leading-relaxed text-muted-foreground sm:text-2xl">
                {description}
              </p>
            </div>

            <div className="lg:col-span-5 lg:flex lg:justify-end">
              <a
                href={ctaHref}
                className="flex h-fit w-fit items-center gap-3 bg-primary px-6 py-4 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                {ctaLabel}

                <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
