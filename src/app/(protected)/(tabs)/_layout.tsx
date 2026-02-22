import React from "react";
import { Tabs } from "expo-router";
import Header from "@/components/Header";
import AntDesign from "@expo/vector-icons/AntDesign";

/*
/ Denne koden er delvis basert på kodebasene fra forelesninger i faget TDS200 ved Høyskolen Kristiania høsten 2025.
/ Brukt med tillatelse.
*/

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true, header: () => <Header /> }}>
      <Tabs.Screen
        name="home"
        options={{
          title: "Hjem",
          tabBarIcon: ({ color, focused }) => (
            <AntDesign name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Min profil",
          tabBarIcon: ({ color, focused }) => (
            <AntDesign name="idcard" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
