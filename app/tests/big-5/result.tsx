import Big5RadarChart from "@/components/test/big-5-radar-chart";
import { useTestStore } from "@/stores/test-store";
import { Text, View } from "react-native";

export default function Big5Result() {
  const { tests } = useTestStore();
  const test = tests.find((test) => test.id === "big-5");
  if (!test) {
    return null;
  }
  return (
    <View className="px-3 flex flex-col max-w-3xl w-full mx-auto">
      <View
        className="rounded-xl p-4 flex flex-col shadow"
        style={{ backgroundColor: test.color }}
      >
        <View className="border-t border-background"></View>
        <Text className="font-semibold text-lg mb-2 text-background">
          {test.name} 결과
        </Text>
        <Big5RadarChart test={test} size={280} />
      </View>
    </View>
  );
}
