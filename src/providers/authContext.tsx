import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "expo-router";

import { auth, db } from "root/firebaseConfig";
import {
  doc,
  onSnapshot,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

import * as authApi from "@/api/authApi";
import { UserProfile } from "@/models/UserProfile";

/*
 ** Denne koden er basert på kodebasene fra forelesninger i faget TDS200 ved Høyskolen Kristiania høsten 2025.
 ** Brukt med tillatelse.
 */

//  Denne filen er for om bruker er innlogget (context)

/**
 * @firebaseUser Firebase Authentication (bl.a. uid, e-post, displayName).
 * @userProfile Profildata til brukeren lagret i Firestore
 */
type AuthContextType = {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAuthLoading: boolean;
  isProfileLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  signIn: async () => {},
  signOut: async () => {},
  firebaseUser: null,
  userProfile: null,
  isAuthLoading: false,
  isProfileLoading: false,
});

// Gir tilgang på `useAuthContext` på alle sider som har tilgang på Context:
// returnerer `useContext(AuthContext)`
export function useAuthContext() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error(
      "UseAuthSession must be used within a AuthContext Provider",
    );
  }

  return value;
}

// Gir `authContext` til children den wrappes rundt
export function AuthSessionProvider({ children }: { children: ReactNode }) {
  // null = mangler
  // undefined = skal hentes fra Firebase
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const router = useRouter();

  // Sjekker om logget inn i context
  useEffect(() => {
    setIsAuthLoading(true);

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (user) => {
        setFirebaseUser(user ?? null);

        // Fjerner profilen når brukeren logger ut
        if (!user) {
          setUserProfile(null);
          setIsProfileLoading(false);
        }

        setIsAuthLoading(false);
      },
      (error) => {
        console.error(`ERROR error: ${error} [From authContext.tsx]`);
        setIsAuthLoading(false);
      },
    );
    return unsubscribeAuth;
  }, []);

  // Sjekk profilen når logget inn i context
  useEffect(() => {
    // Sikrer at profilen er tom om ikke logget inn
    if (!firebaseUser) {
      setUserProfile(null);
      setIsProfileLoading(false);
      return;
    }

    setIsProfileLoading(true);
    const ref = doc(db, "users", firebaseUser.uid);
    const unsubscribeProfile = onSnapshot(
      ref,
      (snap) => {
        setUserProfile(snap.exists() ? (snap.data() as UserProfile) : null);
        setIsProfileLoading(false);
      },
      () => setIsProfileLoading(false),
    );

    return unsubscribeProfile;
  }, [firebaseUser?.uid]);

  // Sikrer at brukerdata blir lagret i Firebase om den skulle mangle
  useEffect(() => {
    const syncUserProfile = async () => {
      if (!firebaseUser) return;

      const ref = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(ref);

      if (!userSnap.exists()) {
        const displayName = firebaseUser.displayName ?? "";
        const nameParts = displayName.trim().split(/\s+/).filter(Boolean);

        const firstName = nameParts[0] ?? "";
        const lastName =
          nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

        const newUserProfile: UserProfile = {
          userUid: firebaseUser.uid,
          firstName: nameParts[0] ?? "",
          lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : "",
          phone: "",
          email: firebaseUser.email ?? "",
          role: "user",
        };

        // Legger til dato for når brukeren var lagd
        await setDoc(ref, {
          ...newUserProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    };

    syncUserProfile().catch((error) =>
      console.error("ERROR from syncUserProfile:", error),
    );
  }, [firebaseUser?.uid]);

  /*
   ** Start return-blokk
   */

  return (
    <AuthContext.Provider
      value={{
        signIn: async (email, password) => {
          await authApi.signInUser(email, password);
        },
        signOut: async () => {
          await authApi.signOutUser();
        },
        firebaseUser,
        userProfile,
        isAuthLoading: isAuthLoading,
        isProfileLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
