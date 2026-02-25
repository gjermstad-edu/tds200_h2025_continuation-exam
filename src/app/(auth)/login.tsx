import { useState, useEffect } from "react";

import {
  Pressable,
  Text,
  TextInput,
  View,
  Platform,
  Switch,
  ScrollView,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";

import { signInWithGoogleCredential } from "@/api/googleSignIn";
import * as authApi from "@/api/authApi";
import { useAuthContext } from "@/providers/authContext";
import { FormInput } from "@/components/FormInput";
import {
  displayErrorToast,
  displayInfoToast,
  displaySuccessToast,
} from "@/components/ToastMessage";
import GoogleSignInButton from "@/components/ButtonGoogleSignIn";

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
  // ⭐️ Sjekker e-post
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

  // ⭐️ Sjekker passordet
  function isValidPassword(password: string): boolean {
    return password.length >= 6;
  }

  const passwordHasText: boolean = password.trim().length > 0;
  const passwordIsValid: boolean = passwordHasText
    ? isValidPassword(password)
    : undefined;

  const validPassword: boolean = passwordIsValid;
  const errorPassword: string =
    passwordHasText && passwordIsValid === false
      ? "Passordet må være minst 6 tegn"
      : undefined;

  // GOOGLE SIGN-IN
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
                "Google Sign-in godkjent",
                "Du er nå logget inn 👍",
              );
            })
            .catch((error) => {
              displayErrorToast("Login feilet 🛑", error?.message);
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
        <ScrollView keyboardDismissMode="interactive">
          <View className="py-24 lg:py-12">
            <View className="px-4 md:px-6 items-center">
              <View className="flex flex-col items-center gap-4 text-center">
                <Text
                  role="heading"
                  className="text-3xl text-center native:text-5xl font-bold sm:text-4xl md:text-5xl lg:text-6xl font-rounded"
                >
                  Velkommen til RehabTrace 🤕
                </Text>

                <Text className="mx-auto max-w-[700px] px-10 text-lg text-center text-gray-500 md:text-xl dark:text-gray-400">
                  Registrer skadeoppføringer med indikatorer som smerte, hevelse
                  og bevegelighet – og følg utviklingen fra gang til gang.
                </Text>
              </View>

              {/* Switch LOGG INN - NY BRUKER */}
              <View className="w-11/12 md:w-1/3 p-6 rounded-2xl bg-white border border-gray-200 mt-5">
                <View className="flex-row justify-center items-center bg-gray-100 border border-gray-200 rounded-full px-4 py-2">
                  <Text
                    className={`font-bold ${!isSignUp ? "text-gray-900" : "text-gray-500"}`}
                  >
                    Logg inn
                  </Text>

                  <Switch
                    value={isSignUp}
                    onValueChange={setIsSignUp}
                    trackColor={{ false: "#ccc", true: "#0096C7" }}
                    thumbColor={isSignUp ? "#fff" : "#fff"}
                    className="mx-3"
                  />

                  <Text
                    className={`font-bold ${isSignUp ? "text-gray-900" : "text-gray-500"}`}
                  >
                    Ny bruker
                  </Text>
                </View>

                {/* First and Last Name */}
                {isSignUp && (
                  <View className="mt-4">
                    <FormInput
                      label="Fornavn"
                      value={userFirstName}
                      onChangeText={setUserFirstName}
                      placeholder="Fornavn"
                      autoCapitalize="words"
                      keyboardType="default"
                      valid={validEmail}
                      error={errorEmail}
                    />
                    <FormInput
                      label="Etternavn"
                      value={userLastName}
                      onChangeText={setUserLastName}
                      placeholder="Etternavn"
                      autoCapitalize="words"
                      keyboardType="default"
                      valid={validEmail}
                      error={errorEmail}
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

                  {/* Password */}
                  <FormInput
                    label="Passord"
                    value={password}
                    password={true}
                    onChangeText={setPassword}
                    placeholder="Passord"
                    autoCapitalize="none"
                    keyboardType="default"
                    valid={validPassword}
                    error={errorPassword}
                  />
                </View>

                {/* KNAPP - LOGG INN / LAG NY BRUKER */}
                <View className="mt-6">
                  <Pressable
                    className="bg-sky-600 py-3 rounded-xl items-center mb-3"
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
                          displaySuccessToast("Innlogging vellykket!");

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
                <View className="mt-4">
                  <View className="flex-row items-center my-4">
                    <View className="flex-1 h-[1px] bg-gray-200" />
                    <Text className="mx-3 text-gray-400">eller</Text>
                    <View className="flex-1 h-[1px] bg-gray-200" />
                  </View>

                  <GoogleSignInButton
                    disabled={!request}
                    onPress={() => promptAsync({ useProxy: false })}
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
