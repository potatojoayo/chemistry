import { useState } from "react";
import { View } from "react-native";
import QuestionCardStack from "./question-card-stack";
import TestProgress from "./test-progress";

export default function TestPageContent({
  questions,
}: {
  questions: string[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  return (
    <View className="flex-1 flex flex-col items-center justify-between">
      <TestProgress
        currentIndex={currentIndex}
        totalCount={questions.length}
      ></TestProgress>
      <QuestionCardStack
        questions={questions}
        testName="BIG 5"
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
      ></QuestionCardStack>
      <View className="h-20"></View>
    </View>
  );
}
