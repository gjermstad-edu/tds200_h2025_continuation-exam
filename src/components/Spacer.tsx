import React from "react";
import { View } from "react-native";

/*
/ Denne koden er delvis basert på kodebasene fra forelesninger i faget TDS200 ved Høyskolen Kristiania høsten 2025.
/ Brukt med tillatelse.
*/

// A simple component that can be used to add space between elements
// width er satt til `undefined` som default ettersom height er mer relevant på mobilapplikasjoner

type SpacerProps = {
  height?: number;
  width?: number;
};

const Spacer = ({ height = 20, width = undefined }: SpacerProps) => {
  return (
    <View
      style={{ height: height ? height : 0, width: width ? width : 0 }}
    ></View>
  );
};

export default Spacer;
