import { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  ActivityIndicator,
  Pressable,
  Image,
  ScrollView,
  useWindowDimensions,
  Button,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import * as postApi from "@/api/postApi";
import * as commentApi from "@/api/commentApi";
import { CommentData, CommentObject, PostData } from "@/models/PostData";
import { useAuthContext } from "@/providers/authContext";
import Spacer from "@/components/Spacer";
import PostDate from "@/components/PostDate";

// TODO import { showInfoToast, showSuccessToast } from '@/utils/toast';

/*
/ Denne koden er delvis basert på kodebasene fra forelesninger i faget TDS200 ved Høyskolen Kristiania høsten 2025.
/ Brukt med tillatelse.
*/

export default function PostDetails() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const { firebaseUser, userProfile } = useAuthContext();

  // Extracts the id from the URL (e.g. /postDetails/[id]).
  // post state stores the data for the specific post to display.
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<PostData | null>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [postComments, setPostComments] = useState<CommentObject[]>([]);
  const [commentText, setCommentText] = useState("");
  const [likes, setLikes] = useState<string[]>([]);
  const [isLoadingAddComment, setIsLoadingAddComment] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);

  useEffect(() => {
    // useEffect hook runs when id changes.
    const fetchPostFromBackend = async () => {
      const backendPost = await postApi.getPostById(id as string);

      if (backendPost) {
        fetchComments(backendPost.comments);
        setPost(backendPost);
        setLikes(backendPost.likes || []);
      }
    };

    fetchPostFromBackend();
  }, [id]);

  // Henter kommentarer til posten
  const fetchComments = async (commentIds: string[]) => {
    if (!commentIds || commentIds.length === 0) {
      setPostComments([]); // clear or keep previous state
      setIsLoadingComments(false); // stop loader
      return;
    }

    setIsLoadingComments(true);

    const comments = await commentApi.getCommentsByIds(commentIds);
    if (comments) {
      setPostComments(comments);
    }
    setIsLoadingComments(false);
  };

  // Funksjon: Legg til en ny kommentar
  const handleAddComment = async () => {
    if (!post || commentText.trim() === "") return;

    setIsLoadingAddComment(true);
    try {
      const newCommentData: CommentData = {
        authorUid: firebaseUser.uid,
        authorName: firebaseUser.displayName,
        commentText: commentText,
        postId: post.postId,
      };

      const newCommentId = await commentApi.addComment(
        post.postId,
        newCommentData,
      );
      if (newCommentId) {
        setPostComments((prevComments) => [
          ...prevComments,
          { id: newCommentId, comment: newCommentData },
        ]);
        setCommentText("");
      }
    } catch (error) {
      console.error("🚨 Error adding comment:", error);
    }
    setIsLoadingAddComment(false);
  };

  // Vis loading-beskjed mens skadeobservasjonen lastes inn
  if (!post) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text className="mt-2 text-gray-500">Laster detaljer...</Text>
      </View>
    );
  }

  // Er det lastet opp noen bilder?
  const firstImageUri = post?.images?.[0];
  const isTherePhoto = !!(firstImageUri && firstImageUri !== "ERROR");

  // ----------------------------------------------------------------------------------------

  return (
    <>
      <View className="flex-1 bg-gray-50">
        <Stack.Screen
          options={{
            title: post.title,
            headerBackButtonDisplayMode: "generic",
          }}
        />

        <ScrollView contentContainerClassName="p-5">
          {/* Post content */}
          <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
            {/* Detaljeinfo */}
            <Text className="text-xl font-extrabold text-gray-900 mb-3">
              Skadeindikatorer
            </Text>
            <Text className="text-base font-extrabold text-gray-900 mb-3">
              Skadelokasjon: {post?.injuryLocation}
            </Text>

            <Text className="text-base font-normal text-gray-900 mb-3">
              Smertenivå (0-10): {post?.painLevel}
            </Text>

            <Text className="text-base font-normal text-gray-900 mb-3">
              Hevelse: {post?.swelling ? "Ja" : "Nei"}
            </Text>
            <Text className="text-base font-normal text-gray-900 mb-3">
              Begrenset bevegelighet: {post?.mobilityLimit ? "Ja" : "Nei"}
            </Text>
            <Text className="text-base font-normal text-gray-900 mb-3">
              Temperatur: {post?.temperature}°C
            </Text>

            {/* Divider */}
            <View className="h-[1px] bg-gray-200 my-2" />
            <Spacer />

            {post.description && (
              <>
                {/* BESKRIVELSE */}
                <Text className="text-base font-medium text-gray-500 italic">
                  Beskrivelse:
                </Text>
                <Text className="text-base">{post?.description}</Text>
                <Spacer />
                <View className="h-[1px] bg-gray-200 mb-3" />
              </>
            )}
            {/* Post lagd av */}
            <Text className="text-gray-500 text-sm font-bold italic">
              Skadeoppføring registrert
            </Text>
          </View>

          <Text className="text-xl font-semibold my-3">
            Bilder ({post.images.length} stk)
          </Text>

          <View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              className="w-full h-80 rounded-xl overflow-hidden bg-slate-300"
            >
              {post.images.map((uri: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri }}
                  className="w-96 h-80"
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>

          {/* Kommentarer */}
          <Text className="text-xl font-semibold my-3">Egne notater</Text>

          {isLoadingComments && !postComments ? (
            <ActivityIndicator size="large" />
          ) : (
            <View className="min-h-24">
              {postComments.length === 0 && (
                <Text className="italic">
                  Her kan du skrive egne notater rundt oppføringen
                </Text>
              )}
              {postComments.map((item) => (
                <View
                  key={item.id}
                  className="flex-row justify-between items-center bg-gray-100 rounded-xl p-3 mb-2"
                >
                  {/* Kommentarer - Innhold */}
                  <View className="flex-1 mr-3">
                    <Text className="text-gray-700">
                      {item.comment.commentText}
                    </Text>

                    <View className="h-[1px] bg-gray-200 my-1" />

                    <Text className="text-xs text-gray-500">
                      Skrevet <PostDate value={post.createdAt} />
                    </Text>
                  </View>

                  {/* Knapp: Slett kommentar (om forfatter) */}
                  {item.comment.authorUid === firebaseUser.uid && (
                    <Pressable
                      onPress={async () => {
                        await commentApi.deleteComment(item.id, post.postId);
                        setPostComments((prev) =>
                          prev.filter((c) => c.id !== item.id),
                        );
                      }}
                      className="bg-red-500 p-2 rounded-full"
                    >
                      <Ionicons name="trash-outline" size={18} color="white" />
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Legg til en kommentar */}
          <View className="flex-row items-center my-8">
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Skriv en kommentar..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 mr-2 text-gray-800"
            />
            <Pressable
              onPress={handleAddComment}
              className="bg-blue-600 px-4 py-2 rounded-full"
            >
              {isLoadingAddComment ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-medium">Publiser</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
