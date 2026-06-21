import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';

const pixelFortressDarkTheme = {
  dark: true,
  colors: {
    background: '#0b0c10',
    surface: '#1f2833',
    primary: '#ff6b35',
    secondary: '#4ecdc4',
    error: '#d32f2f',
    info: '#29b6f6',
    success: '#2e7d32',
    warning: '#ffa000',
  },
};

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'pixelFortressDarkTheme',
    themes: {
      pixelFortressDarkTheme,
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
});

export default vuetify;
