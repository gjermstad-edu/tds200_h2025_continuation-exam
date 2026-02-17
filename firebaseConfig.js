import { Platform } from "react-native";
import { initializeApp } from "firebase/app";

import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import {
  browserLocalPersistence,
  getAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref } from "firebase/storage";
import firebaseConfig from "./firebaseEnv";

/*
 ** Denne koden er basert på kodebasene fra forelesninger i faget TDS200 ved Høyskolen Kristiania høsten 2025.
 ** Brukt med tillatelse.
 */

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
if (Platform.OS === "web") {
  auth.setPersistence(browserLocalPersistence); // Web persistence
} else {
  auth.setPersistence(getReactNativePersistence(ReactNativeAsyncStorage)); // Mobile persistence
}
export { auth };
export const db = getFirestore(app);
const storage = getStorage(app);
export const getStorageRef = (path) => ref(storage, path);
