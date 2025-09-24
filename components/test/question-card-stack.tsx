import { Test } from "@/lib/types";
import { useTestStore } from "@/stores/test-store";
import { FontAwesome6 } from "@expo/vector-icons";
import { useEffect } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import QuestionCard from "./question-card";

export default function QuestionCardStack({ test }: { test: Test }) {
  const animatedCurrentQuestionIndex = useSharedValue(
    test.currentQuestionIndex
  );
  const { goPrev, goNext } = useTestStore();

  useEffect(() => {
    const unsub = useTestStore.subscribe((s) => {
      const currentQuestionIndex =
        s.tests.find((t) => t.id === test.id)?.currentQuestionIndex ?? 0;
      if (currentQuestionIndex >= 0) {
        animatedCurrentQuestionIndex.value = withTiming(currentQuestionIndex, {
          duration: 500,
        });
      }
    });
    return () => {
      unsub();
    };
  }, [animatedCurrentQuestionIndex, test.id]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedCurrentQuestionIndex.value,
      [0, test.questions.length],
      [1, 0]
    );
    return {
      opacity,
    };
  });

  return (
    <View className="flex flex-col justify-center items-center relative mb-16 w-[90vw] max-w-[480px]">
      <View
        className={`${Platform.OS === "web" ? "h-[360px]" : "h-[300px]"} w-full flex flex-row items-center`}
      >
        {test.questions.map((question, index) => {
          return (
            <QuestionCard
              key={question.content}
              test={test}
              index={index}
              animatedCurrentQuestionIndex={animatedCurrentQuestionIndex}
            />
          );
        })}
        {test.currentQuestionIndex === test.questions.length && (
          <View className="flex-1 flex justify-center items-center"></View>
        )}
      </View>
      <Animated.View
        className="w-full flex flex-row gap-4 "
        style={animatedStyle}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          className={`flex-1 h-16 rounded-full items-center justify-center bg-foreground gap-2 flex flex-row px-6 ${
            test.currentQuestionIndex > 0 ? "opacity-100" : "opacity-30"
          }`}
          onPress={() => {
            goPrev({ id: test.id });
          }}
          disabled={test.currentQuestionIndex <= 0}
        >
          <FontAwesome6 name="arrow-left" size={14} color="#222" />
          <Text className={`font-semibold text-xl text-background`}>이전</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          className={`bg-foreground flex-1 h-16 rounded-full items-center justify-center gap-2 flex flex-row px-6 ${
            test.currentQuestionIndex < test.progressIndex
              ? "opacity-100"
              : "opacity-30"
          }`}
          onPress={() => {
            goNext({ id: test.id });
          }}
          disabled={test.currentQuestionIndex >= test.progressIndex}
        >
          <Text className={`font-semibold text-xl text-background`}>다음</Text>
          <FontAwesome6 name="arrow-right" size={14} color="#222" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
