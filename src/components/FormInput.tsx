import React, { useState } from "react";
import { View, Text, TextInput, TextInputProps, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type InputFieldProps = TextInputProps & {
  label: string;
  error?: string;
  valid?: boolean; // true = grønn border, false = rød border, undefined = grå
  password?: boolean; // for å skjule passord
};

export function FormInput({
  label,
  error,
  valid,
  password = false,
  ...props
}: InputFieldProps) {
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);

  // Setter farge på kanten ut ifra om godkjent state utenfra
  const borderClassName =
    valid === true
      ? "border-green-500"
      : valid === false
        ? "border-red-500"
        : "border-gray-300";

  // Om tekstfeltet er et passord + at det skal være skjult pga øyet
  const isPasswordField = password ? isPasswordHidden : false;

  return (
    <View className="mt-4">
      <Text className="text-gray-800 mb-1">{label}</Text>

      <View
        className={`flex-row items-center border rounded-lg ${borderClassName}`}
      >
        <TextInput
          {...props}
          secureTextEntry={isPasswordField}
          autoCapitalize="none"
          className="flex-1 px-3 py-2 focus:outline-none focus:ring-0 outline-none"
        />
        {password && (
          <Pressable
            onPress={() => setIsPasswordHidden((prev) => !prev)}
            className="px-3"
          >
            <Ionicons
              name={isPasswordHidden ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#6B7280"
            />
          </Pressable>
        )}
      </View>

      {!!error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}
    </View>
  );
}
