import { Answer } from "@/models/answer";
import { Question } from "@/models/question";
import { useAuthStore } from "@/stores/auth-store";
import { useTestStore } from "@/stores/test-store";
import { FontAwesome6 } from "@expo/vector-icons";
import { useEffect } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import QuestionCard from "./question-card";

export default function QuestionCardStack({
  questions,
  answers,
  currentIndex,
}: {
  questions: Question[];
  answers: Answer[];
  currentIndex: number;
}) {
  const animatedCurrentQuestionIndex = useSharedValue(currentIndex);
  const { profile } = useAuthStore();

  useEffect(() => {
    const unsub = useTestStore.subscribe((state) => {
      const currentQuestionIndex = state.currentIndex ?? 0;
      if (currentQuestionIndex >= 0) {
        animatedCurrentQuestionIndex.value = withTiming(currentQuestionIndex, {
          duration: 500,
        });
      }
      if (currentQuestionIndex === questions.length) {
      }
    });
    return () => {
      unsub();
    };
  }, [animatedCurrentQuestionIndex, questions]);

  const { goPrev, goNext } = useTestStore();

  if (!profile) {
    return <View></View>;
  }

  return (
    <View className="flex flex-col justify-center items-center relative mb-16 w-[90vw] max-w-[480px]">
      <View className={`h-[20rem] w-full flex flex-row items-center`}>
        {questions.map((question, index) => {
          return (
            <QuestionCard
              key={question.id}
              question={question}
              totalCount={questions.length}
              index={index}
              animatedCurrentQuestionIndex={animatedCurrentQuestionIndex}
              answer={answers.find(
                (answer) => answer.question_id === question.id
              )}
            />
          );
        })}
        {currentIndex === questions.length && (
          <View className="flex-1 flex justify-center items-center">
            <ActivityIndicator size="large" color="#ECEEDF" />
          </View>
        )}
      </View>
      <Animated.View className="w-full flex flex-row gap-4 ">
        <TouchableOpacity
          activeOpacity={0.7}
          className={`flex-1 h-16 rounded-full items-center justify-center bg-foreground gap-2 flex flex-row px-6 ${
            currentIndex > 0 ? "opacity-100" : "opacity-30"
          }`}
          onPress={() => {
            goPrev();
          }}
          disabled={currentIndex <= 0}
        >
          <FontAwesome6 name="arrow-left" size={14} color="#222" />
          <Text className={`font-medium text-base text-background`}>이전</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          className={`bg-foreground flex-1 h-16 rounded-full items-center justify-center gap-2 flex flex-row px-6 ${
            currentIndex < profile.test_index ? "opacity-100" : "opacity-30"
          }`}
          onPress={() => {
            goNext();
          }}
          disabled={currentIndex >= profile.test_index}
        >
          <Text className={`font-medium text-base text-background`}>다음</Text>
          <FontAwesome6 name="arrow-right" size={14} color="#222" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
