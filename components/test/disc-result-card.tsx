import { DISC_ANIMAL_DESCRIPTIONS } from "@/lib/descriptions/disc";
import { DiscResult, Test } from "@/lib/types";
import { Text, View } from "react-native";
import TestResultCard from "./test-result-card";

export default function DiscResultCard({ test }: { test: Test }) {
  const result = test.result as DiscResult;
  const primaryDescription = DISC_ANIMAL_DESCRIPTIONS[result.primary.style];
  const secondaryDescription = DISC_ANIMAL_DESCRIPTIONS[result.secondary.style];
  return (
    <TestResultCard test={test}>
      <View className="flex flex-col">
        <View className="flex flex-col">
          <Text className="text-[40px] font-bold">
            {result.primary.style}/{result.secondary.style}
          </Text>
          <Text className="text-sm">
            {primaryDescription.styleName}/{secondaryDescription.styleName}
          </Text>
        </View>
      </View>
    </TestResultCard>
  );
}
