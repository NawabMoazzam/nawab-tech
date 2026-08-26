import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
  manifest: "/admin-manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nawab Tech — Admin Panel",
    // startUpImage: [],
  },
};

export const viewport: Viewport = {
  themeColor: "#ce4d2d",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
