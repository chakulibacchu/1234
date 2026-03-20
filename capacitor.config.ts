import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.connect.mobile',
  appName: 'Connect',
  webDir: 'dist',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"],
      googleAuthClientId: "544004357501-e9vqt0qvlpicruv30s6sfhllpae2rsa0.apps.googleusercontent.com"
    }
  }
};

export default config;