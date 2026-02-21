import React from "react";
import { View, Text, Pressable } from "react-native";
import { useAuthContext } from "@/providers/authContext";

import * as authApi from "@/api/authApi";
import "@/global.css";

export default function Index() {
  const { firebaseUser, userProfile } = useAuthContext();

  return (
    <View className="flex-1 w-full h-full p-5 bg-white items-center">
      <Text>
        Du er logget inn {userProfile.firstName} 👍 Dette er profilen din 😄
      </Text>
      {firebaseUser && (
        <View className="mt-6 w-1/2 md:w-1/3">
          <Pressable
            className="bg-red-500 py-3 rounded-lg items-center"
            onPress={async () => {
              try {
                await authApi.signOutUser();
              } catch (error: any) {
                console.error(
                  `🚨 ERROR in signing out user: ${error?.message} [Source: (tabs)/profile.tsx]`,
                );
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
