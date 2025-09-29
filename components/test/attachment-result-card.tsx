import { AttachmentResult, Test } from "@/lib/types";
import { Text, View } from "react-native";
import TestResultCard from "./test-result-card";

// 애착유형 결정 함수
function getAttachmentStyle(anxiety: number, avoidance: number) {
  if (anxiety < 0 && avoidance < 0) {
    return { style: "안정", emoji: "🌿", description: "안정적 애착" };
  } else if (anxiety >= 0 && avoidance < 0) {
    return { style: "불안", emoji: "💭", description: "불안-몰입형 애착" };
  } else if (anxiety < 0 && avoidance >= 0) {
    return { style: "회피", emoji: "🛡️", description: "회피형 애착" };
  } else {
    return { style: "혼란", emoji: "🌊", description: "혼란형 애착" };
  }
}

export default function AttachmentResultCard({ test }: { test: Test }) {
  const result = test.result as AttachmentResult;
  const attachmentStyle = getAttachmentStyle(
    result.anxiety.z,
    result.avoidance.z
  );

  return (
    <TestResultCard test={test}>
      <View className="flex flex-col">
        <View className="flex flex-col">
          <Text className="text-[40px] font-bold">
            {attachmentStyle.style}형
          </Text>
          <Text className="text-sm">
            {attachmentStyle.emoji} {attachmentStyle.description}
          </Text>
          {/* <Text className="text-xs opacity-80">
            {attachmentStyle.description}
          </Text> */}
        </View>

        {/* <View className="flex flex-col mt-3 space-y-1">
          <View className="flex flex-row items-center justify-between">
            <Text className="leading-tight text-[12px]">불안</Text>
            <Text className="font-semibold leading-tight text-[12px]">
              {result.anxiety.average.toFixed(1)}
            </Text>
          </View>
          <View className="flex flex-row items-center justify-between">
            <Text className="leading-tight text-[12px]">회피</Text>
            <Text className="font-semibold leading-tight text-[12px]">
              {result.avoidance.average.toFixed(1)}
            </Text>
          </View>
        </View> */}
      </View>
    </TestResultCard>
  );
}
