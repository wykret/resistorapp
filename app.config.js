export default {
  expo: {
    name: "Resistor",
    slug: "resistor",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    scheme: "resistor",
    splash: {
      image: "./assets/images/splash-icon.png",
      imageWidth: 200,
      resizeMode: "contain",
      backgroundColor: "#2E7D32"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.resistor.resistor",
      infoPlist: {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.resistor.resistor"
    },
    web: {
      bundler: "metro",
      favicon: "./assets/images/favicon.png",
      output: {
        publicPath: "/resistorapp/", // 👈 caminho certo pro GitHub Pages
      }
    },
    plugins: [
      ["expo-router", { sitemap: false }],
      ["expo-splash-screen", {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain"
      }],
      ["expo-build-properties", {
        ios: { useFrameworks: "static" }
      }]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: { origin: false, sitemap: false },
      eas: { projectId: "f69daee3-0996-4e40-bacf-f612c93b0382" }
    },
    runtimeVersion: "1.0.1"
  }
};

