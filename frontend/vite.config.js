import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@app':     fileURLToPath(new URL('src/app',     import.meta.url)),
      '@shared':  fileURLToPath(new URL('src/shared',  import.meta.url)),
      '@modules': fileURLToPath(new URL('src/modules', import.meta.url)),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-icon-192.jpg', 'pwa-icon-512.jpg'],

      manifest: {
        name: 'Certificate Validator — Crest',
        short_name: 'CertValidator',
        description: 'Offline-first RSA-2048 + blockchain certificate verification platform',
        theme_color: '#0a0a0a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-icon-192.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
            purpose: 'any maskable',
          },
          {
            src: 'pwa-icon-512.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable',
          },
        ],
      },

      workbox: {
        // ── App shell: cache-first ──────────────────────────────────────────
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,svg,ico,jpg,png,woff2}'],
        cleanupOutdatedCaches: true,

        runtimeCaching: [
          // ── Public keys: stale-while-revalidate (offline verification) ───
          // These are the RSA public keys used to verify certificate signatures
          // offline. We use stale-while-revalidate so the verifier always works,
          // and keys are refreshed in the background when connectivity returns.
          {
            urlPattern: /\/api\/public-key\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'public-keys-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }, // 7 days
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // ── Revocation status: stale-while-revalidate (offline sync) ─────
          // Revocation lists are cached for offline verification. When online,
          // the cache is refreshed automatically. This ensures a previously
          // revoked certificate still shows REVOKED even without connectivity.
          {
            urlPattern: /\/api\/certificates?\/.*\/revocation-status/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'revocation-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 }, // 24 hours
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // ── Verification API: network-first (freshness preferred) ─────────
          {
            urlPattern: /\/api\/verify/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'verify-api-cache',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 }, // 1 hour
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // ── Static API responses: stale-while-revalidate ─────────────────
          {
            urlPattern: /\/api\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 5 }, // 5 min
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },

      // Dev options: enable service worker in dev mode for testing
      devOptions: {
        enabled: false, // set true to test SW in dev; keep false in prod dev flow
      },
    }),
  ],
});
