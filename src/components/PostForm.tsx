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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { EvilIcons } from "@expo/vector-icons";

import SelectImageModal from "@/components/SelectImageModal";
import CurrentLocation from "@/components/CurrentLocation";
import { useAuthContext } from "@/providers/authContext";
import { CreatePostInput } from "@/models/PostData";
import { PostCategory } from "@/models/PostCategories";

/*
/ Denne koden er delvis basert på kodebasene fra forelesninger i faget TDS200 ved Høyskolen Kristiania høsten 2025.
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
  const [images, setImages] = useState<string[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState<{
    coords: any;
    address: string;
  } | null>(null);

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

          {/* Add image box */}
          {/* Note that Pressable is connected to modal popup by using setIsCameraOpen state. */}
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

          {/* Title */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold">Tittel</Text>
            <TextInput
              onChangeText={setTitleText}
              value={titleText}
              className="border border-gray-300 rounded-lg p-3 mt-1 bg-gray-50"
              placeholder="Skriv inn tittel"
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold">Beskrivelse</Text>
            <TextInput
              multiline
              numberOfLines={3}
              onChangeText={setDescriptionText}
              value={descriptionText}
              className="border border-gray-300 rounded-lg p-3 mt-1 bg-gray-50 h-24"
              placeholder="Skriv inn beskrivelse"
            />
          </View>
          <View className="mt-4">
            <Text className="text-gray-700 font-semibold mb-1">Category</Text>
            <View className="border border-gray-300 rounded-lg bg-white">
              <Picker
                selectedValue={category}
                onValueChange={(value) => setCategory(value)}
                style={{ height: 50 }}
              >
                <Picker.Item label="Select category..." value="" />
                <Picker.Item label="Art" value="Art" />
                <Picker.Item label="Nature" value="Nature" />
                <Picker.Item label="Education" value="Education" />
              </Picker>
            </View>
          </View>

          {/* fetch expo-location */}
          <CurrentLocation handleLocation={setLocation} />

          {/* Buttons to submit a new post
          AddNewPost is called with the new post data when "Legg til post" is pressed. */}
          <View className="flex-row justify-between">
            <Pressable
              className="flex-1 bg-emerald-600 py-3 rounded-lg mr-2 shadow-md"
              onPress={() => {
                addNewPost({
                  title: titleText,
                  description: descriptionText,
                  images,
                  address: location?.address || "Ukjent adresse",
                  coordinates: location
                    ? {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                      }
                    : undefined,
                  categories: category ? [category as PostCategory] : [],
                });

                setTitleText("");
                setDescriptionText("");
                setLocation(null);
              }}
            >
              <Text className="text-white font-semibold text-center">
                Legg til post
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
