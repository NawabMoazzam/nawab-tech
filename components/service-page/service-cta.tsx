import { ArrowRight } from "lucide-react";

type ServiceCTAProps = {
  title: React.ReactNode;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function ServiceCTA({
  title,
  description,
  ctaLabel = "Tell us what you're building",
  ctaHref = "/contact",
}: ServiceCTAProps) {
  return (
    <section className="section-border">
      <div className="container-main">
        <div className="border-x border-border bg-primary p-6 text-primary-foreground sm:p-10 lg:p-20">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <h2 className="text-4xl font-medium leading-[0.95] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
                {title}
              </h2>

              {description && (
                <p className="mt-8 max-w-xl text-base leading-relaxed text-primary-foreground/70 sm:text-lg">
                  {description}
                </p>
              )}
            </div>

            <div className="lg:col-span-4 lg:flex lg:items-end lg:justify-end">
              <a
                href={ctaHref}
                className="flex w-fit items-center gap-3 bg-background px-6 py-4 text-sm font-medium text-foreground"
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
