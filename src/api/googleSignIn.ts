import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "firebaseConfig";

export async function signInWithGoogleCredential(idToken: string) {
  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(auth, credential);
  return userCredential.user;
}