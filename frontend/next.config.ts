import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits `.next/standalone` so the Docker image ships only the traced
  // runtime instead of the whole node_modules tree (see frontend/Dockerfile).
  output: "standalone",
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
