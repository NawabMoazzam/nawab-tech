import createMDX from "@next/mdx";

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
      {
        protocol: "https",
        hostname: "*.imagekit.io",
      },
    ],
  },
  // For proxy.ts (Next.js 16) - no special config needed
  // But we add allowed origins for ImageKit
  experimental: {
    // Enable if you need server actions larger body for image upload via form
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default withMDX(nextConfig);
