import Toast from "react-native-toast-message";

export type ToastMessageType = "success" | "error" | "info";

/*
/ Denne koden er basert på kodebasene fra forelesninger i faget TDS200 ved Høyskolen Kristiania høsten 2025.
/ Brukt med tillatelse.
*/

type ToastProps = {
  type?: ToastMessageType;
  title: string;
  message?: string;
};

export function displaySuccessToast(title: string, message?: string) {
  ToastMessage({ type: "success", title, message });
}

export function displayErrorToast(title: string, message?: string) {
  ToastMessage({ type: "error", title, message });
}

export function displayInfoToast(title: string, message?: string) {
  ToastMessage({ type: "info", title, message });
}

export function ToastMessage({ type = "info", title, message }: ToastProps) {
  console.info(
    `ToastMessage displayed: Type = ${type} / Title = ${title} / Message = ${message}`,
  );

  Toast.show({
    type,
    text1: title,
    text2: message,
    visibilityTime: 3000,
  });
}
