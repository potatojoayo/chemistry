import { Test } from "@/lib/types";
import { View } from "react-native";
import QuestionCardStack from "./question-card-stack";
import TestProgress from "./test-progress";

export default function TestPageContent({
  test,
  paddingTop,
}: {
  test: Test;
  paddingTop: number;
}) {
  return (
    <View
      className="flex-1 flex flex-col items-center justify-between max-w-xl w-full mx-auto"
      style={{
        paddingTop: paddingTop,
      }}
    >
      <TestProgress test={test}></TestProgress>
      <QuestionCardStack test={test}></QuestionCardStack>
      <View className="h-20"></View>
    </View>
  );
}
