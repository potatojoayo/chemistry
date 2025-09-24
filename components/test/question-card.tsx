import { Test, useTestStore } from "@/stores/test-store";
import { useCallback } from "react";
import { Platform, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import QuestionSelection from "./question-selection";

export default function QuestionCard({
  test,
  index,
  animatedCurrentQuestionIndex,
}: {
  test: Test;
  index: number;
  animatedCurrentQuestionIndex: SharedValue<number>;
}) {
  const { answerToQuestion } = useTestStore();

  const handleAnswer = useCallback(
    (answer: number) => {
      answerToQuestion({
        id: test.id,
        index,
        answer,
      });
    },
    [answerToQuestion, index, test.id]
  );
  const { width } = useWindowDimensions();

  const animatedStyle = useAnimatedStyle(() => {
    const diff = animatedCurrentQuestionIndex.value - index;

    // diff == 0: 현재 카드
    // diff < 0: 뒤 카드
    // diff > 0: 앞 카드

    const translateY = interpolate(diff, [-1, 0], [-20, 0]);
    const scale = interpolate(diff, [-1, 0], [0.9, 1]);
    const zIndex = test.questions.length - index;
    const opacity = interpolate(diff, [-3, -2, -1, 0], [0, 1, 1, 1]);
    const translateX = interpolate(
      diff,
      [0, 1],
      [0, -width],
      Extrapolation.CLAMP
    );
    const rotate = interpolate(diff, [0, 1], [0, -20], Extrapolation.CLAMP);

    return {
      transform: [
        { translateY },
        { scale },
        { translateX },
        { rotate: `${rotate}deg` },
      ],
      zIndex,
      opacity,
    };
  });

  return (
    // <GestureDetector gesture={pan}>
    <Animated.View
      className={`w-full rounded-2xl bg-foreground p-4 absolute ${Platform.OS === "web" ? "h-[300px]" : "h-[260px]"} border`}
      style={animatedStyle}
    >
      <Text className="text-background font-semibold">{test.name}</Text>
      <View className="border-t border-background w-full mt-1"></View>
      <Text className="text-background mt-12 text-2xl text-center font-medium">
        {test.questions[index].content}
      </Text>
      <View className="mt-10 flex flex-row items-center justify-center gap-4">
        <QuestionSelection
          label="전혀\n아니다"
          color="negative"
          selected={test.questions[index].answer === 1}
          size="lg"
          onPress={() => {
            handleAnswer(1);
          }}
        />
        <QuestionSelection
          label="아니다"
          color="negative"
          selected={test.questions[index].answer === 2}
          size="md"
          onPress={() => {
            handleAnswer(2);
          }}
        />
        <QuestionSelection
          label="보통이다"
          color="neutral"
          selected={test.questions[index].answer === 3}
          size="sm"
          onPress={() => {
            handleAnswer(3);
          }}
        />
        <QuestionSelection
          label="그렇다"
          color="positive"
          selected={test.questions[index].answer === 4}
          size="md"
          onPress={() => {
            handleAnswer(4);
          }}
        />
        <QuestionSelection
          label="매우\n그렇다"
          color="positive"
          selected={test.questions[index].answer === 5}
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
