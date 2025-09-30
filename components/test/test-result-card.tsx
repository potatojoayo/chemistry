import { Test } from "@/lib/types";
import * as Haptics from "expo-haptics";
import { RelativePathString, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function TestResultCard({
  test,
  icon,
  children,
}: {
  test: Test;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const textColor = "#222";
  const router = useRouter();

  if (!test.result) {
    return null;
  }

  return (
    <TouchableOpacity
      className="rounded-3xl p-4 hover:opacity-90 flex-1 flex flex-col h-36"
      style={{ backgroundColor: test.color }}
      activeOpacity={0.9}
      onPress={() => {
        router.push(`/${test.id}/result` as RelativePathString);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
    >
      <View
        className="border-t border-background"
        style={{ borderColor: textColor }}
      ></View>
      <View className="flex items-center flex-row">
        <Text className="text-[13px] font-medium" style={{ color: textColor }}>
          {test.name}
        </Text>
      </View>
      <View className="mt-auto">{children}</View>
    </TouchableOpacity>
  );
}
