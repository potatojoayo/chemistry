import AnimatedPageWrapper from "@/components/common/animated-page-wrapper";
import CleanHeader from "@/components/common/clean-header";
import { FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function TermsOfService() {
  return (
    <AnimatedPageWrapper>
      <View className="flex-1 bg-background">
        <CleanHeader>
          <Pressable onPress={() => router.back()} className="p-2">
            <FontAwesome6 name="chevron-left" size={20} color="#ECEEDF" />
          </Pressable>
          <Text className="text-foreground font-semibold text-lg ml-2">
            서비스 이용약관
          </Text>
        </CleanHeader>
        <ScrollView className="flex-1 px-4 pt-4">
          <Text className="text-foreground">
            서비스 이용약관 내용이 들어갈 자리입니다.
          </Text>
        </ScrollView>
      </View>
    </AnimatedPageWrapper>
  );
}
