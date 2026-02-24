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

  // Setter farge for statusboksen
  const statusBoxStyleByStatus: Record<string, string> = {
    "ny skade": "bg-orange-100 border-orange-300",
    forbedres: "bg-green-100 border-green-300",
    stabil: "bg-yellow-100 border-yellow-300",
    forverres: "bg-red-100 border-red-300",
    frisk: "bg-emerald-100 border-emerald-300",
  };
  const statusBoxClass =
    statusBoxStyleByStatus[post.statusIndicator] ??
    "bg-gray-100 border-gray-300";

  // Skademelding-inforad
  function DetailRow({ label, value }: { label: string; value: string }) {
    return (
      <View className="flex-row justify-between mb-3">
        <Text className="text-gray-500">{label}</Text>
        <Text className="font-semibold text-gray-900">{value}</Text>
      </View>
    );
  }

  // ----------------------------------------------------------------------------------------

  return (
    <>
      <View className="flex-1 bg-gray-50">
        <ScrollView contentContainerClassName="p-5">
          {/* Post content */}

          <View className="mb-6 rounded-2xl bg-white shadow-sm">
            <View className="rounded-2xl bg-white border border-gray-200 overflow-hidden p-6">
              <Text className="text-2xl font-extrabold text-gray-900 mb-3">
                Skadeoppføring
              </Text>

              <View className={`border rounded-xl p-4 mb-4 ${statusBoxClass}`}>
                <Text className="text-lg">
                  <Text>
                    Skadestatus:{" "}
                    <Text className="font-bold">{post.statusIndicator}</Text>
                  </Text>
                </Text>
                <Text className="text-sm mt-1">{post.statusExplanation}</Text>
              </View>

              {/* Detaljeinfo */}
              <DetailRow label="Skadelokasjon" value={post.injuryLocation} />
              <DetailRow
                label="Smertenivå (0–10)"
                value={`${post.painLevel}`}
              />
              <DetailRow label="Hevelse" value={post.swelling ? "Ja" : "Nei"} />
              <DetailRow
                label="Begrenset bevegelighet"
                value={post.mobilityLimit ? "Ja" : "Nei"}
              />
              <DetailRow label="Temperatur" value={`${post.temperature}°C`} />

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
                Skadeoppføring registrert: <PostDate value={post.createdAt} />
              </Text>
            </View>
          </View>

          <Text className="text-xl font-semibold my-3">
            Bilder ({post.images.length} stk)
          </Text>

          <View>
            {/* width - 40 pga "p-5" (20+20) */}
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              className="w-full h-80 rounded-xl bg-slate-300"
            >
              {post.images.map((uri: string, index: number) => (
                <View key={index} style={{ width: width - 40, height: 320 }}>
                  <Image
                    source={{ uri }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Kommentarer */}
          <Text className="text-xl font-semibold my-3">Egne notater</Text>

          {isLoadingComments ? (
            <ActivityIndicator size="large" />
          ) : (
            <View className="min-h-24">
              {postComments.length === 0 && (
                <Text className="italic">
                  Ingen notater enda – legg til et for å følge utviklingen din.
                </Text>
              )}
              {postComments.map((item) => (
                <View
                  key={item.id}
                  className="flex-row justify-between items-center bg-white border border-gray-200 rounded-xl p-3 mb-2"
                >
                  {/* Kommentarer - Innhold */}
                  <View className="flex-1 mr-3">
                    <Text className="text-gray-700">
                      {item.comment.commentText}
                    </Text>

                    <View className="h-[1px] bg-gray-200 my-1" />

                    <Text className="text-xs text-gray-500">
                      Skrevet{" "}
                      {item.comment.createdAt ? (
                        <PostDate value={item.comment.createdAt} />
                      ) : (
                        <Text>nå nettopp</Text>
                      )}
                    </Text>
                  </View>

                  {/* Knapp: Slett kommentar */}
                  {item.comment.authorUid === firebaseUser.uid && (
                    <Pressable
                      onPress={async () => {
                        await commentApi.deleteComment(item.id, post.postId);
                        setPostComments((prev) =>
                          prev.filter((c) => c.id !== item.id),
                        );
                      }}
                      className="border-red-100 border-2 p-2 rounded-full"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#ef4444"
                      />
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
              placeholder="Skriv et notat..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 mr-2 text-gray-800"
            />
            <Pressable
              onPress={handleAddComment}
              className="bg-blue-600 px-4 py-2 rounded-full"
            >
              {isLoadingAddComment ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-medium">Lagre notat</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
