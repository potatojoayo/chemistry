import CleanHeader from "@/components/common/clean-header";
import { useSnackbar } from "@/context/snackbar-context";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import { FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function NicknameSettings() {
  const { profile, fetchProfile } = useAuthStore();
  const [nickname, setNickname] = useState(profile?.nickname || "");
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();

  const handleSave = async () => {
    if (!profile || nickname.length < 2) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ nickname })
        .eq("id", profile.id);

      if (error) throw error;

      await fetchProfile();
      showSnackbar({ message: "닉네임이 변경되었습니다." });
      router.back();
    } catch (error) {
      console.error("Nickname update error:", error);
      showSnackbar({ message: "닉네임 변경 중 오류가 발생했습니다." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <CleanHeader>
        <Pressable onPress={() => router.back()}>
          <FontAwesome6 name="chevron-left" size={20} color="#ECEEDF" />
        </Pressable>
        <Text className="text-foreground font-semibold text-lg mx-auto">
          닉네임 수정
        </Text>
        <View className="w-4"></View>
      </CleanHeader>

      <View className="flex-1 px-4 pt-48">
        <View>
          {/* <Text className="text-pastel-gray text-sm mb-2">닉네임</Text> */}
          <TextInput
            value={nickname}
            onChangeText={(text) => setNickname(text.slice(0, 10))}
            placeholder="닉네임을 입력해주세요"
            className="text-foreground text-2xl font-semibold"
            placeholderTextColor="#666"
            maxLength={10}
            autoFocus
          />
          <Text className="text-right text-pastel-gray mt-2 text-xs">
            {nickname.length}/10
          </Text>
        </View>

        <TouchableOpacity
          className={`bg-foreground rounded-full h-14 items-center justify-center mt-auto mb-8 ${
            nickname.length < 2 || loading ? "opacity-50" : "opacity-100"
          }`}
          disabled={nickname.length < 2 || loading}
          activeOpacity={0.7}
          onPress={handleSave}
        >
          {loading ? (
            <ActivityIndicator color="#222" />
          ) : (
            <Text className="text-background text-base font-bold">
              저장하기
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
