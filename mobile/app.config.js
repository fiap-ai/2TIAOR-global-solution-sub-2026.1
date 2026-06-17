// Expo dynamic config.
// `apiUrl` is read from the API_URL env var (set per-profile in eas.json for
// builds) and falls back to localhost so `expo start` keeps working in local dev.
module.exports = {
  expo: {
    name: "TerraVista",
    slug: "terravista",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    scheme: "terravista",
    androidNavigationBar: {
      barStyle: "light-content",
      backgroundColor: "#0b1120",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      package: "com.gabemule.terravista",
      adaptiveIcon: {
        backgroundColor: "#0b1120",
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      apiUrl: process.env.API_URL || "http://localhost:8000/api",
      eas: {
        projectId: "52686a37-5638-4272-9100-5969dd7bf11e",
      },
    },
  },
};
