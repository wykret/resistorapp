import { backgroundColor } from "react-native-calendars/src/style";

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
    assetBundlePatterns: [
      "**/*",
      "!**/*.webp",
      "!**/*.svg",
      "!**/node_modules/**/*",
      "!**/src/**",
      "!**/*.test.*",
      "!**/*.spec.*"
    ],
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
      package: "com.resistor.resistor",
      enableHermes: true,
      enableProguardInReleaseBuilds: true
    },
    web: {
      bundler: "metro",
      favicon: "./assets/images/favicon.png",
      publicPath: "/resistorapp/_expo/static/",
      scope: "/resistorapp/",
      name: "Resistor App",
      shortName: "Resistor",
      description: "A comprehensive resistor calculator and color code reference app",
      themeColor: "#2E7D32",
      backgroundColor: "#ffffff",
      display: "standalone",
      orientation: "portrait",
      lang: "en",
      dir: "ltr",
      startUrl: "/resistorapp/",
      meta: {
        viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
        "theme-color": "#2E7D32",
        "apple-mobile-web-app-capable": "yes",
        "apple-mobile-web-app-status-bar-style": "default",
        "apple-mobile-web-app-title": "Resistor",
        "msapplication-TileColor": "#2E7D32",
        "msapplication-tap-highlight": "no",
        // Open Graph tags
        "og:title": "Resistor App - Color Code Calculator",
        "og:description": "Calculate resistor values, identify color codes, and learn about electronic components with this comprehensive resistor app.",
        "og:image": "https://wykret.github.io/resistorapp/assets/images/resistor-logo.png",
        "og:url": "https://wykret.github.io/resistorapp/",
        "og:type": "website",
        "og:site_name": "Resistor App",
        // Twitter Card tags
        "twitter:card": "summary_large_image",
        "twitter:title": "Resistor App - Color Code Calculator",
        "twitter:description": "Calculate resistor values, identify color codes, and learn about electronic components with this comprehensive resistor app.",
        "twitter:image": "https://wykret.github.io/resistorapp/assets/images/resistor-logo.png"
      }
    },
    experiments: {
      baseUrl: "/resistorapp",
      typedRoutes: true
    },
    plugins: [
      ["expo-router", { sitemap: false }],
      ["expo-splash-screen", {
        image: "./assets/images/splash-icon.png",
        backgroundColor: "darkgray",
        imageWidth:200,
        resizeMode: "contain"
      }],
      ["expo-build-properties", {
        ios: { useFrameworks: "static" }
      }]
    ],
    extra: {
      router: { origin: false, sitemap: false },
      eas: { projectId: "f69daee3-0996-4e40-bacf-f612c93b0382" }
    },
    runtimeVersion: "1.0.1"
  }
};
