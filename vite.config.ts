import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { VitePWA } from 'vite-plugin-pwa'

// SINGLE=1 builds one self-contained HTML file (used for quick previews).
export default defineConfig({
  base: './',
  plugins: [
    react(),
    ...(process.env.SINGLE
      ? [viteSingleFile()]
      : [
          VitePWA({
            registerType: 'autoUpdate',
            workbox: { globPatterns: ['**/*.{js,css,html,woff2,png,svg}'], navigateFallback: 'index.html' },
            manifest: {
              name: 'Daily Planner',
              short_name: 'Daily Planner',
              lang: 'ar',
              dir: 'rtl',
              start_url: './',
              scope: './',
              display: 'standalone',
              background_color: '#EDF1EF',
              theme_color: '#EDF1EF',
              icons: [
                { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
                { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
              ],
            },
          }),
        ]),
  ],
})
