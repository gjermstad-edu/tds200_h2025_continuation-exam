import React from "react";
import { Redirect } from "expo-router";
import { useAuthContext } from "../providers/authContext";

export default function Index() {
  const { firebaseUser, isAuthLoading } = useAuthContext();

  // Send til innlogging om ikke logget inn
  if (isAuthLoading) return null;

  // Send til hovedsiden eller login basert på om logget inn eller ikke fra Firebase
  return firebaseUser ? <Redirect href="/home" /> : <Redirect href="/login" />;
}
