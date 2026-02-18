import "../global.css";
import { Slot } from "expo-router";
import { View } from "react-native";
import Toast from "react-native-toast-message";

import { AuthSessionProvider, useAuthContext } from "@/providers/authContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AuthSessionProvider>
        <View className="flex-1 w-full h-full bg-white">
          <Slot />
          <Toast />
        </View>
      </AuthSessionProvider>
    </SafeAreaProvider>
  );
}
