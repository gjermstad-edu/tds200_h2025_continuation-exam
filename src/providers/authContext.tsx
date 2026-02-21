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

/**
 * Gir tilgang på `useAuthContext` på alle sider som har tilgang på Context:
 * @returns useContext(AuthContext)
 */
export function useAuthContext() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error(
      "UseAuthSession must be used within a AuthContext Provider",
    );
  }

  return value;
}

/**
 * Gir `authContext` til children den wrappes rundt
 */
export function AuthSessionProvider({ children }: { children: ReactNode }) {
  // null = mangler
  // undefined = skal hentes fra Firebase
  const [firebaseUser, setFirebaseUser] = useState<
    FirebaseUser | null | undefined
  >(null);
  const [userProfile, setUserProfile] = useState<
    UserProfile | null | undefined
  >(null);

  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const router = useRouter();

  // Sjekker om logget inn i context
  useEffect(() => {
    setIsAuthLoading(true);
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user ?? null);

      // Fjerner profilen når brukeren logger ut
      if (!user) {
        setUserProfile(null);
        setIsProfileLoading(false);
        return;
      }

      setIsAuthLoading(false);
    });
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
      if (!firebaseUser) {
        setUserProfile(null);
        return;
      }

      const ref = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(ref);

      if (!userSnap.exists()) {
        const name = firebaseUser.displayName.split(" ");

        const newUserProfile: UserProfile = {
          userUid: firebaseUser.uid,
          firstName: name.toString(),
          lastName: name[name.length - 1].toString(),
          phone: "",
          email: firebaseUser.email,
          role: "user",
        };

        // Legger til dato for når brukeren var lagd
        await setDoc(ref, {
          ...newUserProfile,
          createdAt: serverTimestamp(),
        });

        // Henter ut oppdatert info med createdAt for bruk på siden
        const freshSnap = await getDoc(ref);
        setUserProfile(freshSnap.data() as UserProfile);
      } else {
        setUserProfile(userSnap.data() as UserProfile);
      }
    };

    syncUserProfile();
  }, [firebaseUser]);

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
