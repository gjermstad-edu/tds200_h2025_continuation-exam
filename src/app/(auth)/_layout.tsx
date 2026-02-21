import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuthContext } from "@/providers/authContext";
import LoadingScreen from "@/components/LoadingScreen";

export default function AuthLayout() {
  const { firebaseUser, isAuthLoading } = useAuthContext();

  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  // Hvis bruker allerede er logget inn, send til hjem-skjermen
  if (firebaseUser) {
    return <Redirect href="/home" />;
  }

  // Ikke logget inn sendes bruker til login-skjermen
  return <Stack screenOptions={{ headerShown: false }} />;
}
