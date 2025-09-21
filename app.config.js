export default {
  expo: {
    name: "Resistor",
    slug: "resistor",
    version: "1.0.0",
    orientation: "portrait",
    icon: "https://ucarecdn.com/7f831278-f08d-4e11-973c-4a2024b6c5d6/-/format/auto/",
    userInterfaceStyle: "automatic",
    scheme: "resistor",
    splash: {
      image: "https://ucarecdn.com/7f831278-f08d-4e11-973c-4a2024b6c5d6/-/format/auto/",
      resizeMode: "contain",
      backgroundColor: "#2E7D32"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.resistor.app",
      buildNumber: "1"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "https://ucarecdn.com/7f831278-f08d-4e11-973c-4a2024b6c5d6/-/format/auto/",
        backgroundColor: "#2E7D32"
      },
      package: "com.resistor.app",
      versionCode: 1
    },
    web: {
      favicon: "https://ucarecdn.com/7f831278-f08d-4e11-973c-4a2024b6c5d6/-/format/auto/"
    },
    plugins: [
      "expo-router"
    ],
    experiments: {
      typedRoutes: true
    }
  }
};