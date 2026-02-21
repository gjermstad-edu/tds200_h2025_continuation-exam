import { useState, useEffect } from "react";

import {
  Pressable,
  Text,
  TextInput,
  View,
  Platform,
  Switch,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import Toast from "react-native-toast-message";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { signInWithGoogleCredential } from "@/api/googleSignIn";
import * as authApi from "@/api/authApi";
import { useAuthContext } from "@/providers/authContext";

/*
 ** Denne koden er delvis basert på kodebasene fra forelesninger i faget TDS200 ved Høyskolen Kristiania høsten 2025.
 ** Brukt med tillatelse.
 */

export default function Page() {
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const { firebaseUser, userProfile } = useAuthContext();

  let userName = "";
  if (firebaseUser) {
    userName = firebaseUser.displayName;
  }

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!webClientId) {
    throw new Error(
      "Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in environment variables",
    );
  }

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: webClientId,
    redirectUri: "http://127.0.0.1:8081/redirect",
    responseType: "id_token",
    scopes: ["openid", "profile", "email"],
  });

  useEffect(() => {
    //web must handle redirect and popup message
    if (Platform.OS === "web") {
      const handlePopupMessage = (event: MessageEvent) => {
        if (event.data?.type === "GOOGLE_AUTH_SUCCESS" && event.data.idToken) {
          signInWithGoogleCredential(event.data.idToken)
            .then(() => {
              Toast.show({ type: "success", text1: "Google login success" });
            })
            .catch((err) => {
              Toast.show({
                type: "error",
                text1: "Login failed",
                text2: err.message,
              });
            });
        }
      };

      window.addEventListener("message", handlePopupMessage);
      return () => window.removeEventListener("message", handlePopupMessage);
    }
    //iOs simulator can directly get idToken from response
    if (
      Platform.OS !== "web" &&
      response?.type === "success" &&
      response.authentication?.idToken
    ) {
      const idToken = response.authentication.idToken;
      signInWithGoogleCredential(idToken)
        .then(() =>
          Toast.show({ type: "success", text1: "Google login success" }),
        )
        .catch((err) =>
          Toast.show({
            type: "error",
            text1: "Login failed",
            text2: err.message,
          }),
        );
    }
  }, [response]);

  const showToast = (
    type: "success" | "info" | "error",
    text1: string,
    text2?: string,
  ) => {
    Toast.show({
      type,
      text1,
      text2,
      position: "bottom",
      visibilityTime: 3000,
      onHide: () => {
        console.log("Toast is gone, you can trigger something now.");
      },
    });
  };

  return (
    <>
      <Header />
      <View className="flex-1">
        <View className="py-12 md:py-24 lg:py-32 xl:py-48">
          <Toast />
          <View className="px-4 md:px-6 items-center">
            <View className="flex flex-col items-center gap-4 text-center">
              {firebaseUser && (
                <Text
                  role="heading"
                  className="text-3xl text-red-600 text-center native:text-5xl font-bold sm:text-4xl md:text-5xl lg:text-6xl font-rounded"
                >
                  Welcome {userName}
                </Text>
              )}
              {!firebaseUser && (
                <Text
                  role="heading"
                  className="text-3xl text-red-600 text-center native:text-5xl font-bold sm:text-4xl md:text-5xl lg:text-6xl font-rounded"
                >
                  Velkommen til Project RAMMEVERK 🔨🖼️
                </Text>
              )}

              <Text className="mx-auto max-w-[700px] text-lg text-center text-gray-500 md:text-xl dark:text-gray-400">
                Utforsk og lær mer om Firma. Oppdag tjenestene våre nå.
              </Text>
            </View>
            <View className="flex flex-col w-11/12 md:w-1/3 p-6 rounded-2xl">
              {/* Switch */}
              <View className="flex-row justify-center items-center my-5">
                <Text className="text-gray-700 font-medium">Logg inn</Text>
                <Switch
                  value={isSignUp}
                  onValueChange={setIsSignUp}
                  trackColor={{ false: "#ccc", true: "#0096C7" }}
                  thumbColor={isSignUp ? "#eee" : "#000"}
                  className="mx-3"
                />
                <Text className="text-gray-700 font-medium">Ny bruker</Text>
              </View>

              {/* First and Last Name */}
              {isSignUp && (
                <View className="mt-4">
                  <Text className="text-gray-800 mb-1">Navnet ditt</Text>
                  <TextInput
                    value={userFirstName}
                    onChangeText={setUserFirstName}
                    placeholder="Fornavn"
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <TextInput
                    value={userLastName}
                    onChangeText={setUserLastName}
                    placeholder="Etternavn"
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  />
                </View>
              )}

              {/* Email */}
              <View className="mt-4">
                <Text className="text-gray-800 mb-1">E-post</Text>
                <TextInput
                  value={userEmail}
                  onChangeText={setUserEmail}
                  placeholder="Epost"
                  autoCapitalize="none"
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
              </View>

              {/* Password */}
              <View className="mt-4">
                <Text className="text-gray-800 mb-1">Passord</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Passord"
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
              </View>

              {/* KNAPP - LOGG INN / LAG NY BRUKER */}
              <View className="mt-6 space-y-3">
                <Pressable
                  className="bg-sky-600 py-3 rounded-lg items-center"
                  onPress={async () => {
                    try {
                      if (isSignUp) {
                        await authApi.signUpUserWithEmail(
                          userEmail,
                          password,
                          userFirstName,
                          userLastName,
                        );
                        showToast("success", "Bruker opprettet!");
                        console.info(
                          `New user added: ${userFirstName} ${userLastName} at ${userEmail}`,
                        );
                        setPassword("");
                        setUserEmail("");
                      } else {
                        await authApi.signInUser(userEmail, password);
                        showToast("success", "Innlogging vellykket!");
                        console.info(`User logged in: ${userEmail}`);
                        setPassword("");
                        setUserEmail("");
                      }
                    } catch (error: any) {
                      showToast(
                        "error",
                        "Feil under autentisering",
                        error?.message ?? "Ukjent feil",
                      );
                      console.error(error?.message);
                    }
                  }}
                >
                  <Text className="text-white font-semibold text-lg">
                    {isSignUp ? "Lag ny bruker" : "Logg inn"}
                  </Text>
                </Pressable>

                {isSignUp && (
                  <Pressable
                    className="border border-gray-400 py-3 rounded-lg items-center"
                    onPress={() => {
                      setIsSignUp(false);
                      showToast(
                        "info",
                        "Avbrutt registrering",
                        "Gått tilbake til innlogging",
                      );
                    }}
                  >
                    <Text className="text-gray-800 font-semibold text-lg">
                      Avbryt
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* Google Auth */}
              <View className="mt-6">
                <Pressable
                  disabled={!request}
                  onPress={() => promptAsync({ useProxy: false })}
                  className="bg-sky-600 py-3 rounded-lg items-center"
                >
                  <Text className="text-white">Google Sign-In</Text>
                </Pressable>
              </View>

              {/* KNAPP - Logg ut */}
              {firebaseUser && (
                <View className="mt-6">
                  <Pressable
                    className="bg-red-500 py-3 rounded-lg items-center"
                    onPress={async () => {
                      try {
                        await authApi.signOutUser();
                        showToast("success", "Logget ut!");
                        console.info(`User signed out.`);
                      } catch (error: any) {
                        showToast("error", "Feil ved utlogging", error.message);
                        console.error(error?.message);
                      }
                    }}
                  >
                    <Text className="text-white font-semibold text-lg">
                      Logg ut
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
      <Footer />
    </>
  );
}
