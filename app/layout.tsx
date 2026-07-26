import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://nawabtech.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Nawab Tech — Web Development & Custom Software",
    template: "%s | Nawab Tech",
  },

  description:
    "Nawab Tech builds modern business websites, custom web applications, dashboards, and digital systems designed around how businesses actually work.",

  keywords: [
    "web development",
    "web development services",
    "custom web development",
    "business website development",
    "custom web applications",
    "dashboard development",
    "admin dashboard development",
    "Next.js development",
    "React development",
    "TypeScript development",
    "custom software development",
    "API integration",
  ],

  authors: [{ name: "Nawab Tech" }],
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
      "Modern websites, custom web applications, dashboards, and digital systems built around your business.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Nawab Tech — Web Development & Custom Software",
    description:
      "Modern websites, custom web applications, dashboards, and digital systems built around your business.",
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
  name: "Nawab Tech",
  url: siteUrl,
  description: "Web development and custom software services for businesses.",
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
