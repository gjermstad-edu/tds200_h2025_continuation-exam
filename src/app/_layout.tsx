import "../global.css";
import { Stack } from "expo-router";

import { AuthSessionProvider } from "@/providers/authContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AuthSessionProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthSessionProvider>
    </SafeAreaProvider>
  );
}
