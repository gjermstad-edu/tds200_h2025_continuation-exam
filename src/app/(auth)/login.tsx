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

import Footer from "@/components/Footer";
import { signInWithGoogleCredential } from "@/api/googleSignIn";
import * as authApi from "@/api/authApi";
import { useAuthContext } from "@/providers/authContext";
import { FormInput } from "@/components/FormInput";
import {
  displayErrorToast,
  displayInfoToast,
  displaySuccessToast,
} from "@/components/ToastMessage";

/*
/ Denne koden er delvis basert på kodebasene fra forelesninger i faget TDS200 ved Høyskolen Kristiania høsten 2025.
/ Brukt med tillatelse.
*/

export default function Page() {
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const { firebaseUser, userProfile } = useAuthContext();

  const userName = firebaseUser?.displayName ?? "";

  // SJEKK INPUT I SKJEMA
  // Sjekker e-post
  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  const emailHasText = userEmail.trim().length > 0;
  const emailIsValid = emailHasText ? isValidEmail(userEmail) : undefined;

  const validEmail = emailIsValid; // boolean | undefined
  const errorEmail =
    emailHasText && emailIsValid === false
      ? "E-post er ikke riktig skrevet"
      : undefined;

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
              displaySuccessToast(
                "Google Sign-in approved",
                "You are logged in 👍",
              );
            })
            .catch((error) => {
              displayErrorToast("Login failed 🛑", error?.message);
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
          displaySuccessToast(
            "Google Sign-In approved",
            "You are logged in 👍",
          ),
        )
        .catch((error) => displayErrorToast("Login failed 🛑", error?.message));
    }
  }, [response]);

  return (
    <>
      <View className="flex-1">
        <View className="py-24 md:py-32">
          <View className="px-4 md:px-6 items-center">
            <View className="flex flex-col items-center gap-4 text-center">
              <Text
                role="heading"
                className="text-3xl text-center native:text-5xl font-bold sm:text-4xl md:text-5xl lg:text-6xl font-rounded"
              >
                Velkommen til RehabTrace 🤕
              </Text>

              <Text className="mx-auto max-w-[700px] text-lg text-center text-gray-500 md:text-xl dark:text-gray-400">
                Vi hjelper idrettsutøvere dokumentere og følge opp lette
                skadeobservasjoner.
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
                <FormInput
                  label="E-post"
                  value={userEmail}
                  onChangeText={setUserEmail}
                  placeholder="E-post"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  valid={validEmail}
                  error={errorEmail}
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

                        displaySuccessToast("Ny brukerkonto opprettet!");
                        console.info(
                          `New user added: ${userFirstName} ${userLastName} at ${userEmail}`,
                        );

                        setPassword("");
                        setUserEmail("");
                      } else {
                        await authApi.signInUser(userEmail, password);
                        displayErrorToast("Innlogging vellykket!");

                        console.info(`User logged in: ${userEmail}`);

                        setPassword("");
                        setUserEmail("");
                      }
                    } catch (error: any) {
                      displayErrorToast(
                        "Feil under autentisering 🛑",
                        error?.message ?? "Ukjent feil",
                      );

                      console.error(
                        `🚨 ERROR during authentication ${error?.message} [Source: login.tsx]`,
                      );
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
                      displayInfoToast(
                        "Avbrutt registrering",
                        "Gått tilbake til innlogging.",
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
            </View>
          </View>
        </View>
      </View>
      <Footer />
    </>
  );
}
