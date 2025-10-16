import TabPageWrapper from "@/components/common/tab-page-wrapper";
import { useAuthStore } from "@/stores/auth-store";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Settings() {
  const { user, signOut } = useAuthStore();
  return (
    <TabPageWrapper>
      <View className="flex-1 flex-col justify-center mt-20 px-4">
        {user ? (
          <TouchableOpacity
            className="bg-foreground rounded-full py-4"
            activeOpacity={0.9}
            onPress={signOut}
          >
            <Text className="text-background font-bold text-center">
              로그아웃
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="bg-foreground rounded-full py-4"
            activeOpacity={0.9}
            onPress={() => {
              router.push("/login");
            }}
          >
            <Text className="text-background font-bold text-center">
              로그인
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TabPageWrapper>
  );
}
