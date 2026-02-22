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

  const handleToggleLike = async () => {
    if (!post || !userProfile) return;

    // Compute new likes array locally
    const alreadyLiked = (post.likes || []).includes(userProfile.userUid);
    if (!alreadyLiked) {
      console.log(
        `👍 ${firebaseUser.displayName} liked the post "${post.title}"`,
      );
    } else {
      console.log(
        `👎 ${firebaseUser.displayName} unliked the post "${post.title}"`,
      );
    }
    const updatedLikes = alreadyLiked
      ? post.likes?.filter((user) => user !== userProfile.userUid)
      : [...(post.likes || []), userProfile.userUid];

    // Update local UI state instantly
    setPost({ ...post, likes: updatedLikes });
    setLikes(updatedLikes);

    try {
      // Update Firestore
      await postApi.updatePost(post.postId, { likes: updatedLikes });
    } catch (error) {
      console.error(
        `🚨 Error updating likes for the post "${post.title}":`,
        error,
      );
    }
  };

  const handleToggleVolunteer = async () => {
    if (!post || !userProfile.userUid) return;

    // Compute new volunteers array locally
    const alreadyParticipates = (post.participantsUids || []).includes(
      userProfile.userUid,
    );
    if (!alreadyParticipates) {
      // TODO: Insert Toast
      console.log(
        `🙋‍♂️ ${firebaseUser.displayName} participates in the post "${post.title}"`,
      );
    } else {
      // TODO: Insert Toast
      console.log(
        `🙅‍♂️ ${firebaseUser.displayName} remove his participation from post "${post.title}"`,
      );
    }
    const updatedVolunteers = alreadyParticipates
      ? post.participantsUids?.filter((user) => user !== userProfile.userUid)
      : [...(post.participantsUids || []), userProfile.userUid];

    // Update local UI state instantly
    setPost({ ...post, participantsUids: updatedVolunteers });
    setParticipants(updatedVolunteers);

    try {
      // Update Firestore
      await postApi.updatePost(post.postId, {
        participantsUids: updatedVolunteers,
      });
    } catch (error) {
      console.error(
        `🚨 Error while updating participants for the post "${post.title}": ${error}`,
      );
    }
    console.log("Updated list over participants should be:", updatedVolunteers);
  };

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

  // Vis loading-beskjed mens posten lastes inn
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

  // Sjekker om brukeren er påmeldt
  const isParticipating = participants.includes(userProfile.userUid);

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
          {/* Vises om ingen bilder er lastet opp */}
          {isTherePhoto === false ? (
            <Text className="my-5 text-gray-400 text-center ">
              Ingen bilder lastet opp til denne posten 📷
            </Text>
          ) : null}

          {/* Viser bilder på toppen om det er lastet opp bilde(r) */}
          {isTherePhoto && (
            <View>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                className="w-full h-80 rounded-xl overflow-hidden shadow-md"
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
          )}

          {/* Post content */}
          <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
            {/* TITTEL */}
            <Text className="text-3xl font-extrabold text-gray-900 mb-3">
              {post?.title}
            </Text>

            {/* BESKRIVELSE */}
            <Text className="text-base  text-gray-700 leading-relaxed mb-4">
              {post?.description}
            </Text>
            {/* Divider */}
            <View className="h-[1px] bg-gray-200 my-3" />
            <Spacer />
            <Text className="text-gray-700 font-bold leading-relaxed">
              Deltakere:
            </Text>
            <Text className="text-base  text-gray-700 leading-relaxed">
              Denne posten søker {post.maxCapacity} deltakere som kan
              delta.{" "}
            </Text>
            {post.participantsUids.length < post.maxCapacity ? (
              <Text className="text-base  text-gray-700 leading-relaxed mb-2">
                {post.participantsUids.length} har meldt seg på til å delta.{" "}
                {post.maxCapacity - post.participantsUids.length} ledige
                plasser.
              </Text>
            ) : (
              <Text className="text-base  text-gray-700 leading-relaxed mb-2">
                Hittil har {post.participantsUids.length} meldt seg til å delta
              </Text>
            )}
            {/* Knapp - Av- og påmelding */}
            <Pressable
              onPress={handleToggleVolunteer}
              className={isParticipating ? "bg-red-600" : "bg-green-600"}
            >
              <Text>
                {participants.includes(userProfile.userUid)
                  ? "Meld deg av"
                  : "Meld deg på"}
              </Text>
            </Pressable>
            {/* Divider */}
            <Spacer />
            <View className="h-[1px] bg-gray-200 my-3" />

            {/* Lik posten */}
            <View className="flex:col md:flex-row w-full items-center mb-3">
              <Text className="text-sm">Liker du denne posten? Vis det: </Text>

              <View className="flex-row">
                <Pressable
                  onPress={handleToggleLike}
                  className="flex-row items-center bg-blue-100 px-3 py-1 rounded-full mr-3"
                >
                  <Ionicons
                    name={
                      likes.includes(userProfile.userUid)
                        ? "heart"
                        : "heart-outline"
                    }
                    size={20}
                    color={likes.includes(userProfile.userUid) ? "red" : "gray"}
                  />
                  <Text className="ml-2 text-gray-700">
                    {likes.includes(userProfile.userUid)
                      ? "Liker ikke"
                      : "Liker"}
                  </Text>
                </Pressable>
              </View>

              <Text className="text-gray-600 text-sm">
                {likes.length === 0
                  ? "Vær den første til å like posten"
                  : `${likes.length} liker posten`}
                .
              </Text>
            </View>
            {/* Post lagd av */}
            <Text className="text-gray-500 text-sm font-bold italic">
              Skrevet av: {post?.createdByDisplayName}
            </Text>
          </View>

          {/* Kommentarer */}
          <Text className="text-xl font-semibold mb-3">Kommentarer</Text>

          {isLoadingComments && !postComments ? (
            <ActivityIndicator size="large" />
          ) : (
            <View className="min-h-24">
              {postComments.length === 0 && (
                <Text className="italic">
                  Ingen har skrevet en kommentar enda, du kan være første!
                </Text>
              )}
              {postComments.map((item) => (
                <View
                  key={item.id}
                  className="flex-row justify-between items-center bg-gray-100 rounded-xl p-3 mb-2"
                >
                  {/* Kommentarer - Innhold */}
                  <View className="flex-1 mr-3">
                    <View className="flex-row">
                      <Text className="text-gray-800 font-semibold">
                        {item.comment.authorName}
                      </Text>

                      {/* TODO: Skal forfatter stå med tekst eller med badge? Bestem deg eller fjern dobbel */}
                      {isLargeScreen &&
                      post.createdBy === item.comment.authorUid ? (
                        <Text className="text-xs"> (forfatter)</Text>
                      ) : (
                        <Text></Text>
                      )}
                      {!isLargeScreen &&
                      post.createdBy === item.comment.authorUid ? (
                        <Text className="text-xs"> (forfatter)</Text>
                      ) : (
                        <Text></Text>
                      )}
                      <Text>:</Text>
                    </View>

                    <Text className="text-gray-700">
                      {item.comment.commentText}
                    </Text>

                    <View className="h-[1px] bg-gray-200 my-1" />

                    <Text className="text-xs text-gray-500">
                      Skrevet {/* TODO: Kode for å legge inn dato */}
                    </Text>
                  </View>

                  {/* Knapp: Slett kommentar (om forfatter) */}
                  {item.comment.authorUid === userProfile.userUid && (
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
