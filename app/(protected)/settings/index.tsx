import AnimatedPageWrapper from "@/components/common/animated-page-wrapper";
import CleanHeader from "@/components/common/clean-header";
import ConfirmationModal from "@/components/common/confirmation-modal";
import SettingsItem from "@/components/settings/settings-item";
import { useAuthStore } from "@/stores/auth-store";
import { FontAwesome6 } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function Settings() {
  const { user, signOut, deleteAccount } = useAuthStore();
  const version = Constants.expoConfig?.version ?? "1.0.0";
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isDeleteAccountModalVisible, setIsDeleteAccountModalVisible] =
    useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setIsLogoutModalVisible(false);
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteAccount();
      // No need to set isDeleting false or close modal as we are signing out/redirecting
      setIsDeleteAccountModalVisible(false);
    } catch (error) {
      console.error("Failed to delete account", error);
      setIsDeleting(false);
      // Optionally show error alert here
    }
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
                onPress={() => setIsLogoutModalVisible(true)}
              />
              <SettingsItem
                label="회원 탈퇴"
                icon="user-xmark"
                onPress={() => setIsDeleteAccountModalVisible(true)}
                isDestructive
              />
            </View>
          </View>
        </ScrollView>

        <ConfirmationModal
          visible={isLogoutModalVisible}
          onClose={() => setIsLogoutModalVisible(false)}
          onConfirm={handleLogout}
          title="로그아웃"
          message="정말 로그아웃 하시겠습니까?"
          confirmText="로그아웃"
          isDestructive
        />

        <ConfirmationModal
          visible={isDeleteAccountModalVisible}
          onClose={() => !isDeleting && setIsDeleteAccountModalVisible(false)}
          onConfirm={handleDeleteAccount}
          title="회원 탈퇴"
          message={`회원 탈퇴 시 모든 데이터가 삭제되며\n복구할 수 없습니다.\n정말 탈퇴하시겠습니까?`}
          confirmText="탈퇴하기"
          isDestructive
          isLoading={isDeleting}
        />
      </View>
    </AnimatedPageWrapper>
  );
}
