import EnneagramPieChart from "@/components/test/enneagram-pie-chart";
import {
  ENNEAGRAM_TYPE_DESCRIPTIONS,
  ENNEAGRAM_WING_DESCRIPTIONS,
} from "@/lib/descriptions/enneargram";
import { EnneaResult } from "@/lib/types";
import { useTestStore } from "@/stores/test-store";
import { Text, View } from "react-native";
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
    </ScrollView>
  );
}
