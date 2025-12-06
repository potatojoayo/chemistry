import AnimatedPageWrapper from "@/components/common/animated-page-wrapper";
import CleanHeader from "@/components/common/clean-header";
import { useAuthStore } from "@/stores/auth-store";
import { FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DeleteAccount() {
  const { signOut } = useAuthStore();

  const handleDeleteAccount = async () => {
    // TODO: Implement actual delete account logic here (API call)
    // For now, just sign out
    await signOut();
  };

  return (
    <AnimatedPageWrapper>
      <View className="flex-1 bg-background">
        <CleanHeader>
          <Pressable onPress={() => router.back()} className="p-2">
            <FontAwesome6 name="chevron-left" size={20} color="#ECEEDF" />
          </Pressable>
          <Text className="text-foreground font-semibold text-lg ml-2">
            회원 탈퇴
          </Text>
        </CleanHeader>
        <ScrollView className="flex-1 px-4 pt-4">
          <View className="bg-card rounded-2xl p-6 mb-6">
            <Text className="text-foreground font-bold text-lg mb-4">
              정말 탈퇴하시겠습니까?
            </Text>
            <Text className="text-muted-foreground mb-2">
              회원 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
            </Text>
            <Text className="text-muted-foreground">
              신중하게 결정해 주세요.
            </Text>
          </View>

          <TouchableOpacity
            className="bg-red-500 rounded-full py-4"
            activeOpacity={0.9}
            onPress={handleDeleteAccount}
          >
            <Text className="text-white font-bold text-center">
              회원 탈퇴하기
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </AnimatedPageWrapper>
  );
}
