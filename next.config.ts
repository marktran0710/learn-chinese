import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  serverExternalPackages: ["@xenova/transformers", "sharp"],
  experimental: {
    outputFileTracingIncludes: {
      // Bundle yt-dlp binary so it's available inside Vercel serverless functions
      "/api/process-video": ["./node_modules/youtube-dl-exec/bin/**"],
    },
  },
};

export default nextConfig;
