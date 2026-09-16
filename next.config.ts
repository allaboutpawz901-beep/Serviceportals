import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "",
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://aapawz.com",
  },
  experimental: {
    // Turbopack's Rust runtime was ballooning to 3.3GB RSS on this 4GB box and
    // getting SIGKILLed by the kernel OOM killer (dmesg: "Killed process ... next-server").
    // Cap it so Turbopack garbage-collects instead of dying mid-compile.
    // NODE_OPTIONS --max-old-space-size does NOT cover the Rust side; this does.
    // 2048 still OOM'd (Turbopack 2GB + Node V8 ~1.3GB = 3.3GB). Lowered to 1024
    // so Turbopack ~1GB + Node ~1.3GB ~= 2.3GB, leaving ~1.5GB headroom.
    turbopackMemoryLimit: 1024,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
