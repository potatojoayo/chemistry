import { Test, useTestStore } from "@/stores/test-store";
import { useCallback } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import QuestionSelection from "./question-selection";

export default function QuestionCard({
  test,
  index,
  showCount,
  currentIndex,
  animatedValue,
  setCurrentIndex,
}: {
  test: Test;
  index: number;
  showCount: number;
  currentIndex: number;
  animatedValue: SharedValue<number>;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { setAnswer, setCurrentQuestionIndex } = useTestStore();
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
      zIndex: test.questions.length - index,
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

  const handleAnswer = useCallback(
    (answer: number) => {
      setAnswer({ id: test.id, index, answer });
      setCurrentQuestionIndex({ id: test.id, index: currentIndex + 1 });

      translateX.value = withTiming(width * 1.1 * -1, {}, () => {
        runOnJS(setCurrentIndex)(currentIndex + 1);
      });
      animatedValue.value = withTiming(currentIndex + 1);
    },
    [
      test.id,
      index,
      currentIndex,
      setAnswer,
      setCurrentQuestionIndex,
      animatedValue,
      setCurrentIndex,
      translateX,
      width,
    ]
  );

  return (
    // <GestureDetector gesture={pan}>
    <Animated.View
      className="w-full rounded-xl bg-foreground p-4 absolute h-72"
      style={animatedStyle}
    >
      <View className="border-t border-background w-full"></View>
      <Text className="text-background font-bold">{test.name}</Text>
      <Text className="text-background mt-8 text-2xl text-center font-medium ">
        {test.questions[index].content}
      </Text>
      <View className="mt-10 flex flex-row items-center justify-center gap-4">
        <QuestionSelection
          label="전혀\n그렇지않다"
          color="negative"
          size="lg"
          onPress={() => {
            handleAnswer(1);
          }}
        />
        <QuestionSelection
          label="그렇지않다"
          color="negative"
          size="md"
          onPress={() => {
            handleAnswer(2);
          }}
        />
        <QuestionSelection
          label="보통이다"
          color="neutral"
          size="sm"
          onPress={() => {
            handleAnswer(3);
          }}
        />
        <QuestionSelection
          label="그렇다"
          color="positive"
          size="md"
          onPress={() => {
            handleAnswer(4);
          }}
        />
        <QuestionSelection
          label="매우\n그렇다"
          color="positive"
          size="lg"
          onPress={() => {
            handleAnswer(5);
          }}
        />
      </View>
    </Animated.View>
    // </GestureDetector>
  );
}
