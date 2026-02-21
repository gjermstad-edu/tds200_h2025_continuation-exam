import { Platform } from "react-native";
import { initializeApp, getApps, getApp } from "firebase/app";

import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import {
  browserLocalPersistence,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref } from "firebase/storage";
import firebaseConfig from "./firebaseEnv";

/*
 ** Denne koden er basert på kodebasene fra forelesninger i faget TDS200 ved Høyskolen Kristiania høsten 2025.
 ** Brukt med tillatelse.
 */

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;

if (Platform.OS === "web") {
  auth = getAuth(app);
  auth.setPersistence(browserLocalPersistence); // Web persistence
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage), // Mobile persistence
  });
}

export { auth };

export const db = getFirestore(app);

const storage = getStorage(app);
export const getStorageRef = (path) => ref(storage, path);
