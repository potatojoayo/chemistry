import { Text, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function QuestionCard({
  question,
  index,
  totalCount,
  showCount,
  testName,
  currentIndex,
  animatedValue,
  setCurrentIndex,
}: {
  question: string;
  index: number;
  totalCount: number;
  showCount: number;
  testName: string;
  currentIndex: number;
  animatedValue: SharedValue<number>;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const direction = useSharedValue(0);
  const pan = Gesture.Pan()
    .onUpdate((event) => {
      const isSwipedRight = event.translationX > 0;
      direction.value = isSwipedRight ? 1 : -1;
      if (index === currentIndex) {
        translateX.value = event.translationX;
        animatedValue.value = interpolate(
          Math.abs(event.translationX),
          [0, width],
          [index, index + 1]
        );
      }
    })
    .onEnd((e) => {
      if (index === currentIndex) {
        if (Math.abs(e.translationX) > 150 || Math.abs(e.velocityX) > 1000) {
          translateX.value = withTiming(
            width * 1.1 * direction.value,
            {},
            () => {
              runOnJS(setCurrentIndex)(currentIndex + 1);
            }
          );
          animatedValue.value = withTiming(currentIndex + 1);
        } else {
          translateX.value = withTiming(0, { duration: 500 });
        }
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const isCurrent = index === currentIndex;
    const rotateZ = interpolate(
      Math.abs(translateX.value),
      [0, width],
      [0, 20]
    );

    const translateY = interpolate(
      animatedValue.value,
      [index - 1, index],
      [-20, 0]
    );

    const scale = interpolate(
      animatedValue.value,
      [index - 1, index],
      [0.9, 1]
    );

    const opacity = interpolate(
      animatedValue.value + showCount,
      [index, index + 1],
      [0, 1]
    );

    return {
      zIndex: totalCount - index,
      transform: [
        {
          scale: isCurrent ? scale : scale,
        },
        { translateY: isCurrent ? 0 : translateY },
        { translateX: translateX.value },
        { rotateZ: isCurrent ? `${direction.value * rotateZ}deg` : "0deg" },
      ],
      opacity: index < showCount + currentIndex ? 1 : opacity,
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        className="w-full rounded-xl bg-foreground p-4 absolute h-64"
        style={animatedStyle}
      >
        <View className="border-t border-background w-full"></View>
        <Text className="text-background font-bold">{testName}</Text>
        <Text className="text-background mt-8 text-2xl text-center">
          {question}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}
