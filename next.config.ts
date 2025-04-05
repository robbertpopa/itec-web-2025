import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.pbinfo.ro',
      },
    ],
  },
};

export default nextConfig;
