import React from "react";
import { Link, router } from "expo-router";
import { Text, View, Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import * as authApi from "@/api/authApi";
import { useAuthContext } from "@/providers/authContext";

export default function Header() {
  const { top } = useSafeAreaInsets();
  const { firebaseUser, signOut } = useAuthContext();

  const canGoBack = router.canGoBack();

  return (
    <View style={{ paddingTop: top }}>
      <View className="px-4 lg:px-6 h-14 flex items-center flex-row bg-white border-b border-gray-200">
        {canGoBack ? (
          <Pressable
            onPress={() => router.back()}
            className="mr-3 p-2 rounded-lg"
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={22} color="black" />
          </Pressable>
        ) : (
          <Text className="font-bold text-lg mr-2">🤕</Text>
        )}
        <Link className="font-bold flex-1 text-lg" href="/">
          RehabTrace
        </Link>
        <View className="flex flex-row items-center gap-4 sm:gap-6">
          {firebaseUser && (
            <View>
              <Pressable
                className="bg-red-500 rounded-lg p-1"
                onPress={async () => {
                  try {
                    await signOut();
                    // TODO: showToast("success", "Logget ut!");
                    console.info(`User signed out.`);
                  } catch (error: any) {
                    // TODO: showToast("error", "Feil ved utlogging", error.message);
                    console.error(error?.message);
                  }
                }}
              >
                <Text className="text-white font-semibold text-lg">
                  Logg ut
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
