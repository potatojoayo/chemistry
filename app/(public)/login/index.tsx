import { useAuthStore } from "@/stores/auth-store";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Login() {
  const imageFadeAnim = useState(new Animated.Value(0))[0];
  const imageTranslateY = useState(new Animated.Value(16))[0]; // 오른쪽에서 시작
  const imageScale = useState(new Animated.Value(0.8))[0]; // 작게 시작
  const buttonFadeAnim = useState(new Animated.Value(0))[0];
  const { bottom } = useSafeAreaInsets();
  const { redirectPath } = useAuthStore();

  const handleLogin = () => {
    router.push("/login/mobile");
  };

  useEffect(() => {
    console.log("redirectPath", redirectPath);
  }, [redirectPath]);

  // 즉시 UI 표시를 위한 초기 애니메이션
  useEffect(() => {
    // 즉시 이미지와 버튼을 표시
    Animated.parallel([
      Animated.timing(imageFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(imageTranslateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(imageScale, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(buttonFadeAnim, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
    ]).start();
  }, [imageFadeAnim, imageTranslateY, imageScale, buttonFadeAnim]);

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 relative bg-background max-w-5xl mx-auto w-full text-foreground">
        <View className="absolute inset-0 flex flex-col items-center mt-40 ">
          <Animated.View
            className="flex flex-col items-center justify-center px-4"
            style={{
              opacity: imageFadeAnim,
              transform: [
                { translateY: imageTranslateY },
                { scale: imageScale },
              ],
            }}
          >
            <Image
              source={require("../../../assets/images/logo-foreground.png")}
              resizeMode="contain"
              className="mx-auto"
              style={{ width: 320, height: 48 }}
            />
            <Text
              className={`text-foreground text-center mt-12 leading-snug max-w-lg w/full font-bold ${
                Platform.OS === "web" ? "text-2xl" : "text-3xl"
              }`}
            >
              “인간의 모든 문제는{"\n"}관계의 문제다.”
            </Text>
            <Text
              className={`text-foreground mt-1 text-center font-regular ${
                Platform.OS === "web" ? "text-base" : "text-xl"
              }`}
            >
              — 알프레드 아들러
            </Text>
          </Animated.View>
          <View
            className="mt-auto"
            style={{
              paddingBottom: bottom + 40,
              maxWidth: 400,
              paddingHorizontal: 20,
              width: "100%",
              marginHorizontal: "auto",
            }}
          >
            <Animated.View style={{ opacity: buttonFadeAnim }}>
              <View className="w-full px-4">
                <TouchableOpacity
                  className="w-full bg-foreground py-4 px-16 rounded-full"
                  onPress={handleLogin}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`text-center text-background font-semibold text-base`}
                  >
                    전화번호로 계속하기
                  </Text>
                </TouchableOpacity>
              </View>
              <Text
                className={`text-center font-regular text-foreground mt-8 px-10 text-sm`}
              >
                회원가입 시{" "}
                <Text
                  className="underline text-foreground"
                  onPress={() => Linking.openURL("https://google.com")}
                >
                  서비스 이용약관
                </Text>
                에 동의하신 것으로 간주합니다. 회원 데이터를 어떻게 활용하는지{" "}
                <Text
                  className="underline text-foreground"
                  onPress={() => Linking.openURL("https://google.com")}
                >
                  개인정보 처리방침
                </Text>
                에서 확인해보세요.
              </Text>
            </Animated.View>
          </View>
        </View>
      </View>
    </View>
  );
}
