import * as React from "react";
import { View, StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

/*
/
/ Denne koden er basert på koden delt på StackOverflow (https://stackoverflow.com/questions/71790758/get-a-google-sign-in-button-on-react-native-expo)
/ Link til selve koden: https://snack.expo.dev/VCYpu9tk1?platform=ios
/
*/

type GoogleProps = {
  disabled: boolean;
  onPress: () => void;
};

export default function GoogleSignInButton({
  disabled = false,
  onPress,
}: GoogleProps) {
  return (
    <View style={styles.container}>
      <FontAwesome.Button
        name="google"
        backgroundColor="#4285F4"
        onPress={onPress}
        disabled={disabled}
        borderRadius={12}
        iconStyle={styles.icon}
        style={styles.button}
      >
        Logg inn med Google
      </FontAwesome.Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  button: {
    justifyContent: "center",
    paddingVertical: 12,
    width: "100%",
  },
  icon: {
    marginRight: 10,
  },
});
