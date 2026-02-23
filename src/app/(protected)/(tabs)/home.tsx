import React from "react";
import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import { Stack } from "expo-router";

import "@/global.css";
import * as postApi from "@/api/postApi";
import PostForm from "@/components/PostForm";
import { PostData } from "@/models/PostData";
import Post from "@/components/Post";
import Spacer from "@/components/Spacer";
import {
  InjuryLocation,
  injuryLocationLabel,
  PostCategory,
} from "@/models/PostCategories";
import { useAuthContext } from "@/providers/authContext";
import { SafeAreaView } from "react-native-safe-area-context";

// TODO import Toast from "react-native-toast-message";

/*
/ Denne koden er delvis basert på kodebasene fra forelesninger i faget TDS200 ved Høyskolen Kristiania høsten 2025.
/ Brukt med tillatelse.
*/

export default function Index() {
  const { firebaseUser, userProfile } = useAuthContext();

  const [posts, setPosts] = useState<PostData[]>([]);
  const [allPosts, setAllPosts] = useState<PostData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWelcomeShowing, setIsWelcomeShowing] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategories, setFilterCategories] =
    useState<InjuryLocation | null>(null);

  // Hent alle poster
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        await getPostsFromBackend(filterCategories);
      };
      fetchData();
    }, []),
  );

  // 1) Filter - Følger med på om valgte filter endrer seg
  useEffect(() => {
    const fetchFiltered = async () => {
      await getPostsFromBackend(filterCategories);
    };
    fetchFiltered();
  }, [filterCategories]);

  // 2) Filter - Finner posts basert på valgt kategori
  const getPostsFromBackend = async (
    category: InjuryLocation | null = null,
  ) => {
    const filteredPosts = await postApi.getRemoteFilteredPosts(category);
    setAllPosts(filteredPosts);
    setPosts(filteredPosts);
  };

  // Hook for å utføre søk på posts
  useEffect(() => {
    if (!searchQuery.trim()) {
      // If search bar is empty → show all posts
      setPosts(allPosts);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const locallyFiltered = allPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(lowerQuery) ||
        (p.description && p.description.toLowerCase().includes(lowerQuery)),
    );
    setPosts(locallyFiltered);
  }, [searchQuery, allPosts]);

  // Fjerner melding på toppen
  useEffect(() => {
    const timerId = setTimeout(removeWelcome, 5000);
    return () => clearTimeout(timerId);
  }, []);

  function removeWelcome() {
    setIsWelcomeShowing(false);
  }

  return (
    <View className="flex-1 p-5 items-center justify-center bg-gray-50">
      <Pressable
        className="bg-sky-600 p-3 rounded-lg items-center"
        onPress={() => setIsModalOpen(true)}
      >
        <Text className="text-white font-semibold text-lg">
          Ny skadeobservasjon
        </Text>
      </Pressable>

      {/* Modal for PostForm */}
      <Modal visible={isModalOpen} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <PostForm
            addNewPost={async (post) => {
              try {
                await postApi.createPost(post);
                await getPostsFromBackend();
                setIsModalOpen(false);
                // TODO showToast("success", "Innlegg lagt til!");
              } catch (error) {
                console.error("Error saving posts to SecureStore:", error);
                // TODO showToast("error", "Kunne ikke lagre innlegget", String(error));
              }
            }}
            closeModal={() => setIsModalOpen(false)}
          />
        </SafeAreaView>
      </Modal>

      {/* conditional rendering of welcome message if userName exists */}
      {isWelcomeShowing && (
        <View className="w-full px-5 mt-4">
          <View className="bg-green-100 border border-green-300 rounded-xl p-4 shadow-sm">
            <Text className="text-green-700 font-semibold text-lg">
              Hei, {firebaseUser.displayName}!
            </Text>
            <Text className="text-green-600 text-sm mt-1">
              Velkommen tilbake – hyggelig å se deg igjen.
            </Text>
          </View>
        </View>
      )}

      <View className="w-full px-5 my-4">
        {/* Search bar */}
        <Text className="py-1 font-bold">Søk i skadeobservasjonene dine:</Text>
        <TextInput
          placeholder="Skriv søkeord her..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="bg-white border border-gray-300 text-gray-400 rounded-lg p-2 mb-3"
        />

        {/* Category filter */}
        <Text className="py-1 font-bold">
          Filtrer skadeobservasjoner på skade:
        </Text>
        <Picker
          className="bg-white border border-gray-300 rounded-lg p-2 mb-3"
          selectedValue={filterCategories ?? ""}
          onValueChange={(value) => {
            // hvis tom streng -> null (ingen filter)
            setFilterCategories(value ? (value as InjuryLocation) : null);
          }}
        >
          <Picker.Item label="Alle skader" value="" />
          <Picker.Item
            label={injuryLocationLabel(InjuryLocation.Elbow)}
            value={InjuryLocation.Elbow}
          />
          <Picker.Item
            label={injuryLocationLabel(InjuryLocation.Ankle)}
            value={InjuryLocation.Ankle}
          />
          <Picker.Item
            label={injuryLocationLabel(InjuryLocation.Hip)}
            value={InjuryLocation.Hip}
          />
          <Picker.Item
            label={injuryLocationLabel(InjuryLocation.Wrist)}
            value={InjuryLocation.Wrist}
          />
          <Picker.Item
            label={injuryLocationLabel(InjuryLocation.Knee)}
            value={InjuryLocation.Knee}
          />
          <Picker.Item
            label={injuryLocationLabel(InjuryLocation.Neck)}
            value={InjuryLocation.Neck}
          />
          <Picker.Item
            label={injuryLocationLabel(InjuryLocation.Back)}
            value={InjuryLocation.Back}
          />
          <Picker.Item
            label={injuryLocationLabel(InjuryLocation.Shoulder)}
            value={InjuryLocation.Shoulder}
          />
          <Picker.Item
            label={injuryLocationLabel(InjuryLocation.Other)}
            value={InjuryLocation.Other}
          />
        </Picker>
        <Text className="py-1 font-bold">
          Dine registrerte skadeobservasjoner:
        </Text>
      </View>

      {/* Flatlist shows list of posts with like functionality
      It renders Post component for each post */}
      <FlatList
        className="w-full px-5"
        data={posts}
        ListHeaderComponent={() => <Spacer height={10} />}
        ListFooterComponent={() => <Spacer height={50} />}
        ItemSeparatorComponent={() => <Spacer height={8} />}
        renderItem={(post) => (
          <Post postData={post.item} refreshPosts={getPostsFromBackend} />
        )}
        keyExtractor={(item) => item.postId}
      />
    </View>
  );
}
