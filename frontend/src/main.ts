import { createApp } from 'vue';
import App from './App.vue';

// Vuetify
import 'vuetify/styles/main.css';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

import './style.css';

const vuetify = createVuetify({
  components,
  directives,
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
});

const app = createApp(App);
app.use(vuetify);
app.mount('#app');
