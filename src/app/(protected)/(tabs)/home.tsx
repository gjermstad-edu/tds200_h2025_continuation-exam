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
import { PostCategory } from "@/models/PostCategories";
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
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filterCategories, setFilterCategories] = useState<PostCategory[]>([]);

  // Hent alle poster
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        await getPostsFromBackend();
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
  const getPostsFromBackend = async (category: PostCategory[] = []) => {
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
        <Text className="text-white font-semibold text-lg">Nytt innlegg</Text>
      </Pressable>

      {/* Modal for PostForm */}
      <Modal visible={isModalOpen} animationType="slide">
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

      <View className="w-full px-5 mt-4">
        {/* Search bar */}
        <TextInput
          placeholder="Search posts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="bg-white border border-gray-300 rounded-lg p-2 mb-3"
        />

        {/* Category filter */}
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value)}
          style={{ backgroundColor: "white", borderRadius: 8 }}
        >
          <Picker.Item label="All categories" value="" />
          <Picker.Item label="Art" value="Art" />
          <Picker.Item label="Nature" value="Nature" />
          <Picker.Item label="Education" value="Education" />
        </Picker>
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
