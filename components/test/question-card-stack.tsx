import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import QuestionCard from "./question-card";

export default function QuestionCardStack({
  testName,
  questions,
  showCount = 3,
  currentIndex,
  setCurrentIndex,
}: {
  testName: string;
  questions: string[];
  showCount?: number;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const animatedValue = useSharedValue(0);
  return (
    <View className="flex flex-col justify-center items-center relative mb-16 w-[90vw] max-w-[800px]">
      {questions.map((question, index) => {
        if (index > currentIndex + showCount || index < currentIndex) {
          return null;
        }
        return (
          <QuestionCard
            key={question}
            currentIndex={currentIndex}
            testName={testName}
            question={question}
            index={index}
            totalCount={questions.length}
            showCount={showCount}
            animatedValue={animatedValue}
            setCurrentIndex={setCurrentIndex}
          />
        );
      })}
    </View>
  );
}
