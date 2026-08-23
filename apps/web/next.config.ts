import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for optimized multi-stage Docker images (copies only the standalone server).
  output: "standalone",
  experimental: {},
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**.shopify.com",
      },
      {
        protocol: "https",
        hostname: "**.imgur.com",
      },
      {
        protocol: "https",
        hostname: "**.ibb.co",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // Server-side proxy target. In Docker Compose use http://backend:4000.
        // Browser clients should use NEXT_PUBLIC_API_URL=/api (same-origin).
        destination: `${process.env.API_URL ?? ""}/:path*`,
      },
    ];
  },
};

export default nextConfig;