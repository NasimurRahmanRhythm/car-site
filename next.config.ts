import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "auzowsbymkaibgnmdatb.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // YouTube thumbnails for the video links in the gallery.
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
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
    // The proxy (src/proxy.ts) runs on /admin too, and while it does Next only
    // buffers the first 10 MB of a request body — anything past that was cut
    // off, so a large photo upload reached the action truncated and failed.
    // Kept in step with the Server Action limit above.
    proxyClientMaxBodySize: "25mb",
  },
};

export default nextConfig;
