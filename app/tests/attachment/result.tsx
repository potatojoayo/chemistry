import AttachmentChart from "@/components/test/attachment-chart";
import { AttachmentResult } from "@/lib/types";
import { useTestStore } from "@/stores/test-store";
import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AttachmentResultPage() {
  const { tests, takeReTest } = useTestStore();
  const test = tests.find((test) => test.id === "attachment");
  const { bottom, top } = useSafeAreaInsets();
  if (!test) {
    return null;
  }
  const result = test.result as AttachmentResult;

  return (
    <ScrollView
      className="px-3 flex flex-col max-w-3xl w-full mx-auto"
      style={{
        paddingTop: top + 64,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        className="rounded-xl p-4 flex flex-col shadow mb-6"
        style={{ backgroundColor: test.color }}
      >
        <View className="border-t border-background"></View>
        <Text className="font-semibold text-xl mb-2 text-background">
          {test.name} 결과
        </Text>
        <AttachmentChart test={test} size={264} showLegend={true} />
      </View>
    </ScrollView>
  );
}
