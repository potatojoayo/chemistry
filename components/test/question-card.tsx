import { Answer } from "@/models/answer";
import { Question } from "@/models/question";
import { useAuthStore } from "@/stores/auth-store";
import { useTestStore } from "@/stores/test-store";
import { useCallback } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import QuestionSelection from "./question-selection";

export default function QuestionCard({
  question,
  totalCount,
  answer,
  index,
  animatedCurrentQuestionIndex,
}: {
  question: Question;
  totalCount: number;
  answer?: Answer;
  index: number;
  animatedCurrentQuestionIndex: SharedValue<number>;
}) {
  const { width } = useWindowDimensions();
  const { answerToQuestion } = useTestStore();
  const { profile } = useAuthStore();

  const handleAnswer = useCallback(
    (answer: number) => {
      if (!profile?.id) return;
      answerToQuestion({
        question_id: question.id,
        answer,
        profile_id: profile.id,
      });
    },
    [profile?.id, question.id, answerToQuestion]
  );

  const animatedStyle = useAnimatedStyle(() => {
    const diff = animatedCurrentQuestionIndex.value - index;

    // diff == 0: 현재 카드
    // diff < 0: 뒤 카드
    // diff > 0: 앞 카드

    const translateY = interpolate(diff, [-1, 0], [-24, 0]);
    const scale = interpolate(diff, [-1, 0], [0.9, 1]);
    const zIndex = totalCount - index;
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
      className={`w-full rounded-2xl bg-foreground p-4 absolute h-[17rem] border`}
      style={animatedStyle}
    >
      {/* <Text className="text-background font-semibold">{test.name}</Text> */}
      {/* <View className="border-t border-background w-full mt-1"></View> */}
      <View className=" h-32 items-center justify-center flex flex-row px-3">
        <Text className="text-background text-lg text-center font-medium">
          {question.content}
        </Text>
      </View>
      <View className=" flex flex-row items-center justify-around ">
        <QuestionSelection
          label="전혀\n아니다"
          color="negative"
          selected={answer?.answer === 1}
          size="lg"
          onPress={() => {
            handleAnswer(1);
          }}
        />
        <QuestionSelection
          label="아니다"
          color="negative"
          selected={answer?.answer === 2}
          size="md"
          onPress={() => {
            handleAnswer(2);
          }}
        />
        <QuestionSelection
          label="보통이다"
          color="neutral"
          selected={answer?.answer === 3}
          size="sm"
          onPress={() => {
            handleAnswer(3);
          }}
        />
        <QuestionSelection
          label="그렇다"
          color="positive"
          selected={answer?.answer === 4}
          size="md"
          onPress={() => {
            handleAnswer(4);
          }}
        />
        <QuestionSelection
          label="매우\n그렇다"
          color="positive"
          selected={answer?.answer === 5}
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
