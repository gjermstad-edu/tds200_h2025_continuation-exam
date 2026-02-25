import "../global.css";
import { Stack } from "expo-router";

import { AuthSessionProvider } from "@/providers/authContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AuthSessionProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <Toast position="bottom" bottomOffset={60} />
      </AuthSessionProvider>
    </SafeAreaProvider>
  );
}
