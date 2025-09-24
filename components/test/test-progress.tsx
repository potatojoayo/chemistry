import { Test } from "@/lib/types";
import { useEffect } from "react";
import { Platform, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function TestProgress({ test }: { test: Test }) {
  const progress = Math.round(
    (test.currentQuestionIndex / test.questions.length) * 100
  );
  const animatedProgress = useSharedValue(progress);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 500 });
  }, [progress, animatedProgress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedProgress.value}%`,
    };
  });

  return (
    <View className="px-6 w-full">
      {/* 퍼센트 텍스트와 진행률 바 */}
      <View className="flex-row items-center gap-3">
        <Text
          className={`${test.currentQuestionIndex === 0 ? "text-foreground" : "text-green"} font-semibold ${Platform.OS === "web" ? "text-base" : "text-lg"}`}
        >
          {progress}%
        </Text>
        <View className="flex-1 h-2 bg-foreground rounded-full overflow-hidden">
          <Animated.View
            className="h-full  rounded-full bg-green"
            style={animatedStyle}
          />
        </View>
      </View>
    </View>
  );
}
