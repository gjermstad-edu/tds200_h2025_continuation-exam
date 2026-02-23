import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  setDoc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { auth, db } from 'root/firebaseConfig';

import { uploadImageToFirebase } from './imageApi';
import { CreatePostInput, PostData, PostDataFirestore } from '@/models/PostData';
import { InjuryLocation } from '@/models/PostCategories';
import { timestampToDate } from '@/util/timestampToDate';

/*
/ Denne koden er delvis basert på kodebasene fra forelesninger i faget TDS200 ved Høyskolen Kristiania høsten 2025.
/ Brukt med tillatelse.
*/

/* 
/
/ Innheolder kode for å:
/ - Lage ny post
/ - Hente ut alle poster
/ - Hent ut post basert på ID
/ - Slett en post
/ - Oppdater flere poster
/ - Oppdater singel post
/ - Hent poster filtrert på kategorie (remote)
/ - Hent poster filtrert på tekst (lokalt)
/
*/

// Navn på collection i Firestore for å unngå skrivefeil
const COLLECTION_NAME = 'injuryEntries';

// Lag en ny post
export const createPost = async (post: CreatePostInput) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('🚨 Error: User not authenticated [from postApi.ts]');

    const uploadedImageUrls: string[] = [];

    // Laster opp bildene til brukeren
    if (Array.isArray(post.images) && post.images.length > 0) {
      for (const uri of post.images) {
        // hopper over om uri mangler
        if (!uri) continue;

        const downloadUrl = await uploadImageToFirebase(uri);

        if (!downloadUrl) {
          console.error(`🚨 Error: Image upload failed for image "${uri}" [from postApi.ts]`);
          continue; // optionally skip instead of throwing
        }

        uploadedImageUrls.push(downloadUrl);
      }
    } else {
      throw new Error('🚨 Error: User must upload at least 1 image [from postApi.ts]');
    }

    // Henter ut id for posten
    const postsCollection = collection(db, COLLECTION_NAME);
    const docRef = doc(postsCollection);

    // Lager objekte/posten vi skal lagre basert på modellen
    const newPostWithMetadata: PostDataFirestore = {
      postId: docRef.id,
      createdBy: user.uid,
      createdByDisplayName: user.displayName ?? "Anonym",
      
      images: uploadedImageUrls,

      injuryLocation: post.injuryLocation,
      painLevel: post.painLevel,
      swelling: post.swelling,
      mobilityLimit: post.mobilityLimit,
      temperature: post.temperature,

      statusIndicator: post.statusIndicator,
      statusExplanation: post.statusExplanation,
      
      title: post.title,
      description: post.description,

      comments: [],

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log("DEBUG newPostWithMetadata:", JSON.stringify(newPostWithMetadata, null, 2));

    // Sender til Firebase
    await setDoc(docRef, newPostWithMetadata);

    console.log(
      `🛜 Document for new post written to Firestore with ID: ${newPostWithMetadata.postId} [from postApi.ts]`,
    );
    // TODO:
    // showSuccessToast('👍 Ny post er opprettet og publisert', 'Du finner den på hjem-skjermen.');

    // Returnerer objektet
    return {
      ...newPostWithMetadata,
      postId: docRef.id,
      createdAt: null,
      updatedAt: null,
    } as unknown as PostData;
  } catch (e) {
    // TODO: Fiks Toast eller fjern
    /* showErrorToast(
      '🚨 Error:  Noe gikk galt under opprettelsen av posten.',
      'Vennligst prøv igjen, ingenting er lagret.',
    ); */
    console.error(
      `🚨 Error: Adding new post to Firestore failed: ${e} [from postApi.ts/createPost]`,
    );
    return null;
  }
};

// Hent alle poster fra databasen
export const getAllPosts = async () => {
  try {
    const postsRef = collection(db, COLLECTION_NAME);
    const postsQuery = query(postsRef, orderBy("createdAt", "desc"));

    const queryResult = await getDocs(postsQuery);

    return queryResult.docs.map((doc) => {
      const data = doc.data();

      return {
        ...(data as PostData),
        postId: doc.id,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt), 
      } as PostData;
    });

  } catch (error) {
    console.error("🚨 getAllPosts failed:", error);
    return [];
  }
};

// Hent post med ID
export const getPostById = async (id: string) => {
  const specificPost = await getDoc(doc(db, COLLECTION_NAME, id));
  const data = specificPost.data();

  console.log(`🛜 Got post with spesific id: ${specificPost.id}`);

  return {
    ...(data as PostData),
    postId: specificPost.id,
    createdAt: timestampToDate(data?.createdAt),
    updatedAt: timestampToDate(data?.updatedAt),
  } as PostData;
};

// Slett en post basert på ID
export const deletePost = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));

    console.log('👍 Post successfully deleted! [from postApi.ts/deletePost]');
  } catch (e) {
    console.error(`🚨 Error: Error removing document: ${e} [from postApi.ts/deletePost]`);
  }
};

// Oppdater flere poster
export const updatePosts = async (posts: PostData[]) => {
  const operations = posts.map(async (post) => {
    // Tar doc-id ut av payload
    const { postId, ...data } = post;
    const postRef = doc(db, COLLECTION_NAME, postId);

    // setDoc + merge = “oppdater disse feltene”
    await setDoc(postRef, data, { merge: true });

    console.log(`👍 Post ${postId} updated successfully!`);
  });

  // Venter på alle async kall
  await Promise.all(operations);
};

// Oppdater singel post
export const updatePost = async (postId: string, updateData: Partial<PostData>) => {
  try {
    const postRef = doc(db, COLLECTION_NAME, postId);

    await updateDoc(postRef, {
      ...updateData,
      updatedAt: serverTimestamp() as any,
    });

    console.log(`👍 Post ${postId} updated successfully! [from postApi.ts/updatePost]`);
  } catch (error) {
    console.error(
      `🚨 Error:  Error updating post (postId: ${postId}): ${error} [from postApi.ts/updatePost]`,
    );
  }
};

// Hent poster filtrert på kategorie (remote)
export const getRemoteFilteredPosts = async (location: InjuryLocation | null) => {
  let postsRef = collection(db, COLLECTION_NAME);

  const postsQuery = location
    ? query(postsRef, where("injuryLocation", "==", location), orderBy("createdAt", "desc"))
    : query(postsRef, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(postsQuery);

  let posts: PostData[] = snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      ...(data as PostData),
      postId: doc.id,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    } as PostData;
  });

  return posts;
};

// Hent poster filtrert på tekst (lokalt)
export const getLocalSearchedPosts = async (searchQuery: string = '') => {
  let q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);

  let posts = snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      ...(data as PostData),
      postId: doc.id,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    } as PostData;
  });

  // Søker lokalt
  if (searchQuery.trim()) {
    const lowerQuery = searchQuery.toLowerCase();

    posts = posts.filter((post) => {
      const description = post.description ?? '';
      return (
        post.injuryLocation.toLowerCase().includes(lowerQuery) ||
        post.statusIndicator.toLowerCase().includes(lowerQuery) ||
        post.statusExplanation.toLowerCase().includes(lowerQuery) ||
        description.toLowerCase().includes(lowerQuery)
      );
    });
  }

  return posts;
};
