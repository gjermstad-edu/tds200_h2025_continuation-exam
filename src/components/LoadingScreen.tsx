import React from "react";
import { View, ActivityIndicator, Text } from "react-native";

// Liten laste-skjerm for å vite at Auth laster så det ikke virker som om den henger :)

export default function LoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      <ActivityIndicator size="large" />
      <Text>Laster inn siden...</Text>
      <Text>Vennligst vent ☀️</Text>
    </View>
  );
}
