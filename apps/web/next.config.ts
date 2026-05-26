import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

const nextConfig: NextConfig = {
  experimental: {},
  images: {
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
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/:path*`
      }
    ];
  }
};

export default nextConfig;
