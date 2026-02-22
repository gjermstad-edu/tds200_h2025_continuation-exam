import React from "react";
import { Redirect } from "expo-router";
import { useAuthContext } from "../providers/authContext";
import LoadingScreen from "@/components/LoadingScreen";

export default function Index() {
  const { firebaseUser, isAuthLoading } = useAuthContext();

  // Vis at det laster om ikke ferdig lastet inn
  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  // Send til hovedsiden eller login basert på om logget inn eller ikke fra Firebase
  return firebaseUser ? <Redirect href="/home" /> : <Redirect href="/login" />;
}
