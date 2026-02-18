import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "CookRecipe",
  slug: "cookrecipe",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    backgroundColor: "#FF6B35",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.cookrecipe.app",
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#FF6B35",
    },
    package: "com.cookrecipe.app",
  },
  scheme: "cookrecipe",
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
    eas: {
      projectId: "ba376f25-9751-4e7f-ba1d-1924d6e87df5",
    },
  },
  plugins: ["expo-router"],
});
