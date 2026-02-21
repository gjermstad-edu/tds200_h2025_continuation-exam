import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuthContext } from "@/providers/authContext";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";

export default function ProtectedLayout() {
  const { firebaseUser, isAuthLoading } = useAuthContext();

  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  // Hvis ikke logget inn så send til logins-skjermen
  if (!firebaseUser) {
    return <Redirect href="/login" />;
  }

  // Om logget inn vises hva som ligger bak Router Guard (hjem-skjermen)
  return (
    <Stack
      screenOptions={{
        header: () => <Header />,
        headerShown: true,
      }}
    />
  );
}
