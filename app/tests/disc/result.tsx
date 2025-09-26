import DiscCircleChart from "@/components/test/disc-circle-chart";
import { DiscResult } from "@/lib/types";
import { useTestStore } from "@/stores/test-store";
import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EnneagramResult() {
  const { tests, takeReTest } = useTestStore();
  const test = tests.find((test) => test.id === "disc");
  const { bottom, top } = useSafeAreaInsets();
  if (!test) {
    return null;
  }
  const result = test.result as DiscResult;

  return (
    <ScrollView
      className="px-3 flex flex-col max-w-3xl w-full mx-auto"
      style={{
        paddingTop: top + 64,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        className="rounded-xl p-4 flex flex-col shadow"
        style={{ backgroundColor: test.color }}
      >
        <View className="border-t border-background"></View>
        <Text className="font-semibold text-xl mb-2 text-background">
          {test.name} 결과
        </Text>
        <DiscCircleChart test={test} size={280} />
      </View>
    </ScrollView>
  );
}
