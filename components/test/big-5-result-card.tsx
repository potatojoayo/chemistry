import { Big5Result, Test } from "@/lib/types";
import { Text, View } from "react-native";
import TestResultCard from "./test-result-card";

export default function Big5ResultCard({ test }: { test: Test }) {
  const result = test.result as Big5Result;
  return (
    <TestResultCard test={test}>
      <View className="flex flex-col">
        <View className="flex flex-row items-center justify-between">
          <Text className="leading-tight text-[12px]">개방성</Text>
          <Text className="font-semibold leading-tight text-[12px]">
            {result.byTrait.O.scaled0to100.toFixed(0)}
          </Text>
        </View>
        <View className="flex flex-row items-center justify-between">
          <Text className="leading-tight text-[12px]">성실성</Text>
          <Text className="font-semibold leading-tight text-[12px]">
            {result.byTrait.C.scaled0to100.toFixed(0)}
          </Text>
        </View>
        <View className="flex flex-row items-center justify-between">
          <Text className="leading-tight text-[12px]">외향성</Text>
          <Text className="font-semibold leading-tight text-[12px]">
            {result.byTrait.E.scaled0to100.toFixed(0)}
          </Text>
        </View>
        <View className="flex flex-row items-center justify-between">
          <Text className="leading-tight text-[12px]">친화성</Text>
          <Text className="font-semibold leading-tight text-[12px]">
            {result.byTrait.A.scaled0to100.toFixed(0)}
          </Text>
        </View>
        <View className="flex flex-row items-center justify-between">
          <Text className="leading-tight text-[12px]">신경성</Text>
          <Text className="font-semibold leading-tight text-[12px]">
            {result.byTrait.N.scaled0to100.toFixed(0)}
          </Text>
        </View>
      </View>
    </TestResultCard>
  );
}
