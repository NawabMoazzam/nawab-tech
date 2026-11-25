const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const siteConfig = {
  name: "Nawab Tech",
  url: siteUrl,
  description:
    "Nawab Tech builds high-performing business websites, custom web applications, dashboards, and digital systems designed around how businesses actually work.",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL!,
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE!,
  author: {
    name: process.env.NEXT_PUBLIC_AUTHOR_NAME || "Nawab Moazzam",
    role: process.env.NEXT_PUBLIC_AUTHOR_ROLE || "Founder & Developer",
    url: `${siteUrl}/about`,
    sameAs: [
      "https://www.facebook.com/moazzam.nawab.dev",
      "https://github.com/NawabMoazzam",
    ],
  },
  social: {
    facebook: "https://www.facebook.com/nawabtech",
    github: "https://github.com/NawabMoazzam",
  },
} as const;
