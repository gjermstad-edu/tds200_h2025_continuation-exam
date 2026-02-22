import React from "react";
import { Tabs } from "expo-router";
import Header from "@/components/Header";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true, header: () => <Header /> }}>
      <Tabs.Screen name="home" options={{ title: "Hjem" }} />
      <Tabs.Screen name="profile" options={{ title: "Min profil" }} />
    </Tabs>
  );
}
