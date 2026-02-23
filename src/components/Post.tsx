import React from "react";
import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { AntDesign, Ionicons } from "@expo/vector-icons";

import { PostData } from "@/models/PostData";
import { deletePost } from "@/api/postApi";
import { useAuthContext } from "@/providers/authContext";

// TODO import Toast from "react-native-toast-message";
import PostDate from "./PostDate";

/*
/ Denne koden er delvis basert på kodebasene fra forelesninger i faget TDS200 ved Høyskolen Kristiania høsten 2025.
/ Brukt med tillatelse.
*/

// Komponent for utseende av en enkelt post

type PostProps = {
  postData: PostData;
  refreshPosts: () => Promise<void>;
};

export default function Post({ postData, refreshPosts }: PostProps) {
  const { firebaseUser } = useAuthContext();

  const handleDelete = async () => {
    try {
      await deletePost(postData.postId!);
      // TODO Toast
      await refreshPosts();
    } catch (err: any) {
      console.error("Delete failed:", err);
      // TODO Toast
    }
  };

  // Post component displays individual post with title, description, hashtags, author, and like button.
  // Note that Tailwind utility classes are used for styling.
  return (
    <View className="bg-white rounded-2xl mb-5 shadow-md overflow-hidden">
      {/* Innhold */}
      <Link
        href={{
          pathname: "/postDetails/[id]",
          params: { id: postData.postId },
        }}
        className="flex-1"
      >
        <View className="flex-1 flex-row w-full items-center p-4">
          <View className="flex-1 flex-col">
            {/* Info inni en link */}

            <View>
              <Text className="text-xl font-extrabold text-gray-800">
                Skadelokasjon: {postData.injuryLocation}
              </Text>
              <Text className="text-sm text-gray-600 mt-1 leading-snug">
                Status: {postData.statusIndicator}
              </Text>
            </View>
          </View>

          {/* Knapp for slett */}
          <View className="flex-col justify-end items-center space-x-4">
            {/* TODO Delete button (only if owner) */}
            {/* {user?.uid === postData.ownerId && ( */}
            <Pressable
              onPress={handleDelete}
              className="bg-red-500 rounded-full p-2 active:bg-red-600"
            >
              <Ionicons name="trash-outline" size={22} color="white" />
            </Pressable>
            {/* )} */}
          </View>
        </View>

        {/* TODO: Footer */}
        <View className="flex-row justify-between items-center w-full px-4 py-3 border-t border-gray-100 bg-gray-50">
          <View className="flex-row flex-wrap mb-3">
            <Text>
              Dato registert: <PostDate value={postData.createdAt} />
            </Text>
          </View>
        </View>
      </Link>
    </View>
  );
}
