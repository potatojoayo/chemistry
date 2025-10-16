import AnimatedPageWrapper from "@/components/common/animated-page-wrapper";
import { formatPhoneNumber } from "@/lib/formatters";
import { supabase } from "@/lib/supabase";
import { FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Snackbar } from "react-native-paper";
import Animated from "react-native-reanimated";

export default function Verify() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5분 = 300초
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const inputRef = useRef<TextInput>(null);

  // 카운트다운 타이머
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // 6자리 입력 완료 시 자동 인증
  useEffect(() => {
    const handleVerify = async () => {
      if (loading) return;
      if (!phone) return;
      setLoading(true);
      const {
        data: { session },
        error,
      } = await supabase.auth.verifyOtp({
        phone: "+82" + phone.slice(1).replaceAll("-", ""),
        token,
        type: "sms",
      });
      if (error) {
        console.log(error);
        setSnackbarMessage("인증번호가 올바르지 않습니다.");
        setSnackbarVisible(true);
        setLoading(false);
        setToken("");
        return;
      }
      if (session) {
        router.push("/(app)" as any);
      }
    };
    if (token.length === 6 && !loading) {
      handleVerify();
    }
  }, [token, loading, phone]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleCodeChange = (text: string) => {
    const numbersOnly = text.replace(/[^0-9]/g, "");
    const newToken = numbersOnly.slice(0, 6); // 6자리로 제한
    setToken(newToken);
  };

  const handleResendCode = async () => {
    if (loading) return;
    if (!phone) return;
    setLoading(true);
    try {
      await supabase.auth.signInWithOtp({
        phone: "+82" + phone.slice(1).replaceAll("-", ""),
      });
      setSnackbarMessage("인증번호가 재전송되었어요.");
      setSnackbarVisible(true);
      setTimeLeft(300); // 타이머 리셋
    } catch (error) {
      console.log(error);
      setSnackbarMessage("인증번호 전송에 실패했습니다.");
      setSnackbarVisible(true);
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
            <View className="flex flex-col p-3 pt-0">
              <Text className="text-foreground  text-2xl font-semibold">
                인증번호를 입력해주세요
              </Text>
              <Text className="text-pastel-gray font-medium text-base mt-1">
                {formatPhoneNumber(phone || "")}로 전송했어요
              </Text>

              {/* 6개의 인증번호 입력 박스 */}
              <View className="flex-row justify-center mt-10 gap-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <Pressable
                    key={index}
                    className={`w-12 h-14 rounded-xl border-2 items-center justify-center ${
                      index === token.length
                        ? "border-pastel-blue bg-pastel-blue/10"
                        : "border-pastel-gray bg-pastel-gray/10"
                    }`}
                    onPress={() => inputRef.current?.focus()}
                  >
                    <Text className="text-foreground text-xl font-bold">
                      {token[index] || ""}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* 숨겨진 TextInput */}
              <TextInput
                ref={inputRef}
                value={token}
                onChangeText={handleCodeChange}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
                onBlur={() => {
                  // focus가 해제되면 즉시 다시 focus
                  setTimeout(() => {
                    inputRef.current?.focus();
                  }, 0);
                  console.log("blur");
                }}
                style={{
                  position: "absolute",
                  width: 1,
                  height: 1,
                  opacity: 0,
                }}
                selectionColor="#ECEEDF"
              />

              {/* 카운트다운 타이머 */}
              <Text className="text-pastel-gray text-base mt-6 text-center">
                {formatTime(timeLeft)}
              </Text>

              {/* 인증번호를 받지 못하셨나요? 버튼 */}
              <Animated.View
                style={[
                  {
                    marginTop: 20,
                    marginBottom: 32,
                    alignSelf: "center",
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={handleResendCode}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#ECEEDF" />
                  ) : (
                    <Text className="text-pastel-gray ">
                      인증번호를 받지 못하셨나요?
                    </Text>
                  )}
                </TouchableOpacity>
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
