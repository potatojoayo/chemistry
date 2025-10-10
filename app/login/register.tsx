import AnimatedPageWrapper from "@/components/common/animated-page-wrapper";
import { formatPhoneNumber } from "@/lib/formatters";
import { FontAwesome6 } from "@expo/vector-icons";
import { RelativePathString, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

export default function Register() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const translateY = useSharedValue(0);

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
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  useKeyboardHandler({
    onStart: (e) => {
      "worklet";
      translateY.value = -e.height;
    },
    onMove: (e) => {
      "worklet";
      translateY.value = -e.height;
    },
    onEnd: (e) => {
      "worklet";
      translateY.value = -e.height;
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      paddingBottom: -translateY.value - 40,
    };
  });

  return (
    <AnimatedPageWrapper>
      <View className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={false}
        >
          <TouchableWithoutFeedback>
            <View className="flex flex-col p-3 flex-1">
              <Pressable onPress={() => router.back()}>
                <FontAwesome6 name="chevron-left" size={20} color="#ECEEDF" />
              </Pressable>
              <Text className="text-foreground  text-3xl font-semibold mt-4">
                전화번호를 입력해주세요
              </Text>
              <Text className="mt-1 text-gray font-medium text-lg">
                안전을 위해 계정 확인이 필요해요
              </Text>
              <View className="mt-10">
                <TextInput
                  value={phoneNumber}
                  onChangeText={handlePhoneNumberChange}
                  placeholder="010-0000-0000"
                  style={{
                    fontSize: 40,
                    color: "#ECEEDF",
                    fontWeight: "bold",
                    textAlign: "left",
                    width: "100%",
                  }}
                  autoFocus
                  placeholderTextColor="#666"
                  keyboardType="phone-pad"
                  maxLength={13} // 010-0000-0000 (13자리)
                  selectionColor="#ECEEDF"
                />
              </View>
              <Animated.View
                style={[
                  {
                    marginTop: "auto",
                    paddingHorizontal: 16,
                    marginBottom: 16,
                  },
                  animatedStyle,
                ]}
              >
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
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </View>
    </AnimatedPageWrapper>
  );
}
