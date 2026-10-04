import type { LucideIcon } from "lucide-react";

type ServiceBenefit = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type ServiceBenefitsProps = {
  benefits: ServiceBenefit[];
};

export function ServiceBenefits({ benefits }: ServiceBenefitsProps) {
  return (
    <section className="section-border">
      <div className="container-main">
        <div className="grid border-x border-border md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <article
                key={benefit.title}
                data-tilt
                data-reveal="up"
                style={{ transitionDelay: `${index * 80}ms` }}
                className="hover-sweep group relative overflow-hidden border-b border-border p-6 sm:p-10 md:border-r md:last:border-r-0 lg:border-b-0"
              >
                <Icon
                  size={24}
                  strokeWidth={1.4}
                  className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:text-primary"
                />

                <h2 className="mt-10 text-xl font-medium tracking-[-0.03em]">
                  {benefit.title}
                </h2>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {benefit.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
