import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { ScrollAnimations } from "@/components/scroll-animations";
import "./globals.css";
import { siteConfig } from "@/lib/site";
import { VercelInsights } from "@/components/vercel-insights";
import { localBusinessSchema, organizationSchema } from "@/lib/schema-markup";
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

  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nawab Tech — Web Development & Digital Products",
    // startUpImage: [],
  },

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
    images: `${siteUrl}/nawab-tech-banner.png`,
  },

  twitter: {
    card: "summary_large_image",
    title: "Nawab Tech — Web Development & Custom Software",
    description:
      "High-performing websites, custom web applications, dashboards, and digital systems built around your business.",
    images: `${siteUrl}/nawab-tech-banner.png`,
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

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color={"var(--primary)"} showSpinner={false} />
          <VercelInsights />
          <ScrollAnimations />
          {children}
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
        </ThemeProvider>
      </body>
    </html>
  );
}
