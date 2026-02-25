import React from "react";
import { useState, useCallback, useEffect } from "react";
import { View, Text, TextInput, Pressable, FlatList } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";

import "@/global.css";
import * as postApi from "@/api/postApi";
import { PostData } from "@/models/PostData";
import Post from "@/components/Post";
import Spacer from "@/components/Spacer";
import { InjuryLocation, injuryLocationLabel } from "@/models/PostCategories";
import { useAuthContext } from "@/providers/authContext";

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
  const [isShowFilters, setIsShowFilters] = useState(false);
  const [filterCategories, setFilterCategories] =
    useState<InjuryLocation | null>(null);

  // 1) Hent alle poster
  useFocusEffect(
    useCallback(() => {
      if (!firebaseUser) return;

      const fetchData = async () => {
        await getPostsFromBackend(filterCategories);
      };

      fetchData();
    }, [firebaseUser, filterCategories]),
  );

  // 2) Filter - Finner posts basert på valgt kategori
  const getPostsFromBackend = async (
    category: InjuryLocation | null = null,
  ) => {
    if (!firebaseUser) return;

    const filteredPosts = await postApi.getRemoteFilteredPosts(category);
    setAllPosts(filteredPosts);
    setPosts(filteredPosts);
  };
  // 2.5) Tømmer søkefeltet om skade man filtrerer på endres
  useEffect(() => {
    setSearchQuery("");
  }, [filterCategories]);

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
        p.injuryLocation.toLowerCase().includes(lowerQuery) ||
        (p.description && p.description.toLowerCase().includes(lowerQuery)),
    );
    setPosts(locallyFiltered);
  }, [searchQuery, allPosts]);

  // Fjerner melding på toppen etter 5 sec
  useEffect(() => {
    const timerId = setTimeout(removeWelcome, 5000);
    return () => clearTimeout(timerId);
  }, []);

  // Små hjelpefunksjoner
  function removeWelcome() {
    setIsWelcomeShowing(false);
  }

  function toggleShowFilter() {
    setIsShowFilters(!isShowFilters);
  }

  return (
    <View className="flex-1 flex-col items-center bg-gray-100">
      <View className="w-full px-5 py-8">
        <Text className="text-3xl font-bold text-gray-900 mb-1">
          Skadeobservasjoner
        </Text>
        <Text className="text-gray-600">Oversikt over registrerte skader</Text>
      </View>
      {/* FILTRERING */}
      <View className="w-full">
        <Pressable
          onPress={toggleShowFilter}
          className=" px-5 py-2 mx-4 rounded-lg items-center border-gray-400 border-2"
        >
          <Text className=" font-bold">
            {isShowFilters ? "🔍 Skjul søk & filtrer" : "🔍 Søk & filtrer"}
          </Text>
        </Pressable>
      </View>
      {isShowFilters && (
        <View className="w-full px-5 mt-4">
          {/* Search bar */}
          <Text className="py-1 font-bold">
            Søk i skadeobservasjonene dine:
          </Text>
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
        </View>
      )}

      {/* Flatlist shows list of posts with like functionality
      It renders Post component for each post */}
      {posts.length >= 1 ? (
        <FlatList
          className="flex-1 w-full px-5"
          data={posts}
          ListHeaderComponent={() => <Spacer height={10} />}
          ListFooterComponent={() => <Spacer height={50} />}
          ItemSeparatorComponent={() => <Spacer height={5} />}
          renderItem={(post) => (
            <Post postData={post.item} refreshPosts={getPostsFromBackend} />
          )}
          keyExtractor={(item) => item.postId}
        />
      ) : (
        <>
          <Text>Ingen skadeoppføringer tilgjengelig 👀</Text>
          <Text className="italic text-gray-700 my-2 text-center">
            (Om du har gjort et søk eller filtrert på skade: prøv å tømme søket
            eller velg "Alle")
          </Text>
        </>
      )}
    </View>
  );
}
