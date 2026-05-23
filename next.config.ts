import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add any custom configuration here if needed
  eslint: {
    // Disable ESLint during builds for speed (optional)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during builds for speed (optional, since we check in lint script)
    ignoreBuildErrors: false,
  }
};

export default nextConfig;
