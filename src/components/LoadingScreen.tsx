import React from "react";
import { View, ActivityIndicator, Text } from "react-native";

// Liten laste-skjerm for å vite at Auth laster så det ikke virker som om den henger :)

type LoadingProps = {
  line1?: string;
  line2?: string;
};

export default function LoadingScreen({
  line1 = "Laster inn siden...",
  line2 = "Vennligst vent ☀️",
}: LoadingProps) {
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
      <Text>{line1}</Text>
      <Text>{line2}</Text>
    </View>
  );
}
