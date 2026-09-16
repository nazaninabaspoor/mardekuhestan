import path from "path";
import type { NextConfig } from "next";

const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  ...(staticExport ? { output: "export" as const } : {}),
  ...(staticExport
    ? {}
    : {
        async redirects() {
          return [
            { source: "/products", destination: "/#for-home-kitchen", permanent: false },
            { source: "/way", destination: "/#product-unveil", permanent: false },
            { source: "/chain", destination: "/#v2-catalogs", permanent: false },
            { source: "/articles", destination: "/magazine", permanent: false },
            { source: "/articles/:slug", destination: "/magazine/:slug", permanent: false },
            { source: "/stores", destination: "/", permanent: false },
            { source: "/cart", destination: "/profile", permanent: false },
            { source: "/account", destination: "/profile", permanent: false },
            { source: "/wishlist", destination: "/", permanent: false },
            { source: "/rahyaar", destination: "/profile?tab=ai-nutrition", permanent: false },
            { source: "/playground", destination: "/", permanent: false },
            { source: "/preview", destination: "/", permanent: false },
            { source: "/demo/:path*", destination: "/", permanent: false },
            { source: "/roadmap-editor", destination: "/", permanent: false },
          ];
        },
      }),
  images: {
    unoptimized: staticExport,
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
      {
        protocol: "https",
        hostname: "mardekuhestan.com",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "www.mardekuhestan.com",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "api.mardekuhestan.com",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "mardekuhestan.com",
        pathname: "/public/media/**",
      },
      {
        protocol: "https",
        hostname: "www.mardekuhestan.com",
        pathname: "/public/media/**",
      },
      {
        protocol: "https",
        hostname: "koohestanesepid.com",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "www.koohestanesepid.com",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "koohestanesepid.com",
        pathname: "/public/media/**",
      },
      {
        protocol: "https",
        hostname: "www.koohestanesepid.com",
        pathname: "/public/media/**",
      },
    ],
  },
};

export default nextConfig;
