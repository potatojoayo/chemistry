import TabPageWrapper from "@/components/common/tab-page-wrapper";
import React from "react";
import { Text, View } from "react-native";

export default function Settings() {
  return (
    <TabPageWrapper>
      <View className="h-[200vh] pt-14">
        <Text className="text-white text-xl px-3 py-1">Settings</Text>
      </View>
    </TabPageWrapper>
  );
}
