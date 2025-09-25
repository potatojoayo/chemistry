import EnneagramPieChart from "@/components/test/enneagram-pie-chart";
import { useTestStore } from "@/stores/test-store";
import { Text, View } from "react-native";

export default function EnneagramResult() {
  const { tests } = useTestStore();
  const test = tests.find((test) => test.id === "enneagram");
  if (!test) {
    return null;
  }
  return (
    <View className="px-3 flex flex-col max-w-3xl w-full mx-auto">
      <View
        className="rounded-xl p-6 flex flex-col shadow"
        style={{ backgroundColor: test.color }}
      >
        <Text className="font-semibold text-2xl mb-4 text-background text-center">
          {test.name} 결과
        </Text>

        {/* 파이 차트 */}
        <View className="items-center justify-center mb-6">
          <EnneagramPieChart test={test} size={280} showLegend={true} />
        </View>

        {/* 결과 설명 */}
        <View className="bg-background/10 rounded-lg p-4">
          <Text className="text-background text-center text-base leading-relaxed">
            당신의 에니어그램 유형을 확인해보세요.{"\n"}
            가장 높은 점수를 받은 유형이 당신의 주요 성격 유형입니다.
          </Text>
        </View>
      </View>
    </View>
  );
}
