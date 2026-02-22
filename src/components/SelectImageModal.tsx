import { useRef } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button,
  Platform,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Device from "expo-device";

/*
/ Denne koden er delvis basert på kodebasene fra forelesninger i faget TDS200 ved Høyskolen Kristiania høsten 2025.
/ Brukt med tillatelse.
*/

// closeModal: closes the modal after an action.
// setImages: updates the images array in the parent component (PostForm).
// currentImages: already selected images (so new ones can be appended).

type SelectImageModalProps = {
  closeModal: () => void;
  setImages: (images: string[]) => void;
  currentImages: string[];
};

export default function SelectImageModal({
  closeModal,
  setImages,
  currentImages,
}: SelectImageModalProps) {
  // This modal:
  // - Detects if camera is usable (permissions & simulator check).
  // - Lets user take a picture or pick an image from gallery.
  // - Adds selected/captured image URIs to the parent component’s images.
  // - Can be closed with “Avbryt”.

  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const isOSSimulator =
    (Platform.OS === "ios" && !Device.isDevice) ||
    (Platform.OS === "android" && !Device.isDevice);

  if (!permission && !isOSSimulator) {
    console.log("No permission object");
    // Camera permissions are still loading.
    return <View />;
  }

  if (!isOSSimulator && permission && !permission.granted) {
    console.log("Permission not granted");
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  let camera: CameraView | null = null;

  const captureImage = async () => {
    // captureImage from cameraRef and add to images array.
    const photo = await cameraRef.current?.takePictureAsync();
    if (photo?.uri) {
      setImages([...currentImages, photo.uri]);
      closeModal();
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    // pick image from gallery and add to images array.
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      allowsMultipleSelection: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setImages([...currentImages, ...uris]); // append selected image
      closeModal();
    }
  };

  return (
    <View style={styles.container}>
      {/* preview  */}
      {!isOSSimulator ? (
        <CameraView
          // FÅR RØD STREK UNDER ref, men det fungerer, så ikke rør
          ref={(r) => (cameraRef.current = r)}
          style={StyleSheet.absoluteFill}
          facing="back"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.simPanel]}>
          <Text style={styles.text}>iOS Simulator — use “Velg bilde”</Text>
        </View>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => pickImage()}>
          <Text style={styles.text}>Velg bilde</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, isOSSimulator && styles.buttonDisabled]}
          disabled={isOSSimulator}
          onPress={!isOSSimulator ? captureImage : undefined}
          accessibilityState={{ disabled: isOSSimulator }}
        >
          <Text style={styles.text}>Snap!</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => closeModal()}>
          <Text style={styles.text}>Avbryt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    justifyContent: "space-between",
    marginBottom: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  previewWrapper: { flex: 1, position: "relative" },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end" },
  simPanel: {
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.4 },
});
