import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Las fotos se sirven desde el CDN de SmugMug.
    remotePatterns: [
      { protocol: "https", hostname: "**.smugmug.com" },
      { protocol: "https", hostname: "photos.smugmug.com" },
    ],
  },
};

export default nextConfig;
