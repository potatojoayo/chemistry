import { Test } from "@/lib/types";
import { FontAwesome6, Octicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { RelativePathString, useRouter } from "expo-router";
import { Platform, Text, TouchableOpacity, View } from "react-native";

export default function TestCard({
  test,
  icon,
}: {
  test: Test;
  icon?: React.ReactNode;
}) {
  const textColor = "#222";
  const router = useRouter();

  if (test.result) {
    return null;
  }

  return (
    <TouchableOpacity
      className="flex rounded-xl p-4 flex-row hover:opacity-90"
      style={{ backgroundColor: test.color }}
      activeOpacity={0.9}
      onPress={() => {
        router.push(`/tests/${test.id}` as RelativePathString);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // if (test.progressIndex > 0) {
        //   router.push(`/tests/${test.id}` as RelativePathString);
        // } else {
        //   router.push(`/tests/intro/${test.id}` as RelativePathString);
        // }
      }}
    >
      <View className="w-10">
        {icon || <Octicons name="north-star" size={32} color={textColor} />}
      </View>
      <View className="ml-2 flex-1 flex flex-col">
        <View className="flex items-start justify-between flex-row">
          <Text
            className={` ${Platform.OS === "web" ? "text-lg font-semibold" : "text-xl font-bold"}`}
            style={{ color: textColor }}
          >
            {test.name}
          </Text>
        </View>
        <View
          className="border-t border-background my-2"
          style={{ borderColor: textColor }}
        ></View>
        <Text
          className={`font-medium ${Platform.OS === "web" ? "text-sm" : "text-base"}`}
          style={{ color: textColor }}
        >
          {test.description}
        </Text>
        <View
          className="mt-3 rounded-lg p-2 items-center justify-center flex-row gap-2"
          style={{ backgroundColor: textColor }}
        >
          <Text
            className={`font-medium ${Platform.OS === "web" ? "text-sm" : "text-base"}`}
            style={{ color: test.color }}
          >
            검사하기
          </Text>
          <FontAwesome6 name="arrow-right-long" size={12} color={test.color} />
        </View>
      </View>
    </TouchableOpacity>
  );
}
