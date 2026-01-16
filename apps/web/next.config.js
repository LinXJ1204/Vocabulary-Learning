const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  fallbacks: {
    document: "/offline"
  },
  runtimeCaching: [
    // Never cache API responses (avoid caching personalized content).
    {
      urlPattern: /\/(vocabulary|identity)\//,
      handler: "NetworkOnly",
      options: { cacheName: "api-network-only" }
    }
  ]
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};

module.exports = withPWA(nextConfig);

