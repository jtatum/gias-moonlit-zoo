import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const buildId = process.env.GITHUB_SHA?.slice(0, 7) ?? 'local';
const base = process.env.BASE_PATH ?? '/';
const publicOrigin = (process.env.PUBLIC_ORIGIN ?? 'http://127.0.0.1:5173').replace(
  /\/$/,
  '',
);

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(`0.1.0+${buildId}`),
  },
  plugins: [
    {
      name: 'moonlight-zoo-social-metadata',
      transformIndexHtml(html) {
        return html.replaceAll(
          '__SOCIAL_IMAGE__',
          `${publicOrigin}${base}og.png`,
        );
      },
    },
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Gia and the Moonlight Zoo',
        short_name: 'Moonlight Zoo',
        description: "A musical animal adventure that remembers Gia's story.",
        theme_color: '#16265c',
        background_color: '#071843',
        display: 'standalone',
        orientation: 'any',
        scope: '.',
        start_url: '.',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: false,
        globPatterns: ['**/*.{html,js,css,png,webp,json,woff2,mp3,ogg}'],
        globIgnores: ['og.png', 'icon-source.png'],
        navigateFallback: 'index.html',
      },
    }),
  ],
});
