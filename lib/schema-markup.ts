import {
  WithContext,
  LocalBusiness,
  BreadcrumbList,
  Person,
  FAQPage,
  ListItem,
} from "schema-dts";
import { siteConfig } from "./site";
import { navLinks } from "@/lib/nav-links";

const siteUrl = siteConfig.url;
const phone = siteConfig.phone;

export const localBusinessSchema: WithContext<LocalBusiness> = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Nawab Tech",
  description: siteConfig.description,
  image: `${siteUrl}/nawab-tech-logo.png`,
  "@id": `${siteUrl}/#organization`,
  url: siteUrl,
  telephone: phone,
  areaServed: "Worldwide",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Shakeel Town",
    addressLocality: "Khudian Khas",
    postalCode: "55030",
    addressCountry: "PK",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 30.9875379,
    longitude: 74.28145479999999,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "00:00",
    closes: "23:59",
  },
  sameAs: [siteConfig.social.facebook, siteConfig.social.github],
};

const itemListElement: ListItem[] = navLinks.map((link, index) => ({
  "@type": "ListItem",
  position: index + 1,
  name: link.label,
  item: `${siteUrl}${link.href}`,
}));

export const breadcrumbSchema: WithContext<BreadcrumbList> = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement,
};

export const personSchema: WithContext<Person> = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Moazzam Nawab",
  url: `${siteUrl}/about`,
  image: `${siteUrl}/profile.jpg`,
  sameAs: [
    "https://www.facebook.com/moazzam.nawab.dev",
    siteConfig.social.github,
  ],
  jobTitle: "Founder & Developer",
  worksFor: {
    "@type": "Organization",
    name: "Nawab Tech",
  },
};

export const faqSchema = (faqs: { question: string; answer: string }[]) =>
  ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }) as WithContext<FAQPage>;
