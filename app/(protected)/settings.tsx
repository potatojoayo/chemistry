import CleanHeader from "@/components/common/clean-header";
import { useAuthStore } from "@/stores/auth-store";
import { FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

export default function Settings() {
  const { user, signOut } = useAuthStore();
  return (
    <View className="flex-1 bg-background">
      <CleanHeader>
        <Pressable onPress={() => router.back()} className="p-2">
          <FontAwesome6 name="chevron-left" size={20} color="#ECEEDF" />
        </Pressable>
        <Text className="text-foreground font-semibold text-lg ml-2">설정</Text>
      </CleanHeader>
      <View className="flex-1 flex-col justify-center px-4 pt-14">
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
    </View>
  );
}
