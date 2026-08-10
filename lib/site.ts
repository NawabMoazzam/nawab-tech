export const siteConfig = {
  name: "Nawab Tech",
  url: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",

  description:
    "Nawab Tech builds high-performing business websites, custom web applications, dashboards, and digital systems designed around how businesses actually work.",

  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL!,
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE!,

  social: {
    // Add these when ready
    // linkedin: "",
    // github: "",
    // instagram: "",
  },
} as const;
