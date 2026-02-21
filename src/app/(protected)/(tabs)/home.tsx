import { View, Text } from "react-native";
import React from "react";
import "@/global.css";

import { useAuthContext } from "@/providers/authContext";

/*
 ** Denne koden er delvis basert på kodebasene fra forelesninger i faget TDS200 ved Høyskolen Kristiania høsten 2025.
 ** Brukt med tillatelse.
 */

export default function Index() {
  const { firebaseUser, userProfile } = useAuthContext();

  return (
    <View className="flex-1 w-full h-full p-5 bg-white">
      <Text>
        Velkommen {firebaseUser.displayName} 👍 Dette er hovedskjermen
      </Text>
    </View>
  );
}
