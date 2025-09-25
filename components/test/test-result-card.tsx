import { Test } from "@/lib/types";
import { FontAwesome6, Octicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { RelativePathString, useRouter } from "expo-router";
import { Platform, Text, TouchableOpacity, View } from "react-native";

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
      className="flex rounded-xl p-4 flex-row"
      style={{ backgroundColor: test.color }}
      activeOpacity={0.9}
      onPress={() => {
        router.push(`/tests/${test.id}/result` as RelativePathString);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
    >
      <View className="flex-1 flex flex-col">
        <View className="flex items-center flex-row">
          {icon || <Octicons name="north-star" size={20} color={textColor} />}
          <Text
            className={`ml-2 ${Platform.OS === "web" ? "text-lg font-semibold" : "text-2xl font-bold"}`}
            style={{ color: textColor }}
          >
            {test.name}
          </Text>
        </View>
        <View
          className="border-t border-background my-2"
          style={{ borderColor: textColor }}
        ></View>
        <View className="mt-4">{children}</View>
        <View
          className="mt-3 rounded-lg p-2 items-center justify-center flex-row gap-2"
          style={{ backgroundColor: textColor }}
        >
          <Text
            className={`font-medium ${Platform.OS === "web" ? "text-sm" : "text-base"}`}
            style={{ color: test.color }}
          >
            자세히 보기
          </Text>
          <FontAwesome6 name="arrow-right-long" size={12} color={test.color} />
        </View>
      </View>
    </TouchableOpacity>
  );
}
