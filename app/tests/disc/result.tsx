import DiscCircleChart from "@/components/test/disc-circle-chart";
import { DISC_ANIMAL_DESCRIPTIONS } from "@/lib/descriptions/disc";
import { DiscResult } from "@/lib/types";
import { useTestStore } from "@/stores/test-store";
import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DiscResultPage() {
  const { tests, takeReTest } = useTestStore();
  const test = tests.find((test) => test.id === "disc");
  const { bottom, top } = useSafeAreaInsets();
  if (!test) {
    return null;
  }
  const result = test.result as DiscResult;
  const primaryDescription = DISC_ANIMAL_DESCRIPTIONS[result.primary.style];
  const secondaryDescription = DISC_ANIMAL_DESCRIPTIONS[result.secondary.style];

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
        <View className="items-center justify-center mb-6">
          <DiscCircleChart test={test} size={280} />
        </View>
      </View>

      {/* 주 스타일 */}
      <View
        className="rounded-2xl p-6 mt-4 flex flex-col"
        style={{ backgroundColor: "#444" }}
      >
        <Text className="font-semibold text-5xl text-foreground mb-2">
          {primaryDescription.styleCode}
        </Text>
        <Text className="font-medium text-foreground text-lg">
          {primaryDescription.styleName}
        </Text>
        <Text className="font-medium text-foreground/80 text-base">
          🦅 {primaryDescription.archetype} - {primaryDescription.subtitle}
        </Text>
      </View>

      {/* 주 스타일 설명 */}
      <View className="border-t border-foreground/30 mt-12"></View>
      <Text className="text-foreground mt-1">주 스타일 특징</Text>
      <View className="rounded-xl p-5 bg-[#333] mt-3">
        <Text className="font-medium text-base text-foreground/60 mb-3">
          {primaryDescription.tagline}
        </Text>
        <Text className="font-medium text-base text-foreground">
          {primaryDescription.description}
        </Text>
      </View>

      {/* 부 스타일 */}
      <View className="border-t border-foreground/30 mt-8"></View>
      <Text className="text-foreground mt-1">부 스타일</Text>
      <View className="rounded-xl p-5 bg-[#444] mt-3">
        <Text className="font-semibold text-lg text-foreground mb-2">
          {secondaryDescription.styleCode} ({secondaryDescription.styleName})
        </Text>
        <Text className="font-medium text-base text-foreground/60 mb-3">
          {secondaryDescription.archetype} - {secondaryDescription.subtitle}
        </Text>
        <Text className="font-medium text-base text-foreground/80">
          {secondaryDescription.tagline}
        </Text>
      </View>

      {/* 조언 */}
      <View className="border-t border-foreground/30 mt-8"></View>
      <Text className="text-foreground mt-1">성장을 위한 조언</Text>
      <View className="rounded-xl p-5 bg-green mt-3">
        <Text className="font-medium text-xl">{primaryDescription.advice}</Text>
      </View>
    </ScrollView>
  );
}
