import React from "react";
import { View, Text, Pressable, Alert, Platform } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { PostData } from "@/models/PostData";
import { deletePost } from "@/api/postApi";
import { useAuthContext } from "@/providers/authContext";

import PostDate from "./PostDate";
import TextChip from "./TextChip";
import { displayErrorToast, displaySuccessToast } from "./ToastMessage";

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

  // Sletter posten
  const handleDelete = async () => {
    try {
      await deletePost(postData.postId!);

      displaySuccessToast(
        "Oppføring slettet.",
        `Lokasjon: "${postData.injuryLocation}"`,
      );

      await refreshPosts();
    } catch (error: any) {
      console.error(
        "🚨 ERROR: Deletion of injury posts failed: ",
        error?.message,
      );

      displayErrorToast("Sletting feilet", error?.message);
    }
  };

  // Be om bekreftelse om brukeren ønsker å slette oppføringen
  const createAlertDeletePost = () => {
    if (Platform.OS === "web") {
      const userAnswer = confirm(
        `Slette oppføringen "${postData.injuryLocation}"?\nObs! Sletting kan ikke angres!`,
      );
      if (userAnswer) {
        handleDelete();
        console.info(
          `🚮 User decided to delete post: ${postData.injuryLocation} / [${postData.statusIndicator}]`,
        );
      } else {
        console.info(
          `🚯 User decided NOT to delete post: ${postData.injuryLocation} / [${postData.statusIndicator}]`,
        );
      }
    } else if (Platform.OS === "ios") {
      Alert.alert(
        `Slette oppføringen "${postData.injuryLocation}"?`,
        "Obs! Dette kan ikke angres!",
        [
          {
            text: "Avbryt",
            onPress: () =>
              console.log(
                `🚯 User decided NOT to delete post: ${postData.injuryLocation} / [${postData.statusIndicator}]`,
              ),
            style: "cancel",
          },
          {
            text: "Slett",
            onPress: () => {
              console.log(
                `🚮 User decided to delete post: ${postData.injuryLocation} / [${postData.statusIndicator}]`,
              );
              handleDelete();
            },
          },
        ],
      );
    }
  };

  // Post component displays individual post with title, description, hashtags, author, and like button.
  // Note that Tailwind utility classes are used for styling.
  return (
    <View className="mb-4 rounded-2xl bg-white">
      <View className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* Innhold */}
        <View className="flex-1 flex-row w-full items-center p-4">
          {/* Klikkbart innhold (uten delete-knappen inni Link på web) */}
          <Link
            href={{
              pathname: "/postDetails/[id]",
              params: { id: postData.postId },
            }}
            className="flex-1"
          >
            <View className="flex-1 flex-col">
              {/* Info */}
              <View className="flex-row items-center gap-2 flex-wrap">
                <Text className="text-xl font-extrabold text-gray-800">
                  {postData.injuryLocation.toString().charAt(0).toUpperCase() +
                    postData.injuryLocation.toString().slice(1)}
                </Text>

                <TextChip text={postData.statusIndicator} />
              </View>
            </View>
          </Link>

          {/* Knapp for slett */}
          <View className="flex-col justify-end items-center space-x-4">
            {/* Delete button */}
            <Pressable
              onPress={createAlertDeletePost}
              className="border-red-100 border-2 rounded-full p-3"
            >
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <Link
          href={{
            pathname: "/postDetails/[id]",
            params: { id: postData.postId },
          }}
          className=""
        >
          <View className="flex-row justify-between items-center w-full px-4 py-3 border-t border-gray-100 bg-gray-50">
            <View className="flex-row flex-wrap text-sm text-gray-500">
              <Text>
                <PostDate value={postData.createdAt} />
              </Text>
            </View>
          </View>
        </Link>
      </View>
    </View>
  );
}
