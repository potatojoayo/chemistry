import AnimatedPageWrapper from "@/components/common/animated-page-wrapper";
import { formatPhoneNumber } from "@/lib/formatters";
import { FontAwesome6 } from "@expo/vector-icons";
import { RelativePathString, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Register() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePhoneNumberChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  const handleSendVerificationCode = async () => {
    if (loading) return;
    setLoading(true);
    // await supabase.auth.signInWithOtp({
    //   phone: phoneNumber,
    // });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push(("/login/verify?phone=" + phoneNumber) as RelativePathString);
  };

  return (
    <AnimatedPageWrapper>
      <View className="flex flex-col p-3 flex-1">
        <Pressable onPress={() => router.replace("/login")}>
          <FontAwesome6 name="chevron-left" size={20} color="#ECEEDF" />
        </Pressable>
        <Text className="text-foreground  text-2xl font-semibold mt-4">
          전화번호를 입력해주세요
        </Text>
        <Text className="mt-1 text-gray font-medium text-base">
          안전을 위해 계정 확인이 필요해요
        </Text>
        <View className="mt-10">
          <TextInput
            value={phoneNumber}
            onChangeText={handlePhoneNumberChange}
            placeholder="010-0000-0000"
            autoFocus
            className="text-4xl text-foreground focus:outline-none font-bold"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
            maxLength={13} // 010-0000-0000 (13자리)
          />
        </View>
        <View className="mt-auto px-4 mb-4">
          <TouchableOpacity
            className={`bg-foreground rounded-full h-14 items-center justify-center ${phoneNumber.length !== 13 ? "opacity-50" : "opacity-100"} ${loading ? "opacity-50" : "opacity-100"}`}
            disabled={phoneNumber.length !== 13 ? true || loading : false}
            activeOpacity={0.7}
            onPress={handleSendVerificationCode}
          >
            {loading ? (
              <ActivityIndicator color="#222" />
            ) : (
              <Text className="text-background text-base font-bold text-center">
                인증번호 받기
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </AnimatedPageWrapper>
  );
}
