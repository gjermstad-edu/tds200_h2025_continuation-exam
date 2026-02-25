import { View, Text } from "react-native";

export default function FormCard(props: any) {
  return (
    <View className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
      <Text className="text-lg font-extrabold text-gray-900 mb-3">
        {props.title}
      </Text>

      {props.children}
    </View>
  );
}
