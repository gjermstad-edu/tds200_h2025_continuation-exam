import React from "react";
import { View, Text, Pressable, Alert, Platform } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { PostData } from "@/models/PostData";
import { deletePost } from "@/api/postApi";
import { useAuthContext } from "@/providers/authContext";

// TODO import Toast from "react-native-toast-message";
import PostDate from "./PostDate";
import TextChip from "./TextChip";

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
      // TODO Toast
      await refreshPosts();
    } catch (err: any) {
      console.error("Delete failed:", err);
      // TODO Toast
    }
  };

  // Bekreftelse om brukeren ønsker å slette posten
  const createAlertDeletePost = () => {
    if (Platform.OS === "web") {
      const userAnswer = confirm(
        "Ønsker du å slette denne posten?\nObs! Dette er et permanent valg!",
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
        "Ønsker du å slette denne posten?",
        "Obs! Dette er et permanent valg!",
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
    <View className="mb-4 rounded-2xl bg-white shadow-slate-100 shadow-sm">
      <View className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* Innhold */}
        <Link
          href={{
            pathname: "/postDetails/[id]",
            params: { id: postData.postId },
          }}
          className=""
        >
          <View className="flex-1 flex-row w-full items-center p-4">
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

            {/* Knapp for slett */}
            <View className="flex-col justify-end items-center space-x-4">
              {/* TODO Delete button (only if owner) */}
              {/* {user?.uid === postData.ownerId && ( */}
              <Pressable
                onPress={createAlertDeletePost}
                className="border-red-100 border-2 rounded-full p-3"
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </Pressable>
              {/* )} */}
            </View>
          </View>

          {/* TODO: Footer */}
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
