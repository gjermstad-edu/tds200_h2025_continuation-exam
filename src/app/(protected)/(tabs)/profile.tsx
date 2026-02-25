import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useAuthContext } from "@/providers/authContext";
import * as authApi from "@/api/authApi";
import "@/global.css";
import { displaySuccessToast } from "@/components/ToastMessage";

function ProfileCard(props: any) {
  return (
    <View className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
      <Text className="text-lg font-extrabold text-gray-900 mb-2">
        {props.title}
      </Text>

      {props.children}
    </View>
  );
}

export default function Index() {
  const { firebaseUser, userProfile } = useAuthContext();

  const displayName =
    userProfile?.firstName ?? firebaseUser?.displayName ?? "bruker";

  return (
    <View className="flex-1 bg-gray-100 px-5">
      <ScrollView keyboardDismissMode="interactive">
        <Text className="text-3xl font-bold text-gray-900 mb-1 pt-8">
          Profil
        </Text>
        <Text className="text-gray-600 mb-5">Innstillinger og informasjon</Text>

        {/* Innlogget som */}
        <ProfileCard title="Innlogget som">
          <Text className="text-base text-gray-800">{displayName}</Text>

          {!!firebaseUser?.email && (
            <Text className="text-sm text-gray-500 mt-1">
              {firebaseUser.email}
            </Text>
          )}
        </ProfileCard>

        {/* Viktig info */}
        <ProfileCard title="Viktig informasjon">
          <Text className="text-gray-700 leading-5">
            RehabTrace er et hjelpemiddel for å registrere skadeindikatorer og
            følge utvikling over tid. Appen erstatter ikke medisinsk vurdering.
          </Text>
          <Text className="text-gray-700 leading-5 mt-2">
            Ved forverring, sterke smerter eller bekymring bør du kontakte lege
            eller annet helsepersonell.
          </Text>
        </ProfileCard>

        {/* Personvern */}
        <ProfileCard title="Personvern">
          <Text className="text-gray-700 leading-5 mb-2">
            Skadeoppføringer og notater lagres slik at du kan se dem senere. Du
            kan slette oppføringer du ikke ønsker å beholde.
          </Text>
          <Text className="text-gray-700 leading-5">
            Alle data som lagres i appen er kun synlig for deg når du er
            innlogget. Ingen andre brukere har tilgang.
          </Text>
        </ProfileCard>

        {/* Logg ut */}
        {firebaseUser && (
          <View className="mt-2">
            <Pressable
              className="bg-red-500 py-4 rounded-xl items-center"
              onPress={async () => {
                try {
                  await authApi.signOutUser();

                  displaySuccessToast(
                    "Du er nå logget ut.",
                    "Velkommen tilbake senere ☀️",
                  );
                } catch (error: any) {
                  console.error(
                    `🚨 ERROR in signing out user: ${error?.message} [Source: (tabs)/profile.tsx]`,
                  );
                }
              }}
            >
              <Text className="text-white font-semibold text-lg">Logg ut</Text>
            </Pressable>

            <Text className="text-xs text-gray-500 text-center mt-3">
              Konteeksamen TDS200 h2025 - kandidat 4.
            </Text>
            <Text className="text-xs text-gray-500 text-center mt-3 pb-4">
              demo — ikke for medisinsk bruk.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
