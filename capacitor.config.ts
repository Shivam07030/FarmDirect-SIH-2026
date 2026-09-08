import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.agronex.farmdirect',
  appName: 'FarmDirect',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
