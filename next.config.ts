import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.pbinfo.ro',
      },
    ],
  },
  output: 'standalone',
};

export default nextConfig;
