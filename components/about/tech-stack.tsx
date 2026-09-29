import { Braces, CloudCog, Database, PanelsTopLeft } from "lucide-react";

const stackGroups = [
  {
    number: "01",
    title: "Frontend",
    description: "Fast, accessible interfaces built for real users.",
    technologies: ["TypeScript", "JavaScript", "React", "Next.js", "Tailwind CSS"],
    icon: PanelsTopLeft,
  },
  {
    number: "02",
    title: "Backend",
    description: "Reliable application logic, APIs, and integrations.",
    technologies: ["Node.js", "Express", "REST APIs", "Better Auth", "Automation"],
    icon: Braces,
  },
  {
    number: "03",
    title: "Data",
    description: "Data models and storage chosen around the product.",
    technologies: ["MongoDB", "Mongoose", "PostgreSQL", "MySQL", "Redis"],
    icon: Database,
  },
  {
    number: "04",
    title: "Delivery",
    description: "Practical tooling for shipping and maintaining products.",
    technologies: ["Git & GitHub", "Docker", "Vercel", "ImageKit", "Cloud Deployments"],
    icon: CloudCog,
  },
];

export function TechStack() {
  return (
    <section className="section-border" aria-labelledby="tech-stack-title">
      <div className="container-main">
        <div className="grid border-x border-border lg:grid-cols-12">
          <div className="p-6 sm:p-10 lg:col-span-4 lg:p-14">
            <div className="eyebrow text-muted-foreground">Our technology stack</div>
            <h2 id="tech-stack-title" className="section-title mt-8">
              Modern tools.
              <br />
              <span className="text-primary">Purposefully chosen.</span>
            </h2>
            <p className="mt-8 max-w-sm leading-relaxed text-muted-foreground">
              We choose technology around the product, its users, and how it
              needs to grow—not because a tool happens to be fashionable.
            </p>
          </div>

          <div className="grid border-t border-border sm:grid-cols-2 lg:col-span-8 lg:border-l lg:border-t-0">
            {stackGroups.map((group, index) => {
              const Icon = group.icon;

              return (
                <article
                  key={group.number}
                  className={`group p-6 sm:p-10 ${
                    index % 2 === 1 ? "sm:border-l" : ""
                  } ${index > 1 ? "border-t" : index === 1 ? "border-t sm:border-t-0" : ""} border-border`}
                >
                  <div className="flex items-start justify-between gap-5">
                    <span className="text-xs text-muted-foreground">
                      {group.number}
                    </span>
                    <Icon
                      size={22}
                      strokeWidth={1.4}
                      className="text-primary"
                      aria-hidden
                    />
                  </div>

                  <h3 className="mt-10 text-2xl font-medium tracking-[-0.04em]">
                    {group.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {group.description}
                  </p>

                  <ul className="mt-8 flex flex-wrap gap-2" aria-label={`${group.title} technologies`}>
                    {group.technologies.map((technology) => (
                      <li
                        key={technology}
                        className="border border-border px-3 py-2 text-xs uppercase tracking-[0.07em]"
                      >
                        {technology}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
