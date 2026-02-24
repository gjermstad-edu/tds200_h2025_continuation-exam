import { InjuryStatus } from "@/models/PostData";
import { Text, View } from "react-native";

type TextChipProps = {
  text: InjuryStatus;
};

// Enkel funksjon for å legge til farget chip på Posts
export default function TextChip({ text }: TextChipProps) {
  const injuryString = text.toString();
  let chipColor = "";

  if (injuryString == "ny skade") chipColor = "bg-orange-300";
  if (injuryString == "forbedres") chipColor = "bg-green-300";
  if (injuryString == "stabil") chipColor = "bg-yellow-300";
  if (injuryString == "forverres") chipColor = "bg-red-400";
  if (injuryString == "frisk") chipColor = "bg-red-400";

  return (
    <>
      <View className={`px-2 py-1 rounded-lg ${chipColor}`}>
        <Text className="text-base font-semibold">{text}</Text>
      </View>
    </>
  );
}
