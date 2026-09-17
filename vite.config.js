import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Base path untuk asset & service worker.
// - Development (`npm run dev`) & deploy ke Vercel/Netlify (custom domain / root domain): '/'
// - Deploy ke GitHub Pages sebagai project page (https://<user>.github.io/mutabaah/): '/mutabaah/'
//   Kalau nama repo kamu bukan "mutabaah", ganti juga nilai di bawah ini.
// Dikontrol lewat env var BASE_PATH supaya satu config bisa dipakai untuk kedua target deploy
// (workflow GitHub Pages di .github/workflows/deploy.yml otomatis mengisi BASE_PATH=/mutabaah/).
const base = process.env.BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png'],
      manifest: {
        name: 'Mutabaah',
        short_name: 'Mutabaah',
        description: 'Pelacak target ibadah dan kebiasaan harian, dengan klasemen antar pengguna.',
        theme_color: '#0f766e',
        background_color: '#f0fdfa',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
})
