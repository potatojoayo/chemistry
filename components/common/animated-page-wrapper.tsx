import { useEffect, useRef } from "react";
import { Animated, Platform, View } from "react-native";

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
    } else {
      // 모바일에서는 즉시 최종 상태로 설정
      fadeAnim.setValue(1);
      translateAnim.setValue(0);
    }
  }, [fadeAnim, translateAnim, duration, delay]);

  return (
    <View className="flex-1 bg-background">
      <Animated.View
        style={{
          height: "100%",
          opacity: fadeAnim,
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
