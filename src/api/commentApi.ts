import { db } from 'root/firebaseConfig';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { CommentData, CommentObject } from '@/models/PostData';

/*
/ Denne koden er basert på kodebasene fra forelesninger i faget TDS200 ved Høyskolen Kristiania høsten 2025.
/ Brukt med tillatelse.
*/

// Legger til en ny kommentar til en post
export const addComment = async (postId: string, comment: CommentData) => {
  try {
    const commentRef = doc(collection(db, 'comments')); // lag id først

  const payload: CommentData = {
    ...comment,
    commentId: commentRef.id,
    postId,
    createdAt: serverTimestamp() as any,
  };

  await setDoc(commentRef, payload);

  await updateDoc(doc(db, 'posts', postId), {
    comments: arrayUnion(commentRef.id),
  });
  
  console.info(
    `👍 Added comment with id "${commentRef.id}" to post "${postId}" [from commentAPI.ts/addComment]`,
  );

  return commentRef.id;
  } catch (error) {
    console.error(`🚨 Error adding comment: ${error}`);
  }
};

// Henter ut kommentarer basert på id
export const getCommentsByIds = async (ids: string[]) => {
  try {
    const comments: CommentObject[] = [];

    for (const id of ids) {
      const docSnap = await getDoc(doc(db, 'comments', id));
      if (docSnap.exists()) {
        comments.push({ id: docSnap.id, comment: docSnap.data() } as CommentObject);
      }
    }

    return comments;
  } catch (error) {
    console.error(`🚨 Error getting comments: ${error} [from commentAPI.ts/getCommentsByIds]`);
    return [];
  }
};

// Sletter en kommentar
export const deleteComment = async (commentId: string, postId: string) => {
  try {
    const postRef = doc(db, 'posts', postId);

    await updateDoc(postRef, {
      comments: arrayRemove(commentId),
    });

    await deleteDoc(doc(db, 'comments', commentId));
  } catch (error) {
    console.log(`🚨 Error deleting document: ${error} [from commentAPI.ts/deleteComment]`);
  }
};
