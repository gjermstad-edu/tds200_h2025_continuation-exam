import React from "react";
import { View, Text } from "react-native";
import Slider from "@react-native-community/slider";

// Denne komponenten er basert på https://www.npmjs.com/package/@react-native-community/slider
// Installert med 'npm install @react-native-community/slider --save'

type NumberPickerProps = {
  min: number;
  max: number;
  steps?: number;
  value: number;
  onChange: (newValue: number) => void;
};

export function NumberPicker({
  min,
  max,
  steps = 1,
  value,
  onChange,
}: NumberPickerProps) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 14, fontWeight: "600" }}>
        Valgt verdi: {value}
      </Text>

      <Slider
        minimumValue={min}
        maximumValue={max}
        step={steps}
        value={value}
        onValueChange={(newValue) => onChange(Math.round(newValue))}
      />
    </View>
  );
}
