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
        hostname: "res.cloudinary.com"
      },
      {
        protocol: "https",
        hostname: "picsum.photos"
      },
      {
        protocol: "https",
        hostname: "placehold.co"
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**"
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "4000",
        pathname: "/uploads/**"
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // Server-side proxy target. In Docker Compose use http://backend:4000.
        // Browser clients should use NEXT_PUBLIC_API_URL=/api (same-origin).
        destination: `${process.env.API_URL ?? ""}/:path*`
      }
    ];
  }
};

export default nextConfig;