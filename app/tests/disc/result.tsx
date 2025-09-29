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
    </ScrollView>
  );
}
