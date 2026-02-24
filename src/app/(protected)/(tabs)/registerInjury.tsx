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
  Button,
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
  const [formIsChanged, setFormIsChanged] = useState(true);

  const { firebaseUser, userProfile } = useAuthContext();

  const isDisabled: boolean =
    !isReadyToSave || isSaving || images.length == 0 || formIsChanged;

  const readyForStatus: boolean =
    selectedInjury != null && painLevel != 0 && images.length != 0;

  // Logikken for å beregne status
  async function handleStatus(oldPosts: PostData[]) {
    console.log("Running handleStatus");
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
  }

  // Lagrer skadeskjema
  const handleSave = async () => {
    // Ekstra sikkerhet (selv om disabled dekker det meste)
    if (!isReadyToSave || isSaving) return;

    setIsSaving(true);

    try {
      await postApi.createPost({
        title: titleText,
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
    } catch (error) {
      console.error("Error saving posts:", error);
      // TODO showToast("error", "Kunne ikke lagre innlegget", String(error));
    } finally {
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

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
        className="px-6 py-8"
      >
        {/* Form container */}
        <View className="bg-white rounded-2xl shadow-md p-6">
          <Text className="mb-6 font-bold text-4xl">Registrer ny skade</Text>

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

          {/* Legg til bilde */}
          {/* Note that Pressable is connected to modal popup by using setIsCameraOpen state. */}
          <Text className="mb-6 font-bold text-xl">
            Legg til bilde(r) av skaden<Text className="text-red-600">*</Text>:
          </Text>
          <Pressable
            onPress={() => {
              setIsCameraOpen(true);
              setFormIsChanged(true);
            }}
            className="rounded-xl border-2 border-dashed border-gray-400 bg-gray-50 h-52 justify-center items-center mb-6"
          >
            <EvilIcons name="image" size={80} color="gray" />
            <Text className="text-gray-500 mt-2">
              Trykk for å legge til bilder
            </Text>
          </Pressable>

          {/* Preview images
              It loops through images array and displays each image. */}
          {images.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row mb-6"
            >
              {images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  className="w-28 h-28 rounded-lg mr-3 border border-gray-300"
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          )}

          {/* GRUNNINFO */}
          <Text className="font-bold text-xl">
            Grunnleggende skadeindikatorer
            <Text className="text-red-600">*</Text>:
          </Text>
          {/* Skadelokasjon (injuryLocation) */}
          <View className="my-4 w-full lg:w-1/3">
            <Text className="text-gray-700 font-bold mb-1">Skadelokasjon:</Text>
            <View className="">
              <InjuryLocationPicker
                selectedLocation={selectedInjury}
                onChange={(newValue) => {
                  setSelectedInjury(newValue);
                  setFormIsChanged(true);
                }}
              />
            </View>
          </View>

          {/* Smertenivå */}
          <View className="my-4 w-full">
            <Text className="text-gray-700 font-semibold mb-1">
              Smertenivå (1 = ingen smerte / 10 = helvete):
            </Text>
            <View className="ml-4">
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
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold">
              Er det hevelse på/rundt skaden?
            </Text>
            <View className="flex-1 flex-row items-baseline">
              <Text className="mr-4">
                {isSwelling ? "Det ER hevelse" : "Det er IKKE hevelse"}
              </Text>
              <Button
                title="Endre"
                onPress={() => {
                  setIsSwelling(!isSwelling);
                  setFormIsChanged(true);
                }}
              />
            </View>
          </View>

          {/* Begrensning i bevegelse */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold">
              Har du begrensning i bevegelse av skaden?
            </Text>
            <View className="flex-1 flex-row items-baseline">
              <Text className="mr-4">
                {isMobilityLimited
                  ? "JA, jeg har begrensning"
                  : "NEI, jeg har ingen begrensning"}
              </Text>
              <Button
                title="Endre"
                onPress={() => {
                  setIsMobilityLimited(!isMobilityLimited);
                  setFormIsChanged(true);
                }}
              />
            </View>
          </View>

          {/* Temperatur */}
          <View className="my-4 w-full">
            <Text className="text-gray-700 font-semibold mb-1">
              Hvilken temperatur har du (velg nærmeste hele tall)?:
            </Text>
            <View className="ml-4">
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

          {/* Beskrivelse */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold">
              Beskrivelse (valgfritt):
            </Text>
            <TextInput
              multiline
              numberOfLines={3}
              onChangeText={setDescriptionText}
              value={descriptionText}
              className="border border-gray-300 rounded-lg p-3 mt-1 bg-gray-50 h-24"
              placeholder="Gi en beskrivelse av skaden og nåværende indikatorer."
            />
          </View>

          {/* KNAPP: Beregn status */}
          <View className="my-4">
            <Pressable
              disabled={!readyForStatus}
              className={`border border-gray-400 py-3 rounded-lg ${
                !readyForStatus ? "bg-gray-300" : "bg-emerald-600"
              }`}
              onPress={async () => {
                alert("Status is being calculated, please wait ☀️");

                const oldPosts =
                  await postApi.getRemoteFilteredPosts(selectedInjury);

                await handleStatus(oldPosts);
              }}
            >
              <Text
                className={`font-semibold text-center ${
                  !readyForStatus ? "text-black" : "text-white"
                }`}
              >
                Beregn status
              </Text>
            </Pressable>

            {formIsChanged == false && (
              <View className="bg-green-100 border border-green-300 rounded-xl p-4 mt-4">
                <Text className="text-green-700 text-lg">
                  <Text>
                    Skadestatus:{" "}
                    <Text className="font-bold">{statusIndicatorStatus}</Text>
                  </Text>
                </Text>
                <Text className="text-green-600 text-sm mt-1">
                  {statusExplaination}
                </Text>
              </View>
            )}
          </View>

          {/* KNAPP: Lagre og Avbryt */}
          <View className="flex-row justify-between">
            <Pressable
              className={`flex-1 py-3 border border-gray-400 rounded-lg mr-2 ${
                isDisabled ? "bg-gray-300" : "bg-emerald-600"
              }`}
              disabled={isDisabled}
              onPress={handleSave}
            >
              <Text
                className={`font-semibold text-center ${
                  isDisabled ? "text-black" : "text-white"
                }`}
              >
                {isDisabled ? "Beregn status for å lagre" : "Lagre"}
              </Text>
            </Pressable>

            {/* TODO: Sett inn toast istedenfor alert */}
            <Pressable
              className="flex-1 bg-red-500 py-3 rounded-lg ml-2"
              onPress={() => {
                resetFields();
                alert("Skjema er tilbakestilt.");
              }}
            >
              <Text className="text-white font-semibold text-center">
                Reset skjema
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
