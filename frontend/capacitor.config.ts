import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.acuaplus.app',
  appName: 'AcuaPlus',
  webDir: '.next',
  server: {
    url: 'http://localhost:3000',
    cleartext: true,
  },
};

export default config;
