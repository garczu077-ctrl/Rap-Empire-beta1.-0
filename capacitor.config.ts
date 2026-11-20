import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.garczustudios.rapempire',
  appName: 'Rap Empire Beta',
  webDir: 'dist',
  backgroundColor: '#06060a',
  server: {
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#06060a',
    allowMixedContent: false,
  },
};

export default config;
