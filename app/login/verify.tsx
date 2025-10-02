import AnimatedPageWrapper from "@/components/common/animated-page-wrapper";
import { formatPhoneNumber } from "@/lib/formatters";
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
  View,
} from "react-native";
import { Snackbar } from "react-native-paper";

export default function Verify() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5분 = 300초
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // 카운트다운 타이머
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleCodeChange = (text: string) => {
    const numbersOnly = text.replace(/[^0-9]/g, "");
    const newToken = numbersOnly.slice(0, 6); // 6자리로 제한
    setToken(newToken);

    // 6자리가 모두 입력되면 자동으로 인증 시도
    if (newToken.length === 6) {
      handleVerify();
    }
  };

  const handleVerify = async () => {
    if (loading) return;
    if (!phone) return;
    setLoading(true);
    // await supabase.auth.verifyOtp({
    //   phone,
    //   token,
    //   type: "sms",
    // });
  };

  const handleResendCode = async () => {
    if (loading) return;
    if (!phone) return;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // await supabase.auth.signInWithOtp({
    //   phone,
    // });
    setSnackbarVisible(true);
    setLoading(false);
  };

  return (
    <AnimatedPageWrapper>
      <View className="flex flex-col p-3 flex-1">
        <Pressable onPress={() => router.back()}>
          <FontAwesome6 name="chevron-left" size={20} color="#ECEEDF" />
        </Pressable>

        <Text className="text-foreground text-2xl font-bold mt-4">
          {formatPhoneNumber(phone || "")}
        </Text>
        <Text className="text-foreground text-xl font-semibold mt-1">
          전송된 인증번호를 입력해주세요
        </Text>

        {/* 6개의 인증번호 입력 박스 */}
        <View className="flex-row justify-center mt-10 gap-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Pressable
              key={index}
              className={`w-12 h-12 rounded-xl border-2 items-center justify-center ${
                index === token.length
                  ? "border-blue bg-blue/10"
                  : "border-gray bg-gray/10"
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
          className="absolute w-0 h-0 opacity-0"
        />

        {/* 카운트다운 타이머 */}
        <Text className="text-gray text-sm mt-6 text-center">
          {formatTime(timeLeft)}
        </Text>

        {/* 인증번호를 받지 못하셨나요? 버튼 */}
        <TouchableOpacity
          className="mt-auto mb-8 self-center"
          onPress={handleResendCode}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#ECEEDF" />
          ) : (
            <Text className="text-gray text-sm">
              인증번호를 받지 못하셨나요?
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => {
          setSnackbarVisible(false);
        }}
      >
        <View className="flex flex-row items-center justify-between">
          <Text className="text-foreground text-sm font-medium">
            인증번호가 재전송되었어요.
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
