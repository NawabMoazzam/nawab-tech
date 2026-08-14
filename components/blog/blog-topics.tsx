import Link from "next/link";

const topics = [
  {
    name: "Web Development",
    slug: "web-development",
    description: "Websites, performance, SEO, design, and digital presence.",
  },
  {
    name: "Custom Web Applications",
    slug: "custom-web-applications",
    description: "When your business needs software built around its workflow.",
  },
  {
    name: "Dashboards",
    slug: "dashboard-development",
    description: "Turning scattered business data into something useful.",
  },
  {
    name: "Automation & Integrations",
    slug: "api-integrations",
    description: "Connecting tools and reducing repetitive manual work.",
  },
];

export function BlogTopics() {
  return (
    <section className="section-border">
      <div className="container-main">
        <div className="grid border-x border-border lg:grid-cols-12">
          <div className="p-6 sm:p-10 lg:col-span-4 lg:p-14">
            <div className="eyebrow text-muted-foreground">Explore topics</div>

            <h2 className="section-title mt-8">
              Learn
              <br />
              something
              <br />
              <span className="text-primary">useful.</span>
            </h2>
          </div>

          <div className="border-t border-border lg:col-span-8 lg:border-l lg:border-t-0">
            {topics.map((topic, index) => (
              <Link
                key={topic.slug}
                href={`/blog/category/${topic.slug}`}
                className="group grid gap-5 border-b border-border p-6 transition-colors hover:bg-muted/40 sm:grid-cols-12 sm:p-10"
              >
                <span className="text-xs text-muted-foreground sm:col-span-1">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="sm:col-span-10">
                  <h3 className="text-2xl font-medium tracking-[-0.04em] transition-colors group-hover:text-primary">
                    {topic.name}
                  </h3>

                  <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">
                    {topic.description}
                  </p>
                </div>

                <div className="flex items-center justify-end sm:col-span-1">
                  <span className="flex size-10 items-center justify-center border border-border transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">
                    ↗
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
