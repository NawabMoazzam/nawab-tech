import { Check } from "lucide-react";

type ServiceDeliverablesProps = {
  eyebrow?: string;
  title: React.ReactNode;
  items: string[];
};

export function ServiceDeliverables({
  eyebrow = "What we can build",
  title,
  items,
}: ServiceDeliverablesProps) {
  return (
    <section className="section-border">
      <div className="container-main">
        <div className="grid border-x border-border lg:grid-cols-12">
          <div className="p-6 sm:p-10 lg:col-span-5 lg:p-14">
            <div className="eyebrow text-muted-foreground">{eyebrow}</div>

            <h2 className="section-title mt-8">{title}</h2>
          </div>

          <div className="border-t border-border lg:col-span-7 lg:border-l lg:border-t-0">
            {items.map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-5 border-b border-border p-6 sm:p-8"
              >
                <span className="text-xs text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <Check size={17} className="text-primary" strokeWidth={1.8} />

                <span className="text-base">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
