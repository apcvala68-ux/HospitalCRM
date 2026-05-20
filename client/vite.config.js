import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg', 'icons.svg'],
    manifest: {
      name: 'Royale Hospital CRM',
      short_name: 'RoyaleCRM',
      description: 'Hospital management system for patient care, billing, pharmacy, and operations.',
      theme_color: '#b46a24',
      background_color: '#0b0c0e',
      display: 'standalone',
      icons: [
        { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^https?:\/\/.*\/api\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
          },
        },
      ],
    },
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
