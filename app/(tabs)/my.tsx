import TabPageWrapper from "@/components/common/tab-page-wrapper";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Settings() {
  return (
    <TabPageWrapper>
      <View className="h-[200vh] pt-14 px-4">
        <TouchableOpacity
          className="bg-foreground rounded-full p-4"
          activeOpacity={0.9}
          onPress={() => {
            router.push("/login");
          }}
        >
          <Text className="text-background font-bold text-center">로그인</Text>
        </TouchableOpacity>
      </View>
    </TabPageWrapper>
  );
}
