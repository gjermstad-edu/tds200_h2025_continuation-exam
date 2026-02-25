import React from "react";
import { useState } from "react";
import {
  Pressable,
  TextInput,
  Text,
  View,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { EvilIcons } from "@expo/vector-icons";

import * as postApi from "@/api/postApi";
import SelectImageModal from "@/components/SelectImageModal";
import { useAuthContext } from "@/providers/authContext";
import { InjuryStatus, PostData } from "@/models/PostData";
import { InjuryLocation } from "@/models/PostCategories";
import InjuryLocationPicker from "@/components/InjuryLocationPicker";
import { NumberPicker } from "@/components/NumberPicker";
import { router } from "expo-router";
import { calculateStatus } from "@/util/calculateStatusIndicator";
import {
  displayErrorToast,
  displayInfoToast,
  displaySuccessToast,
} from "@/components/ToastMessage";
import FormCard from "@/components/FormCard";
import SectionHelp from "@/components/SectionHelp";

export default function Index() {
  // This component is a post creation form that lets users:
  // - Add images (via camera/gallery).
  // - Input a title, description, and hashtags.
  // - Automatically attach their username as author.
  // - Save the post (calls addNewPost) or cancel.
  // It is also styled using Tailwind utility classes.

  const [titleText, setTitleText] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  const [selectedInjury, setSelectedInjury] = useState<InjuryLocation | null>(
    null,
  );
  const [painLevel, setPainLevel] = useState(0);
  const [isSwelling, setIsSwelling] = useState(false);
  const [isMobilityLimited, setIsMobilityLimited] = useState(false);
  const [temperature, setTemperature] = useState(37);
  const [statusIndicatorStatus, setStatusIndicatorStatus] =
    useState<InjuryStatus>("ny skade");
  const [statusExplaination, setStatusExplaination] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isReadyToSave, setIsReadyToSave] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isStatusWaiting, setIsStatusWaiting] = useState(false);
  const [isSavingWaiting, setIsSavingWaiting] = useState(false);
  const [formIsChanged, setFormIsChanged] = useState(true);

  const { firebaseUser, userProfile } = useAuthContext();

  const isDisabled: boolean =
    !isReadyToSave || isSaving || images.length == 0 || formIsChanged;

  const readyForStatus: boolean =
    selectedInjury != null && painLevel != 0 && images.length != 0;

  // Logikken for å beregne status
  async function handleStatus(oldPosts: PostData[]) {
    setIsStatusWaiting(true);
    const calculatedStatus = await calculateStatus(
      selectedInjury,
      painLevel,
      isSwelling,
      isMobilityLimited,
      temperature,
      oldPosts,
    );

    setStatusIndicatorStatus(calculatedStatus.status);
    setStatusExplaination(calculatedStatus.newStatusExplaination);

    setFormIsChanged(false);
    setIsReadyToSave(true);
    setIsStatusWaiting(false);
  }

  // Lagrer skadeskjema
  const handleSave = async () => {
    // Ekstra sikkerhet (selv om disabled dekker det meste)
    if (!isReadyToSave || isSaving) return;

    setIsSavingWaiting(true);
    setIsSaving(true);
    const safeTitle =
      titleText.trim() || `Oppføring: ${selectedInjury ?? "skade"}`;

    try {
      await postApi.createPost({
        title: safeTitle,
        description: descriptionText,
        images,
        injuryLocation: selectedInjury,
        painLevel,
        swelling: isSwelling,
        mobilityLimit: isMobilityLimited,
        temperature,
        statusIndicator: statusIndicatorStatus,
        statusExplanation: statusExplaination,
      });

      resetFields();

      router.replace("/home");

      displaySuccessToast(`Oppføring for ${selectedInjury} lagret.`);
    } catch (error) {
      console.error("🚨 ERROR saving post:", error?.message);

      displayErrorToast(
        "Kunne ikke lagre oppføring 🛑",
        "Vennligst prøv igjen.",
      );
    } finally {
      setIsSavingWaiting(false);
      setIsSaving(false);
    }
  };

  // Resetter skjema
  function resetFields() {
    setTitleText("");
    setDescriptionText("");
    setSelectedInjury(null);
    setPainLevel(0);
    setIsSwelling(false);
    setIsMobilityLimited(false);
    setTemperature(37);
    setStatusIndicatorStatus("ny skade");
    setStatusExplaination("");
    setIsReadyToSave(false);
    setImages([]);
    setIsCameraOpen(false);
    setFormIsChanged(true);
  }

  // Setter farge for statusboksen
  const statusBoxStyleByStatus: Record<string, string> = {
    "ny skade": "bg-orange-100 border-orange-300",
    forbedres: "bg-green-100 border-green-300",
    stabil: "bg-yellow-100 border-yellow-300",
    forverres: "bg-red-100 border-red-300",
    frisk: "bg-emerald-100 border-emerald-300",
  };
  const statusBoxClass =
    statusBoxStyleByStatus[statusIndicatorStatus] ??
    "bg-gray-100 border-gray-300";

  return (
    <View className="flex-1 bg-gray-100 px-5">
      {/* Camera Modal */}
      {/* Note that multiple images can be added to a post. 
              SelectImageModal will popup when isCameraOpen is true.
              And it allows you to select images from camera or gallery.
              It passes selected images back via setImages prop. */}
      <Modal visible={isCameraOpen} animationType="slide">
        <SelectImageModal
          closeModal={() => setIsCameraOpen(false)}
          setImages={setImages}
          currentImages={images}
        />
      </Modal>
      <ScrollView
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingVertical: 32 }}
      >
        {/* Form container */}
        <View className="pb-10">
          {/* Header */}
          <View className="">
            <Text className="text-3xl font-bold text-gray-900 mb-1">
              Ny oppføring
            </Text>
            <Text className="text-gray-600 mb-5">
              Registrer en skadeobservasjon
            </Text>
          </View>

          {/* KORT 1: Bilder */}
          <FormCard title="Bilder">
            <SectionHelp>
              Legg til minst ett bilde av skaden (obligatorisk).
            </SectionHelp>

            <Pressable
              onPress={() => {
                setIsCameraOpen(true);
                setFormIsChanged(true);
              }}
              className="rounded-xl border-2 border-dashed border-gray-400 bg-gray-50 h-44 justify-center items-center"
            >
              <EvilIcons name="image" size={70} color="gray" />
              <Text className="text-gray-500 mt-2">
                Trykk for å legge til bilder
              </Text>
            </Pressable>

            {images.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mt-4"
              >
                {images.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    className="w-24 h-24 rounded-xl mr-3 border border-gray-200"
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            )}
          </FormCard>

          {/* KORT 2: Grunnleggende indikatorer */}
          <FormCard title="Grunnleggende indikatorer">
            <SectionHelp>(Obligatorisk)</SectionHelp>

            <Text className="text-gray-700 font-bold mb-1">Skadelokasjon</Text>
            <InjuryLocationPicker
              selectedLocation={selectedInjury}
              onChange={(newValue) => {
                setSelectedInjury(newValue);
                setFormIsChanged(true);
              }}
            />

            <View className="mt-5">
              <Text className="text-gray-700 font-semibold mb-1">
                Smertenivå (1 = ingen smerte / 10 = helvete)
              </Text>
              <View className="mt-2">
                <NumberPicker
                  min={1}
                  max={10}
                  value={painLevel}
                  onChange={(newValue) => {
                    setPainLevel(newValue);
                    setFormIsChanged(true);
                  }}
                />
              </View>
            </View>

            {/* Hevelse */}
            <View className="mt-5">
              <Text className="text-gray-700 font-semibold mb-2">
                Er det hevelse på/rundt skaden?
              </Text>

              <View className="flex-row items-center justify-between">
                <Text className="text-gray-800 flex-1 mr-3">
                  {isSwelling ? "👍 Det ER hevelse" : "👎 Det er IKKE hevelse"}
                </Text>

                <Pressable
                  onPress={() => {
                    setIsSwelling(!isSwelling);
                    setFormIsChanged(true);
                  }}
                  className="self-start min-w-[72px] px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 items-center justify-center"
                >
                  <Text className="text-blue-700 font-semibold">Endre</Text>
                </Pressable>
              </View>
            </View>

            {/* Bevegelsesbegrensning */}
            <View className="mt-5">
              <Text className="text-gray-700 font-semibold mb-2">
                Har du begrensning i bevegelse av skaden?
              </Text>

              <View className="flex-row items-center justify-between">
                <Text className="text-gray-800 flex-1 mr-3">
                  {isMobilityLimited
                    ? "👍 JA, jeg har begrensning"
                    : "👎 NEI, jeg har ingen begrensning"}
                </Text>

                <Pressable
                  onPress={() => {
                    setIsMobilityLimited(!isMobilityLimited);
                    setFormIsChanged(true);
                  }}
                  className="self-start min-w-[72px] px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 items-center justify-center"
                >
                  <Text className="text-blue-700 font-semibold">Endre</Text>
                </Pressable>
              </View>
            </View>

            {/* Temperatur */}
            <View className="mt-5">
              <Text className="text-gray-700 font-semibold mb-1">
                Hvilken temperatur har du (velg nærmeste hele tall)?
              </Text>
              <View className="mt-2">
                <NumberPicker
                  min={34}
                  max={42}
                  steps={1}
                  value={temperature}
                  onChange={(newValue) => {
                    setTemperature(newValue);
                    setFormIsChanged(true);
                  }}
                />
              </View>
            </View>
          </FormCard>

          {/* KORT 3: Brukerbeskrivelse */}
          <FormCard title="Beskrivelse">
            <SectionHelp>(Valgfritt)</SectionHelp>
            <TextInput
              multiline
              numberOfLines={3}
              onChangeText={setDescriptionText}
              value={descriptionText}
              className="border border-gray-200 rounded-xl p-3 bg-gray-50 h-24"
              placeholder="Gi en kort beskrivelse av skaden og indikatorer."
            />
          </FormCard>

          {/* KORT 4: Statusberegning */}
          <FormCard title="Status">
            <SectionHelp>Beregn status før du kan lagre.</SectionHelp>

            <Pressable
              disabled={!readyForStatus || isStatusWaiting}
              className={`py-3 rounded-xl items-center ${
                !readyForStatus || isStatusWaiting
                  ? "bg-gray-300"
                  : "bg-emerald-600"
              }`}
              onPress={async () => {
                const oldPosts =
                  await postApi.getRemoteFilteredPosts(selectedInjury);
                await handleStatus(oldPosts);
              }}
            >
              {isStatusWaiting ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="white" />
                  <Text className="text-white font-semibold ml-2">
                    Beregner...
                  </Text>
                </View>
              ) : (
                <Text
                  className={`font-semibold ${!readyForStatus ? "text-black" : "text-white"}`}
                >
                  Beregn status
                </Text>
              )}
            </Pressable>

            {formIsChanged === false && (
              <View className={`${statusBoxClass} border rounded-xl p-4 mt-4`}>
                <Text className="text-lg">
                  Skadestatus:{" "}
                  <Text className="font-bold">{statusIndicatorStatus}</Text>
                </Text>
                <Text className="text-sm mt-1">{statusExplaination}</Text>
              </View>
            )}
          </FormCard>

          {/* KORT 5: Lagre / Reset */}
          <FormCard title="Lagre">
            <View className="flex-row gap-3">
              <Pressable
                className={`flex-1 py-3 rounded-xl items-center ${
                  isDisabled ? "bg-gray-300" : "bg-emerald-600"
                }`}
                disabled={isDisabled || isSaving}
                onPress={handleSave}
              >
                {isSaving ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color="white" />
                    <Text className="text-white font-semibold ml-2">
                      Lagrer...
                    </Text>
                  </View>
                ) : (
                  <Text
                    className={`font-semibold text-center leading-5 ${isDisabled ? "text-black" : "text-white"}`}
                  >
                    {isDisabled ? "Beregn status\nfor å lagre" : "Lagre"}
                  </Text>
                )}
              </Pressable>

              <Pressable
                className="flex-1 py-3 rounded-xl items-center justify-center bg-red-500"
                onPress={() => {
                  resetFields();
                  displayInfoToast("Skjema er resatt 👍");
                  alert("Skjema er tilbakestilt.");
                }}
              >
                <Text className="text-white font-semibold text-center leading-5">
                  Reset skjema
                </Text>
              </Pressable>
            </View>
          </FormCard>
        </View>
      </ScrollView>
    </View>
  );
}
