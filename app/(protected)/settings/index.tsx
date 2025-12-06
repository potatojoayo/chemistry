import AnimatedPageWrapper from "@/components/common/animated-page-wrapper";
import CleanHeader from "@/components/common/clean-header";
import SettingsItem from "@/components/settings/settings-item";
import { useAuthStore } from "@/stores/auth-store";
import { FontAwesome6 } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function Settings() {
  const { user, signOut } = useAuthStore();
  const version = Constants.expoConfig?.version ?? "1.0.0";

  const handleLogout = async () => {
    await signOut();
    // router.replace("/login"); // signOut usually handles redirection or state change
  };

  return (
    <AnimatedPageWrapper>
      <View className="flex-1 bg-background">
        <CleanHeader>
          <Pressable onPress={() => router.back()} className="p-2">
            <FontAwesome6 name="chevron-left" size={20} color="#ECEEDF" />
          </Pressable>
          <Text className="text-white font-semibold text-lg ml-2">설정</Text>
        </CleanHeader>

        <ScrollView className="flex-1 px-3 pt-20">
          {/* Legal Section */}
          <View className="mb-8">
            <Text className="text-white/60 text-sm font-medium mb-2 ml-1">
              약관 및 정책
            </Text>
            <View className="bg-card rounded-2xl overflow-hidden">
              <SettingsItem
                label="서비스 이용약관"
                icon="file-contract"
                onPress={() => router.push("/settings/terms-of-service")}
              />
              <SettingsItem
                label="개인정보 처리방침"
                icon="shield-halved"
                onPress={() => router.push("/settings/privacy-policy")}
              />
            </View>
          </View>

          {/* App Info Section */}
          <View className="mb-8">
            <Text className="text-white/60 text-sm font-medium mb-2 ml-1">
              앱 정보
            </Text>
            <View className="bg-card rounded-2xl overflow-hidden">
              <SettingsItem
                label="버전 정보"
                icon="circle-info"
                value={version}
              />
            </View>
          </View>

          {/* Account Section */}
          <View className="mb-8">
            <Text className="text-white/60 text-sm font-medium mb-2 ml-1">
              계정
            </Text>
            <View className="bg-card rounded-2xl overflow-hidden">
              <SettingsItem
                label="로그아웃"
                icon="arrow-right-from-bracket"
                onPress={handleLogout}
              />
              <SettingsItem
                label="회원 탈퇴"
                icon="user-xmark"
                onPress={() => router.push("/settings/delete-account")}
                isDestructive
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </AnimatedPageWrapper>
  );
}
