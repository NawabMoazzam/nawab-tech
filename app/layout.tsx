import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { siteConfig } from "@/lib/site";

const siteUrl = siteConfig.url;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Nawab Tech — Web Development & Custom Software",
    template: "%s | Nawab Tech",
  },

  description:
    "Nawab Tech builds high-performing business websites, custom web applications, dashboards, and digital systems designed around how businesses actually work.",

  keywords: [
    "web development services",
    "custom web development",
    "business website development",
    "custom web application development",
    "dashboard development",
    "custom software development",
    "API integration services",
  ],

  applicationName: "Nawab Tech",

  authors: [
    {
      name: "Nawab Tech",
      url: siteUrl,
    },
  ],

  creator: "Nawab Tech",
  publisher: "Nawab Tech",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteUrl,
    siteName: "Nawab Tech",
    title: "Nawab Tech — Web Development & Custom Software",
    description:
      "High-performing websites, custom web applications, dashboards, and digital systems built around your business.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Nawab Tech — Web Development & Custom Software",
    description:
      "High-performing websites, custom web applications, dashboards, and digital systems built around your business.",
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",

  "@id": `${siteUrl}/#organization`,

  name: "Nawab Tech",

  url: siteUrl,

  description:
    "Nawab Tech provides web development, custom web applications, dashboards, and digital systems for businesses.",

  areaServed: "Worldwide",

  serviceType: [
    "Web Development",
    "Business Website Development",
    "Custom Web Application Development",
    "Dashboard Development",
    "Custom Software Development",
    "API Integration",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
