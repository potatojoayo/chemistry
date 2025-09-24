import { Test, useTestStore } from "@/stores/test-store";
import { useState } from "react";
import { View } from "react-native";
import { useShallow } from "zustand/react/shallow";
import QuestionCardStack from "./question-card-stack";
import TestProgress from "./test-progress";

export default function TestPageContent({ test }: { test: Test }) {
  const currentQuestionIndex = useTestStore(
    useShallow(
      (state) => state.tests.find((t) => t.id === test.id)?.currentQuestionIndex
    )
  );
  const [currentIndex, setCurrentIndex] = useState(currentQuestionIndex ?? 0);
  if (currentQuestionIndex === undefined) {
    return null;
  }
  return (
    <View className="flex-1 flex flex-col items-center justify-between">
      <TestProgress
        currentIndex={currentIndex}
        totalCount={test.questions.length}
      ></TestProgress>
      <QuestionCardStack
        test={test}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
      ></QuestionCardStack>
      <View className="h-20"></View>
    </View>
  );
}
