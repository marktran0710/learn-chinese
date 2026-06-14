import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  serverExternalPackages: ["@xenova/transformers", "sharp", "pdf-parse"],
  outputFileTracingIncludes: {
    "/api/process-video": ["./node_modules/youtube-dl-exec/bin/**"],
  },
};

export default nextConfig;
