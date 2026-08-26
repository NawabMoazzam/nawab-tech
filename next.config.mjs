import createMDX from "@next/mdx";
import withPWAInit from "@ducanh2912/next-pwa";

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
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
});

const withPWA = withPWAInit({
  dest: "public",
});

export default withPWA(withMDX(nextConfig));
