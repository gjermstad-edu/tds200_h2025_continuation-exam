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

/*
/ Denne koden er delvis basert på kodebasene fra forelesninger i faget TDS200 ved Høyskolen Kristiania høsten 2025.
/ Brukt med tillatelse.
*/

export default function Index() {
  const { firebaseUser } = useAuthContext();

  const [posts, setPosts] = useState<PostData[]>([]);
  const [allPosts, setAllPosts] = useState<PostData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
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
    const sorted = sortPostsByDate(filteredPosts, sortOrder);

    setAllPosts(sorted);
    setPosts(sorted);
  };

  // 2.5) Tømmer søkefeltet om skade man filtrerer på endres
  useEffect(() => {
    setSearchQuery("");
  }, [filterCategories]);

  // Hook for å utføre søk på posts
  useEffect(() => {
    const basePosts = allPosts;

    // Om søkefeltet for fritekst er tomt, vis alle oppføringer
    if (!searchQuery.trim()) {
      setPosts(sortPostsByDate(basePosts, sortOrder));
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const locallyFiltered = allPosts.filter(
      (p) =>
        p.injuryLocation.toLowerCase().includes(lowerQuery) ||
        (p.description && p.description.toLowerCase().includes(lowerQuery)),
    );
    setPosts(sortPostsByDate(locallyFiltered, sortOrder));
  }, [searchQuery, allPosts, sortOrder]);

  // HJELPEFUNKSJONER
  function toggleShowFilter() {
    setIsShowFilters(!isShowFilters);
  }

  function sortPostsByDate(
    postsToSort: PostData[],
    order: "newest" | "oldest",
  ) {
    const sorted = [...postsToSort].sort((postA, postB) => {
      const timeA = postA.createdAt ? postA.createdAt.getTime() : 0;
      const timeB = postB.createdAt ? postB.createdAt.getTime() : 0;

      return order === "newest" ? timeB - timeA : timeA - timeB;
    });

    return sorted;
  }

  return (
    <View className="flex-1 flex-col items-center bg-gray-100">
      <View className="w-full px-5 pt-8">
        {/* TITTEL og UNDERTITTEL */}
        <Text className="text-3xl font-bold text-gray-900 mb-1">
          Skadeobservasjoner
        </Text>
        <Text className="text-gray-600 mb-5">
          Oversikt over registrerte skader
        </Text>
      </View>

      {/* FILTRERING */}
      <View className="w-full flex-row px-4 gap-2">
        <Pressable
          onPress={toggleShowFilter}
          className="flex-1 px-4 py-2 rounded-lg items-center border border-gray-200 bg-gray-50"
        >
          <Text className="text-blue-700 font-semibold">
            {isShowFilters ? "🔍 Skjul" : "🔍 Søk & filtrer"}
          </Text>
        </Pressable>
        {/* SORTERING */}
        <Pressable
          onPress={() =>
            setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
          }
          className="flex-1 px-4 py-2 rounded-lg items-center border border-gray-200 bg-gray-50"
        >
          <Text className="text-blue-700 font-semibold">
            {sortOrder === "newest" ? "🕒 Nyeste først" : "🕒 Eldste først"}
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
      <View className="w-full px-6 mt-2 mb-1 flex-row justify-between">
        <Text className="text-xs text-gray-500">
          {posts.length} oppføringer
        </Text>
        <Text className="text-xs text-gray-500">
          Viser: {sortOrder === "newest" ? "Nyeste først" : "Eldste først"}
        </Text>
      </View>

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
          <Text className="mt-5">Ingen skadeoppføringer 👀 Lag en ny?</Text>
          <Text className="italic text-gray-700 my-2 px-4 text-center">
            (om du har gjort et søk eller filtrert på skade: prøv å tømme søket
            eller velg "Alle")
          </Text>
        </>
      )}
    </View>
  );
}
