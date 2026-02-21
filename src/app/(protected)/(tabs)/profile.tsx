import React from "react";
import { View, Text, Pressable } from "react-native";
import { useAuthContext } from "@/providers/authContext";

import * as authApi from "@/api/authApi";
import "@/global.css";

export default function Index() {
  const { firebaseUser, userProfile } = useAuthContext();

  return (
    <View className="flex-1 w-full h-full bg-white">
      <Text>Du er logget inn 👍 Dette er profilen din 😄</Text>
      {firebaseUser && (
        <View className="mt-6">
          <Pressable
            className="bg-red-500 py-3 rounded-lg items-center"
            onPress={async () => {
              try {
                await authApi.signOutUser();
                showToast("success", "Logget ut!");
                console.info(`User signed out.`);
              } catch (error: any) {
                showToast("error", "Feil ved utlogging", error.message);
                console.error(error?.message);
              }
            }}
          >
            <Text className="text-white font-semibold text-lg">Logg ut</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
