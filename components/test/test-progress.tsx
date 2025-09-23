import { useEffect } from "react";
import { Platform, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function TestProgress({
  currentIndex,
  totalCount,
}: {
  currentIndex: number;
  totalCount: number;
}) {
  const progress = Math.round((currentIndex / totalCount) * 100);
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
          className={`${currentIndex === 0 ? "text-foreground" : "text-green"} font-semibold ${Platform.OS === "ios" ? "text-lg" : "text-base"}`}
        >
          {progress}%
        </Text>
        <View className="flex-1 h-2 bg-foreground rounded-full overflow-hidden">
          <Animated.View
            className="h-full bg-green rounded-full"
            style={animatedStyle}
          />
        </View>
      </View>
    </View>
  );
}
