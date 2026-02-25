import * as WebBrowser from "expo-web-browser";
WebBrowser.maybeCompleteAuthSession(); // must run first
import { useEffect } from "react";
import Toast from "react-native-toast-message";

import { signInWithGoogleCredential } from "../api/googleSignIn";
import { displaySuccessToast, displayErrorToast } from "@/components/ToastMessage";


/*
/ Denne koden er basert på kodebasene fra forelesninger i faget TDS200 ved Høyskolen Kristiania høsten 2025.
/ Brukt med tillatelse.
*/

export default function RedirectHandler() {  
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const idToken = hashParams.get("id_token");

    if (idToken) {
      signInWithGoogleCredential(idToken)
        .then(() => {
          displaySuccessToast("Google Sign-In godkjent")

          // Tell the main window that login succeeded
          if (window.opener) {
            window.opener.postMessage(
              { type: "GOOGLE_AUTH_SUCCESS", idToken },
              "*" // same origin is fine in localhost
            );
            window.close(); // Close the popup
          } else {
            // Fallback: if opened directly (no opener), just redirect
            window.location.replace("/");
          }
        })
        .catch((err) => {
          console.error("Firebase sign-in failed:", err);
          displayErrorToast("Innlogging feilet", err?.message);
        });
    } else {
      console.warn("No id_token found in redirect URL.");
    }
  }, []);

  return <div>Completing login...</div>;
}
