import { useEffect, useRef } from "react";
import { Animated, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AnimatedPageWrapperProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  fromDirection?: "left" | "right" | "bottom";
}

export default function AnimatedPageWrapper({
  children,
  duration = 300,
  delay = 0,
  fromDirection = "bottom",
}: AnimatedPageWrapperProps) {
  const fadeAnim = useRef(new Animated.Value(0.5)).current;
  const translateAnim = useRef(
    new Animated.Value(
      fromDirection === "right" ? 10 : fromDirection === "left" ? -10 : 4
    )
  ).current;
  const { top, bottom } = useSafeAreaInsets();

  useEffect(() => {
    // 웹에서만 애니메이션 실행
    if (Platform.OS === "web") {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [fadeAnim, translateAnim, duration, delay]);

  // 모바일에서는 바로 children 반환
  if (Platform.OS !== "web") {
    return (
      <View
        className="flex-1 bg-background"
        style={{ paddingTop: top, paddingBottom: bottom }}
      >
        {children}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Animated.View
        style={{
          height: "100%",
          opacity: fadeAnim,
          paddingTop: top,
          paddingBottom: bottom,
          transform: [
            fromDirection === "bottom"
              ? { translateY: translateAnim }
              : fromDirection === "left"
                ? { translateX: translateAnim }
                : { translateX: translateAnim },
          ],
        }}
      >
        {children}
      </Animated.View>
    </View>
  );
}
