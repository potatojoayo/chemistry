import { ENNEAGRAM_WING_DESCRIPTIONS } from "@/lib/descriptions/enneargram";
import { EnneaResult, Test } from "@/lib/types";
import { Text, View } from "react-native";
import TestResultCard from "./test-result-card";

export default function EnneagramResultCard({ test }: { test: Test }) {
  const result = test.result as EnneaResult;
  const wingDescription = ENNEAGRAM_WING_DESCRIPTIONS[result.wingKey];
  return (
    <TestResultCard test={test}>
      <View className="flex flex-col">
        <View className="flex flex-col">
          <Text className="text-[40px] font-bold">
            {wingDescription.wingCode}
          </Text>
          <Text className="text-sm">{wingDescription.archetype}</Text>
        </View>
      </View>
    </TestResultCard>
  );
}
