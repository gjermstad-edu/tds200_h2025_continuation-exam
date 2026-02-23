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
import { Picker } from "@react-native-picker/picker";
import { EvilIcons } from "@expo/vector-icons";

import SelectImageModal from "@/components/SelectImageModal";
import CurrentLocation from "@/components/CurrentLocation";
import { useAuthContext } from "@/providers/authContext";
import { CreatePostInput, InjuryStatus } from "@/models/PostData";
import { InjuryLocation } from "@/models/PostCategories";
import InjuryLocationPicker from "./InjuryLocationPicker";
import { NumberPicker } from "./NumberPicker";

/*
/ Denne koden er basert på kodebasene fra forelesninger i faget TDS200 ved Høyskolen Kristiania høsten 2025.
/ Brukt med tillatelse.
*/

type PostFormProps = {
  addNewPost: (post: CreatePostInput) => void;
  closeModal: () => void;
};

export default function PostForm({ addNewPost, closeModal }: PostFormProps) {
  // This component is a post creation form that lets users:
  // - Add images (via camera/gallery).
  // - Input a title, description, and hashtags.
  // - Automatically attach their username as author.
  // - Save the post (calls addNewPost) or cancel.
  // It is also styled using Tailwind utility classes.

  const [titleText, setTitleText] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  const [selectedInjury, setSelectedInjury] = useState<InjuryLocation>();
  const [painLevel, setPainLevel] = useState(0);
  const [isSwelling, setIsSwelling] = useState(false);
  const [isMobilityLimited, setIsMobilityLimited] = useState(false);
  const [temperature, setTemperature] = useState(37);
  const [statusIndicatorStatus, setStatusIndicatorStatus] =
    useState<InjuryStatus>("ny skade");
  const [statusExplaination, setStatusExplaination] = useState("");
  const [isReadyToSave, setIsReadyToSave] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const { firebaseUser, userProfile } = useAuthContext();

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
            Last opp et eller flere bilder (påkrevd):
          </Text>
          <Pressable
            onPress={() => setIsCameraOpen(true)}
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

          <Text className="mb-6 font-bold text-xl">
            Grunnleggende skadeindikatorer (påkrevd):
          </Text>
          {/* Skadelokasjon (injuryLocation) */}
          <View className="my-4 w-full lg:w-1/3">
            <Text className="text-gray-700 font-bold mb-1">Skadelokasjon:</Text>
            <View className="ml-4">
              <InjuryLocationPicker
                selectedLocation={selectedInjury}
                onChange={setSelectedInjury}
              />
            </View>
          </View>

          {/* Smertenivå */}
          <View className="my-4 w-full">
            <Text className="text-gray-700 font-semibold mb-1">
              Smertenivå (0 = ingen smerte / 10 = helvete):
            </Text>
            <View className="ml-4">
              <NumberPicker
                min={0}
                max={10}
                value={painLevel}
                onChange={setPainLevel}
              />
            </View>
          </View>

          {/* Hevelse */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold">Hevelse?</Text>
            <View className="flex-1 flex-row items-baseline">
              <Text className="mr-4">
                {isSwelling ? "Det ER hevelse" : "Det er IKKE hevelse"}
              </Text>
              <Button
                title="Endre"
                onPress={() => setIsSwelling(!isSwelling)}
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
                onPress={() => setIsMobilityLimited(!isMobilityLimited)}
              />
            </View>
          </View>

          {/* Temperatur */}
          <View className="my-4 w-full">
            <Text className="text-gray-700 font-semibold mb-1">
              Hvilken temperatur har du?:
            </Text>
            <View className="ml-4">
              <NumberPicker
                min={34}
                max={42}
                steps={0.1}
                value={temperature}
                onChange={setTemperature}
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

          <View className="my-4">
            <Pressable
              className="flex-1 border border-gray-400 py-3 rounded-lg"
              onPress={() => {
                alert("Status beregnes...");
              }}
            >
              <Text className="text-gray-700 font-semibold text-center">
                Beregn status
              </Text>
            </Pressable>
          </View>

          {/* KNAPP: Lagre og Avbryt */}
          <View className="flex-row justify-between">
            <Pressable
              className="flex-1 bg-emerald-600 py-3 rounded-lg mr-2 shadow-md"
              disabled={isReadyToSave}
              onPress={() => {
                addNewPost({
                  title: titleText,
                  description: descriptionText,
                  images,
                  injuryLocation: selectedInjury,
                  painLevel: painLevel,
                  swelling: isSwelling,
                  mobilityLimit: isMobilityLimited,
                  temperature: temperature,
                  statusIndicator: statusIndicatorStatus,
                  statusExplanation: statusExplaination,
                });

                setTitleText("");
                setDescriptionText("");
              }}
            >
              <Text className="text-white font-semibold text-center">
                Lagre
              </Text>
            </Pressable>

            <Pressable
              className="flex-1 border border-gray-400 py-3 rounded-lg ml-2"
              onPress={closeModal}
            >
              <Text className="text-gray-700 font-semibold text-center">
                Avbryt
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
