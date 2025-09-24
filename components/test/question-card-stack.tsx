import { Test, useTestStore } from "@/stores/test-store";
import { FontAwesome6 } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import QuestionCard from "./question-card";

export default function QuestionCardStack({
  test,
  showCount = 3,
  currentIndex,
  setCurrentIndex,
}: {
  test: Test;
  showCount?: number;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const animatedValue = useSharedValue(currentIndex);
  const { tests } = useTestStore();
  const currentTest = tests.find((t) => t.id === test.id);
  const currentQuestionIndex = currentTest?.currentQuestionIndex ?? 0;
  return (
    <View className="flex flex-col justify-center items-center relative mb-16 w-[90vw] max-w-[800px]">
      <View className="h-[280px] w-full flex flex-row items-centerr">
        {test.questions.map((question, index) => {
          // if (index > currentIndex + showCount || index < currentIndex) {
          //   return null;
          // }
          return (
            <QuestionCard
              key={question.content}
              currentIndex={currentIndex}
              test={test}
              index={index}
              showCount={showCount}
              animatedValue={animatedValue}
              setCurrentIndex={setCurrentIndex}
            />
          );
        })}
      </View>
      <View className="flex flex-row gap-4">
        <TouchableOpacity
          activeOpacity={0.7}
          className={`flex-1 h-16 rounded-full items-center justify-between flex flex-row px-6 ${
            currentIndex > 0 ? "bg-foreground" : "bg-gray"
          }`}
          onPress={() => {
            if (currentIndex > 0) {
              animatedValue.value = withTiming(currentIndex - 1);
              setCurrentIndex(currentIndex - 1);
            }
          }}
          disabled={currentIndex <= 0}
        >
          <FontAwesome6
            name="arrow-left-long"
            size={20}
            color={currentIndex > 0 ? "black" : "#666"}
          />
          <Text
            className={`font-semibold text-xl ${
              currentIndex > 0 ? "text-background" : "text-muted"
            }`}
          >
            이전
          </Text>
          <View className="w-6"></View>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          className={`flex-1 h-16 rounded-full items-center justify-between flex flex-row px-6 ${
            currentIndex < currentQuestionIndex ? "bg-foreground" : "bg-gray"
          }`}
          onPress={() => {
            if (currentIndex < currentQuestionIndex) {
              animatedValue.value = withTiming(currentIndex + 1);
              setCurrentIndex(currentIndex + 1);
            }
          }}
          disabled={currentIndex >= currentQuestionIndex}
        >
          <View className="w-6"></View>
          <Text
            className={`font-semibold text-xl ${
              currentIndex < currentQuestionIndex
                ? "text-background"
                : "text-muted"
            }`}
          >
            다음
          </Text>
          <FontAwesome6
            name="arrow-right-long"
            size={20}
            color={currentIndex < currentQuestionIndex ? "black" : "#666"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
