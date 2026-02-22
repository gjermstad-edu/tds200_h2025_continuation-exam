import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";

type InputFieldProps = TextInputProps & {
  label: string;
  error?: string;
  valid?: boolean; // true = grønn border, false = rød border, undefined = grå
};

export function FormInput({ label, error, valid, ...props }: InputFieldProps) {
  const borderClassName =
    valid === true
      ? "border-green-500"
      : valid === false
        ? "border-red-500"
        : "border-gray-300";

  return (
    <View className="mt-4">
      <Text className="text-gray-800 mb-1">{label}</Text>

      <TextInput
        {...props}
        className={`border rounded-lg px-3 py-2 ${borderClassName}`}
      />

      {!!error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}
    </View>
  );
}
