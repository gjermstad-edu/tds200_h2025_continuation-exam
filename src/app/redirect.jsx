import * as WebBrowser from "expo-web-browser";
WebBrowser.maybeCompleteAuthSession(); // must run first

import { useEffect } from "react";
import Toast from "react-native-toast-message";
import { signInWithGoogleCredential } from "../api/googleSignIn";

export default function RedirectHandler() {

  
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const idToken = hashParams.get("id_token");

    if (idToken) {
      signInWithGoogleCredential(idToken)
        .then(() => {
          Toast.show({ type: "success", text1: "Google login success" });

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
          Toast.show({
            type: "error",
            text1: "Login failed",
            text2: err.message,
          });
        });
    } else {
      console.warn("No id_token found in redirect URL.");
    }
  }, []);

  return <div>Completing login...</div>;
}
