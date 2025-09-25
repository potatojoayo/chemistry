import Big5RadarChart from "@/components/test/big-5-radar-chart";
import { useTestStore } from "@/stores/test-store";
import { View } from "react-native";

export default function Big5Result() {
  const { tests } = useTestStore();
  const test = tests.find((test) => test.id === "big-5");
  if (!test) {
    return null;
  }
  return (
    <View className="px-3 flex flex-col">
      <View
        className="rounded-xl p-4 flex flex-col shadow"
        style={{ backgroundColor: test.color }}
      >
        <Big5RadarChart test={test} />
      </View>
    </View>
  );
}
