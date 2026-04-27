import type { NextConfig } from "next";

const r2PublicUrl = process.env.R2_PUBLIC_URL || ''
const r2Host = r2PublicUrl ? (() => { try { return new URL(r2PublicUrl).hostname } catch { return '' } })() : ''
const r2Pattern = r2Host ? `https://${r2Host}` : ''

const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp', '@gradio/client', '@huggingface/inference'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      ...(r2Host ? [{ protocol: 'https' as const, hostname: r2Host }] : []),
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    minimumCacheTTL: 2592000,
  },
  async headers() {
    const imgSrc = [
      "'self'", 'data:', 'blob:',
      'https://*.supabase.co',
      'https://*.r2.dev',
      r2Pattern,
      'https://images.unsplash.com',
    ].filter(Boolean).join(' ')

    const connectSrc = [
      "'self'",
      'https://*.supabase.co',
      'wss://*.supabase.co',
      'https://api.groq.com',
      'wss://speech.platform.bing.com',
      'https://unpkg.com',
      'https://staticimgly.com',
      'https://*.staticimgly.com',
      'https://rembg-service-fqko.onrender.com',
      r2Pattern,
    ].filter(Boolean).join(' ')

    return [
      {
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
          { key: 'Permissions-Policy', value: 'camera=(self), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          // Necesare pentru SharedArrayBuffer (ONNX/WASM background removal)
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // blob: necesar pentru web workers (WASM background removal)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
              // worker-src blob: permite crearea web workers din blob URLs
              "worker-src blob: 'self'",
              `img-src ${imgSrc}`,
              `connect-src ${connectSrc}`,
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
