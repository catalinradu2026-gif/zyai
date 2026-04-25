import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : '*.supabase.co'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    minimumCacheTTL: 2592000, // 30 de zile — reduce re-fetch din Supabase după deploy
  },
  async headers() {
    return [
      {
        // Paginile dinamice nu se cacheaza niciodata
        source: '/(cauta|anunt|marketplace|cont)(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Surrogate-Control', value: 'no-store' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              `img-src 'self' data: https://*.supabase.co https://images.unsplash.com`,
              `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.groq.com wss://speech.platform.bing.com`,
              "font-src 'self' https://fonts.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "media-src 'self' data: blob:",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
};

export default nextConfig;
