import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001'],
    },
  },
  images: {
    domains: ['images.unsplash.com', 'api.dicebear.com', 'picsum.photos'],
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
};

export default nextConfig;
