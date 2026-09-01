import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  async redirects() {
    return [
      { source: "/products", destination: "/#for-home-kitchen", permanent: false },
      { source: "/products/:slug", destination: "/#for-home-kitchen", permanent: false },
      { source: "/way", destination: "/#coming-soon", permanent: false },
      { source: "/chain", destination: "/#v2-catalogs", permanent: false },
      { source: "/magazine", destination: "/#v2-magazine", permanent: false },
      { source: "/magazine/:slug", destination: "/#v2-magazine", permanent: false },
      { source: "/contact", destination: "/", permanent: false },
      { source: "/stores", destination: "/", permanent: false },
      { source: "/cart", destination: "/", permanent: false },
      { source: "/account", destination: "/", permanent: false },
      { source: "/wishlist", destination: "/", permanent: false },
      { source: "/rahyaar", destination: "/", permanent: false },
      { source: "/playground", destination: "/", permanent: false },
      { source: "/preview", destination: "/", permanent: false },
      { source: "/demo/:path*", destination: "/", permanent: false },
      { source: "/roadmap-editor", destination: "/", permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
