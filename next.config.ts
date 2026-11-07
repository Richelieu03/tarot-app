import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Same-origin proxy for Supabase (see src/lib/supabase.ts): keeps login working where *.supabase.co is blocked
  async rewrites() {
    return [
      {
        source: "/sb/:path*",
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
