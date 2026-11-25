export const websiteCostRates = {
  currency: "USD",
  projectTypes: {
    businessWebsite: { label: "Business website", min: 1800, max: 6500 },
    ecommerce: { label: "Ecommerce website", min: 3500, max: 12000 },
    webApplication: { label: "Custom web application / MVP", min: 6000, max: 24000 },
    automation: { label: "Workflow automation", min: 1500, max: 9000 },
  },
  features: [
    { id: "accounts", label: "User accounts and permissions", min: 600, max: 1800 },
    { id: "dashboard", label: "Custom dashboard or reporting", min: 900, max: 2800 },
    { id: "payments", label: "Payments or subscriptions", min: 700, max: 2200 },
    { id: "admin", label: "Admin and content management", min: 700, max: 2200 },
    { id: "notifications", label: "Email or in-app notifications", min: 300, max: 1100 },
    { id: "ai", label: "AI-assisted workflow", min: 900, max: 3500 },
  ],
  integrations: [
    { id: "stripe", label: "Stripe", min: 400, max: 1300 },
    { id: "crm", label: "CRM (e.g. HubSpot)", min: 350, max: 1200 },
    { id: "accounting", label: "Accounting (e.g. Xero)", min: 450, max: 1500 },
    { id: "email", label: "Email / marketing platform", min: 250, max: 900 },
    { id: "other", label: "Another third-party service", min: 400, max: 1600 },
  ],
  timelineMultipliers: {
    flexible: { label: "Flexible (3+ months)", multiplier: 1 },
    standard: { label: "Standard (6–12 weeks)", multiplier: 1.12 },
    expedited: { label: "Expedited (under 6 weeks)", multiplier: 1.28 },
  },
  assumptions: [
    "USD planning ranges for a typical, clearly scoped first release; not a quote or fixed offer.",
    "Includes discovery, design/development, basic QA, and handover; excludes taxes, hosting, paid third-party licences, and ongoing support.",
    "Final pricing depends on requirements, data migration, compliance, integrations, and review speed.",
  ],
} as const;
