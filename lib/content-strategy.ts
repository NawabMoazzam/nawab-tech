export const contentStrategy = {
  niche: "AI automation and custom web apps for small businesses and startups",
  audience:
    "International founders and small-business owners in the US, UK, and EU who are evaluating practical software projects and need clear costs, trade-offs, and implementation guidance.",
  language: "English only",
  tone: "Plain-English, candid, practical, commercially aware, and evidence-conscious. Explain assumptions; never pretend estimates or examples are measured research.",
  bannedPhrases: [
    "in today's fast-paced",
    "in today’s fast-paced",
    "in the ever-evolving",
    "in the digital age",
    "game-changer",
    "leverage the power of",
    "unlock the potential",
    "CTO's guide",
    "CTO’s guide",
    "CTO guide",
    "ultimate guide",
  ],
  allowedCategories: [
    {
      name: "Web Development",
      slug: "web-development",
      servicePath: "/services/web-development",
      description: "Websites, performance, SEO, design, and digital presence.",
    },
    {
      name: "Business Websites",
      slug: "business-websites",
      servicePath: "/services/web-development",
      description: "Guidance for small and medium businesses building a website.",
    },
    {
      name: "Custom Web Applications",
      slug: "custom-web-applications",
      servicePath: "/services/custom-web-applications",
      description: "Purpose-built software that replaces manual workflows.",
    },
    {
      name: "Dashboard Development",
      slug: "dashboard-development",
      servicePath: "/services/dashboard-development",
      description: "Dashboards, internal tools, and data visibility for businesses.",
    },
    {
      name: "Automation & Integrations",
      slug: "automation-integrations",
      servicePath: "/services/automation-integrations",
      description: "AI automation, integrations, and workflow tooling.",
    },
  ],
} as const;

export type ContentCategory = (typeof contentStrategy.allowedCategories)[number];
