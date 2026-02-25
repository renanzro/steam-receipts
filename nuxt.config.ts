// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [],

  vite: {
    plugins: [tailwindcss()]
  },

  css: ['@mdi/font/css/materialdesignicons.css', '~/assets/css/main.css'],

  runtimeConfig: {
    // Server-side only (not exposed to client)
    steamApiKey: process.env.STEAM_API_KEY || '',
    sessionSecret: process.env.NUXT_SESSION_SECRET || 'your-secret-key-change-in-production',

    // Firebase Admin SDK credentials (server-side only)
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
      privateKey: process.env.FIREBASE_PRIVATE_KEY || ''
    },

    // Public (exposed to client)
    public: {
      appName: 'Steam Receipts'
    }
  },

  devServer: {
    port: 8080
  },

  nitro: {
    preset: 'vercel'
  },

  app: {
    head: {
      title: 'Steam Receipts',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'See your gaming activity in a receipt-style!' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }
      ]
    }
  }
});
