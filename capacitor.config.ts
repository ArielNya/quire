import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.quire.desk",
  appName: "Quire",
  webDir: "apk-www",
  backgroundColor: "#0c0c0d",
  android: {
    allowMixedContent: false,
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0c0c0d",
    },
    Keyboard: {
      resize: "body",
    },
  },
};

export default config;
