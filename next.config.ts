import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "auzowsbymkaibgnmdatb.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Photos are submitted through Server Actions, and the default cap is 1 MB
    // — smaller than a single phone photo, so uploads failed on anything but a
    // heavily compressed image.
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
