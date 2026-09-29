import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vscdkxryxsbswisebmvl.supabase.co"
      }
    ]
  }

};

export default nextConfig;
