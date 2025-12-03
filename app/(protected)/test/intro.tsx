import AnimatedPageWrapper from "@/components/common/animated-page-wrapper";
import { useAuthStore } from "@/stores/auth-store";
import { FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated from "react-native-reanimated";

export default function Test() {
  const { signOut, profile } = useAuthStore();

  const handleStartTest = () => {
    if (profile?.test_completed) {
      router.push("/");
      return;
    }
    router.push(`/test`);
  };

  return (
    <AnimatedPageWrapper>
      <View className="flex-1">
        <TouchableWithoutFeedback>
          <View className="flex-1 flex-col">
            <View className="flex flex-row justify-between h-12">
              <View className="p-3">
                {/* <Image
                  source={require("../../assets/images/logo-foreground.png")}
                  style={{ height: 36, width: 120 }}
                  resizeMode="contain"
                /> */}
              </View>
              <Pressable onPress={signOut} className="p-3 w-fit">
                <FontAwesome6
                  name="arrow-right-from-bracket"
                  size={20}
                  color="#ECEEDF"
                />
              </Pressable>
            </View>
            <View className="flex flex-col p-3  flex-1">
              <Text className="text-foreground  text-2xl font-semibold">
                연애할 때의 나는, 어떤 사람일까?
              </Text>
              <Text className="mt-3 text-pastel-gray font-medium leading-5">
                사랑할 때의 당신을 객관적으로 들여다보는 시간이에요. <br />
                솔직하게 답할수록, 당신에 대한 그림이 또렷해집니다.
              </Text>
              <Image
                source={require("../../../assets/images/curious.png")}
                style={{ width: 280, height: 280, margin: "auto" }}
                resizeMode="contain"
              />

              <Animated.View
                style={[
                  {
                    marginTop: "auto",
                    paddingHorizontal: 12,
                    marginBottom: 12,
                  },
                ]}
              >
                <TouchableOpacity
                  className={`bg-foreground rounded-full h-14 items-center justify-center`}
                  activeOpacity={0.7}
                  onPress={handleStartTest}
                >
                  <Text className="text-background text-base font-semibold text-center">
                    테스트 시작하기
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </AnimatedPageWrapper>
  );
}
