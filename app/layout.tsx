import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { siteConfig } from "@/lib/site";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import {
  breadcrumbSchema,
  localBusinessSchema,
  organizationSchema,
} from "@/lib/schema-markup";
import NextTopLoader from "nextjs-toploader";
import { GoogleAnalytics } from "@next/third-parties/google";

const siteUrl = siteConfig.url;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Nawab Tech — Web Development & Custom Software",
    template: "%s | Nawab Tech",
  },

  description: siteConfig.description,

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
            __html: JSON.stringify(localBusinessSchema).replace(
              /</g,
              "\\u003c",
            ),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c"),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c"),
          }}
        />

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color={"var(--primary)"} showSpinner={false} />
          {children}
          <SpeedInsights />
          <Analytics />
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
        </ThemeProvider>
      </body>
    </html>
  );
}
