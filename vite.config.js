import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'GPL - Govindpally Premier League',
        short_name: 'GPL 2026',
        description: 'Official Platform for the Govindpally Premier League',
        theme_color: '#1a6b3a',
        background_color: '#1a1a1a',
        display: 'standalone',
        icons: [
          {
            src: '/icons/manifest-icon-192.maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/manifest-icon-512.maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/apple-icon-180.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'apple touch icon'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
})
