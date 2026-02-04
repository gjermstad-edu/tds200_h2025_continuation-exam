import React from "react";

import { Pressable, Text, View } from "react-native";

import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function Page() {
  return (
    <>
      <Header />
      <View className="flex-1">
        <View className="py-12 md:py-24 lg:py-32 xl:py-48">
          <View className="px-4 md:px-6">
            <View className="flex flex-col items-center gap-4 text-center">
              <Text
                role="heading"
                className="text-3xl text-red-600 text-center native:text-5xl font-bold sm:text-4xl md:text-5xl lg:text-6xl font-rounded"
              >
                Welcome to Project RAMMEVERK 🔨🖼️
              </Text>
              <Text className="mx-auto max-w-[700px] text-lg text-center text-gray-500 md:text-xl dark:text-gray-400">
                Discover and collaborate on acme. Explore our services now.
              </Text>
            </View>
          </View>
        </View>
      </View>
      <Footer />
    </>
  );
}
