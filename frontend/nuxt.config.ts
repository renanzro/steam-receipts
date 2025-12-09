// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: ['vuetify-nuxt-module'],

  vuetify: {
    moduleOptions: {
      styles: true,
      autoImport: true
    },
    vuetifyOptions: {
      theme: {
        defaultTheme: 'dark',
        themes: {
          dark: {
            colors: {
              primary: '#171a21',
              secondary: '#1b2838',
              accent: '#66c0f4',
              'accent-border': '#316381',
              background: '#1b2838',
              surface: '#2a475e'
            }
          }
        }
      }
    }
  },

  css: ['@mdi/font/css/materialdesignicons.css', '~/assets/css/main.css'],

  runtimeConfig: {
    // Server-side only (not exposed to client)
    backendUrl: process.env.NUXT_BACKEND_URL || 'http://localhost:3000',
    sessionSecret: process.env.NUXT_SESSION_SECRET || 'your-secret-key-change-in-production',
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
      ]
    }
  }
});
