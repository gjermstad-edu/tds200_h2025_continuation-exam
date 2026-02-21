import React from "react";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: "Hjem" }} />
      <Tabs.Screen name="profile" options={{ title: "Min profil" }} />
    </Tabs>
  );
}
