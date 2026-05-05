import type { NextConfig } from "next";

// CSP connect-src covers all external origins the browser fetches directly.
// Server-side API routes (hadith, quran tafsir, currency, geoapify, etc.) do
// NOT need to appear here because those fetches originate from the server.
const CSP_DIRECTIVES = [
  "default-src 'self'",
  // Next.js requires 'unsafe-inline' for its hydration runtime scripts.
  // 'unsafe-eval' is needed in development for fast-refresh; production
  // builds technically don't require it but it is kept to avoid breakage
  // while testing. Remove after verifying no eval in production bundles.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  // Allow all HTTPS images to support map tiles and any dynamic image sources;
  // data: and blob: are needed for canvas, WebGL, and map rendering.
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // Browser-initiated fetch targets:
  //   *.supabase.co + wss: — Supabase JS client (auth, realtime, DB)
  //   api.aladhan.com       — Prayer times (useRamadanCountdown calls directly)
  //   cdn.islamic.network   — Quran audio streaming
  //   tile.openstreetmap.org — MapLibre GL tile fetches
  //   vitals.vercel-insights.com / va.vercel-scripts.com — Vercel Analytics
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.aladhan.com https://cdn.islamic.network https://tile.openstreetmap.org https://vitals.vercel-insights.com https://va.vercel-scripts.com",
  "media-src 'self' blob: https://cdn.islamic.network",
  // Service worker and MapLibre WebWorkers use blob: URLs.
  "worker-src 'self' blob:",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ');

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ['react-map-gl', 'maplibre-gl'],

  async headers() {
    return [
      // ── Security headers applied to every response ──────────────────────
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: CSP_DIRECTIVES,
          },
          {
            // max-age=1 year; includeSubDomains; preload — enforce HTTPS
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Allow geolocation on self (used for prayer times / places finder).
            // Block microphone, camera, and payment — not used by this app.
            key: 'Permissions-Policy',
            value: 'geolocation=(self), microphone=(), camera=(), payment=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      // ── PWA: Service Worker ──────────────────────────────────────────────
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      // ── PWA: Web App Manifest ────────────────────────────────────────────
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
