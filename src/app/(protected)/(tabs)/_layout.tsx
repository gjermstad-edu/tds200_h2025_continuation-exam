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
          title: "Oversikt",
          tabBarIcon: ({ color, focused }) => (
            <AntDesign name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="registerInjury"
        options={{
          title: "Ny oppføring",
          tabBarIcon: ({ color, focused }) => (
            <AntDesign name="plus-circle" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, focused }) => (
            <AntDesign name="idcard" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="postDetails/[id]"
        options={{
          href: null,
          headerShown: true,
          title: "Postdetaljer",
          headerBackButtonDisplayMode: "generic",
        }}
      />
    </Tabs>
  );
}
