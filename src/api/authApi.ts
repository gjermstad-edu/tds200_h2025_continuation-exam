import { auth, db } from 'root/firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import type { UserProfile } from '@/models/UserProfile';

/*
/ Denne koden er basert på kodebasene fra forelesninger i faget TDS200 ved Høyskolen Kristiania høsten 2025.
/ Brukt med tillatelse.
*/

/**
 * Logg inn bruker med e-post og passord
 * @param email
 * @param password
 * @returns Firebase `userCredential.user`
 */
export const signInUser = async (
  email: string,
  password: string,
): Promise<{ authUser: FirebaseUser; userProfile: UserProfile }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    const fireBaseUser = userCredential.user;
    const userId = userCredential.user.uid;

    console.log(`🤔 Logging in. ${email}'s uid: ${userId}`);

    const userProfileReference = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userProfileReference);

    const userProfile = userSnapshot.exists() ? (userSnapshot.data() as UserProfile) : null;

    console.log(
      `👍 User ${userCredential.user.email} successfully signed in [Source: authenticateApi.ts/signInUser()]`,
    );

    return { authUser: fireBaseUser, userProfile };
  } catch (error: any) {
    console.error(
      `🚨 Error: Could not log in user, ${error.message} [Source: authenticateApi.ts/signOutUser()]`,
    );
    throw error; // rethrow for UI to catch
  }
};

/**
 * Logg ut innlogget bruker
 */
export const signOutUser = async () => {
  const userEmailBeforeSignOut = auth.currentUser?.email ?? undefined;

  try {
    await firebaseSignOut(auth);

    if (userEmailBeforeSignOut) {
      console.log(
        `👍 Signed out user "${userEmailBeforeSignOut}" successfully [Source: authenticateApi.ts/signOutUser()]`,
      );
    } else {
      console.log(`👍 User signed out successfully [Source: authenticateApi.ts/signOutUser()]`);
    }

    
  } catch (error: any) {
    console.error(
      `🚨 Error signing out user: ${error.message} [Source: authenticateApi.ts/signOutUser()]`,
    );
    throw error; // optional: allow UI to handle logout failures
  }
};

/**
 * Lag ny brukerkonto med e-post og passord
 * @returns Firebase userCredentials.user + userProfile
 */
export const signUpUserWithEmail = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
): Promise<{ authUser: FirebaseUser; userProfile: UserProfile }> => {
  try {
    const fullName: string = `${firstName} ${lastName}`;

    // Lager en ny bruker i Firebase basert på e-post og passord i Firebase Authentication
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    // Lager en ny bruker etter modellen userProfile for lagring i FireStore
    const userProfile: UserProfile = {
      userUid: userCredential.user.uid,
      firstName: firstName,
      lastName: lastName,
      phone: '',
      email: email,
      role: 'user',
    };

    // Setter Displayname i Firebase Auth
    await Promise.all([
      updateProfile(userCredential.user, { displayName: fullName }),

      // Lagrer profilen i Firestore
      setDoc(doc(db, 'users', userCredential.user.uid), {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),

      userCredential.user.reload(),
    ]);

    return { authUser: userCredential.user, userProfile };
  } catch (error: any) {
    console.error(
      `🚨 Error: ${error.code}, message: ${error.message} [Source: authApi.ts/signUpUserWithEmail()]`,
    );
    throw error; // rethrow so UI can handle it
  }
};
