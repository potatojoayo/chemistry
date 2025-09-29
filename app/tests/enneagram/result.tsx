import EnneagramPieChart from "@/components/test/enneagram-pie-chart";
import {
  ENNEAGRAM_TYPE_DESCRIPTIONS,
  ENNEAGRAM_WING_DESCRIPTIONS,
} from "@/lib/descriptions/enneargram";
import { EnneaResult } from "@/lib/types";
import { useTestStore } from "@/stores/test-store";
import * as Haptics from "expo-haptics";
import { RelativePathString, router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EnneagramResult() {
  const { tests, takeReTest } = useTestStore();
  const test = tests.find((test) => test.id === "enneagram");
  const { bottom, top } = useSafeAreaInsets();
  if (!test) {
    return null;
  }
  const result = test.result as EnneaResult;
  const typeDescription = ENNEAGRAM_TYPE_DESCRIPTIONS[result.primary.type];
  const wingDescription = ENNEAGRAM_WING_DESCRIPTIONS[result.wingKey];
  return (
    <ScrollView
      className="flex flex-col max-w-3xl w-full mx-auto"
      style={{
        paddingTop: top + 64,
        paddingHorizontal: 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        className="rounded-3xl p-5 flex flex-col shadow"
        style={{ backgroundColor: test.color }}
      >
        <View className="border-t border-background"></View>
        <Text className="font-semibold text-xl mb-2 text-background">
          {test.name} 결과
        </Text>

        {/* 파이 차트 */}
        <View className="items-center justify-center mb-6">
          <EnneagramPieChart test={test} size={280} showLegend={true} />
        </View>
      </View>
      <View
        className="rounded-2xl p-6 mt-4 flex flex-col"
        style={{
          backgroundColor: typeDescription.color,
        }}
      >
        <Text className="font-semibold text-5xl text-background ">
          {result.primary.type.replace("Type", "")}
        </Text>
        <Text className="font-medium text-background">
          {typeDescription.title}
        </Text>
      </View>
      <View className="border-t border-foreground/30 mt-12"></View>
      <Text className="  text-foreground mt-1">유형 설명</Text>
      <View className="rounded-xl p-5 bg-[#333] mt-3">
        <Text className="font-semibold text-xl text-foreground">
          {typeDescription.description}
        </Text>
      </View>
      <View className="border-t border-foreground/30 mt-12"></View>
      <Text className="mt-1 text-foreground">주의점</Text>
      <View className="rounded-xl p-5 bg-red mt-3">
        <Text className="font-medium text-xl ">{typeDescription.pitfalls}</Text>
      </View>
      <View className="border-t border-foreground/30 mt-12"></View>
      <Text className="  text-foreground mt-1">조언</Text>
      <View className="rounded-xl p-5 bg-yellow mt-3">
        <Text className="font-medium text-xl ">{typeDescription.advice}</Text>
      </View>

      <View className="border-t border-foreground/30 mt-12"></View>
      <Text className="  text-foreground mt-1">날개 유형</Text>
      <View className="rounded-xl p-5 bg-[#444] mt-3">
        <Text className="font-semibold text-lg text-foreground mb-2">
          {wingDescription.wingCode
            ? `${wingDescription.wingCode} (${wingDescription.archetype})`
            : "Wing Label"}
        </Text>
        <Text className="font-medium text-base text-foreground/60 mb-3">
          {wingDescription.subtitle}
        </Text>
        <Text className="font-medium text-base text-foreground/80 mb-3">
          {wingDescription.oneLine}
        </Text>
        <Text className="font-medium text-base text-foreground">
          {wingDescription.description}
        </Text>
      </View>

      <View className="border-t border-foreground/30 mt-8"></View>
      <Text className="  text-foreground mt-1">날개 유형을 위한 조언</Text>
      <View className="rounded-xl p-5 bg-green mt-3">
        <Text className="font-medium text-xl ">{wingDescription.advice}</Text>
      </View>

      <TouchableOpacity
        className="mt-12 bg-foreground py-4 rounded-full"
        activeOpacity={0.7}
        onPress={() => {
          takeReTest({ id: "enneagram" });
          router.replace(`/tests/enneagram` as RelativePathString);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Text className="font-medium text-lg text-background text-center">
          다시 검사하기
        </Text>
      </TouchableOpacity>
      <View
        style={{
          height: bottom + 16,
        }}
      ></View>
    </ScrollView>
  );
}
