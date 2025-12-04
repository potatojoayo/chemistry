import AnimatedPageWrapper from "@/components/common/animated-page-wrapper";
import { useSnackbar } from "@/context/snackbar-context";
import { formatPhoneNumber } from "@/lib/formatters";
import { supabase } from "@/lib/supabase";
import { FontAwesome6 } from "@expo/vector-icons";
import { RelativePathString, router } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated from "react-native-reanimated";

export default function Register() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();
  const inputRef = useRef<TextInput>(null);

  const handlePhoneNumberChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  const handleSendVerificationCode = async () => {
    if (loading) return;
    setLoading(true);

    // Optimistic Navigation: API 응답을 기다리지 않고 즉시 이동
    // 이는 iOS Safari에서 async 작업 후의 navigation을 programmatic으로 간주하여
    // 다음 화면의 autoFocus를 차단하는 것을 방지하기 위함입니다.
    router.push(("/login/verify?phone=" + phoneNumber) as RelativePathString);

    const { error } = await supabase.auth.signInWithOtp({
      phone: "+82" + phoneNumber.slice(1).replaceAll("-", ""),
    });

    if (error) {
      console.log(error);
      // 실패 시 다시 돌아옴
      router.back();

      if (error.message.includes("Max send attempts reached")) {
        showSnackbar({
          message:
            "인증번호 전송 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.",
        });
      } else {
        showSnackbar({
          message: "인증번호 전송에 실패했습니다. 다시 시도해주세요.",
        });
      }
    }
    setLoading(false);
  };

  return (
    <AnimatedPageWrapper>
      <View className="flex-1">
        <TouchableWithoutFeedback>
          <View className="flex-1 flex-col">
            <View className="flex flex-row justify-between h-12">
              <Pressable onPress={() => router.back()} className="p-3 w-fit">
                <FontAwesome6 name="chevron-left" size={20} color="#ECEEDF" />
              </Pressable>
            </View>
            <View className="flex flex-col p-3 pt-0 flex-1">
              <Text className="text-foreground  text-2xl font-semibold">
                전화번호를 입력해주세요
              </Text>
              <Text className="mt-1 text-pastel-gray font-medium ">
                안전을 위해 계정 확인이 필요해요
              </Text>
              <View className="mt-10">
                <TextInput
                  ref={inputRef}
                  value={phoneNumber}
                  onChangeText={handlePhoneNumberChange}
                  placeholder="010-0000-0000"
                  style={{
                    fontSize: 32,
                    color: "#ECEEDF",
                    fontWeight: "bold",
                    textAlign: "left",
                    width: "100%",
                    outline: "none",
                  }}
                  autoFocus
                  placeholderTextColor="#666"
                  keyboardType="phone-pad"
                  maxLength={13} // 010-0000-0000 (13자리)
                  selectionColor="#ECEEDF"
                  underlineColorAndroid="transparent"
                />
              </View>
              <Animated.View
                style={[
                  {
                    marginTop: "auto",
                    paddingHorizontal: 16,
                    marginBottom: 16,
                  },
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
          </View>
        </TouchableWithoutFeedback>
      </View>
    </AnimatedPageWrapper>
  );
}
