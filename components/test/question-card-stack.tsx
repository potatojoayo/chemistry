import { Test, useTestStore } from "@/stores/test-store";
import { FontAwesome6 } from "@expo/vector-icons";
import { useEffect } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
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
      </View>
      <View className="w-full flex flex-row gap-4">
        <TouchableOpacity
          activeOpacity={0.7}
          className={`flex-1 h-16 rounded-full items-center justify-center gap-2 flex flex-row px-6 ${
            test.currentQuestionIndex > 0 ? "bg-foreground" : "bg-gray"
          }`}
          onPress={() => {
            goPrev({ id: test.id });
          }}
          disabled={test.currentQuestionIndex <= 0}
        >
          <FontAwesome6
            name="arrow-left"
            size={14}
            color={test.currentQuestionIndex > 0 ? "#222" : "#666"}
          />
          <Text
            className={`font-semibold text-xl ${
              test.currentQuestionIndex > 0 ? "text-background" : "text-muted"
            }`}
          >
            이전
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          className={`flex-1 h-16 rounded-full items-center justify-center gap-2 flex flex-row px-6 ${
            test.currentQuestionIndex < test.progressIndex
              ? "bg-foreground"
              : "bg-gray"
          }`}
          onPress={() => {
            goNext({ id: test.id });
          }}
          disabled={test.currentQuestionIndex >= test.progressIndex}
        >
          <Text
            className={`font-semibold text-xl ${
              test.currentQuestionIndex < test.progressIndex
                ? "text-background"
                : "text-muted"
            }`}
          >
            다음
          </Text>
          <FontAwesome6
            name="arrow-right"
            size={14}
            color={
              test.currentQuestionIndex < test.progressIndex ? "#222" : "#666"
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
