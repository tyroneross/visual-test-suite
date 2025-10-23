import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@your-org/visual-test-viewer', '@your-org/visual-test-backend'],
};

export default nextConfig;
