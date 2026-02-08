import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { COLORS } from "../constants/theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.surface },
          headerTintColor: COLORS.primary,
          headerTitleStyle: { fontWeight: "bold", color: COLORS.text },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="history/add"
          options={{ title: "晩御飯を記録", presentation: "modal" }}
        />
        <Stack.Screen
          name="history/[id]"
          options={{ title: "履歴の詳細" }}
        />
        <Stack.Screen
          name="fridge/add"
          options={{ title: "材料を追加", presentation: "modal" }}
        />
        <Stack.Screen
          name="fridge/[id]"
          options={{ title: "材料の詳細" }}
        />
      </Stack>
    </>
  );
}
