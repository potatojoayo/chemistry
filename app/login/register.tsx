import AnimatedPageWrapper from "@/components/common/animated-page-wrapper";
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
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Snackbar } from "react-native-paper";
import Animated from "react-native-reanimated";

export default function Register() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const inputRef = useRef<TextInput>(null);

  const handlePhoneNumberChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  const handleSendVerificationCode = async () => {
    if (loading) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: "+82" + phoneNumber.slice(1).replaceAll("-", ""),
    });
    if (error) {
      console.log(error);
      if (error.message.includes("Max send attempts reached")) {
        setSnackbarMessage(
          "인증번호 전송 횟수를 초과했습니다. 잠시 후 다시 시도해주세요."
        );
      } else {
        setSnackbarMessage("인증번호 전송에 실패했습니다. 다시 시도해주세요.");
      }
      setSnackbarVisible(true);
      setLoading(false);
      return;
    }
    router.push(("/login/verify?phone=" + phoneNumber) as RelativePathString);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
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

              <Pressable
                className="p-3 w-fit"
                disabled={phoneNumber.length !== 13 || loading}
                onPress={() => {
                  handleSendVerificationCode();
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#5AAEFF" size={22} />
                ) : (
                  <Text
                    className={`font-medium text-lg ${
                      phoneNumber.length === 13
                        ? "text-blue-500"
                        : "text-blue-500/50"
                    }`}
                  >
                    다음
                  </Text>
                )}
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
                  onBlur={() => {
                    // focus가 해제되면 즉시 다시 focus
                    setTimeout(() => {
                      inputRef.current?.focus();
                    }, 0);
                  }}
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
                {/* <TouchableOpacity
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
                </TouchableOpacity> */}
              </Animated.View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => {
          setSnackbarVisible(false);
        }}
      >
        <View className="flex flex-row items-center justify-between">
          <Text className="text-foreground text-sm font-medium">
            {snackbarMessage}
          </Text>
          <Pressable
            onPress={() => setSnackbarVisible(false)}
            className="bg-foreground rounded-full px-4 py-2"
          >
            <Text className="text-background text-xs font-semibold">확인</Text>
          </Pressable>
        </View>
      </Snackbar>
    </AnimatedPageWrapper>
  );
}
