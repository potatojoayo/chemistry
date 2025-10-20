import * as Haptics from "expo-haptics";
import { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function QuestionSelection({
  label,
  color,
  size,
  onPress,
  selected,
}: {
  label: string;
  color: "positive" | "negative" | "neutral";
  size: "sm" | "md" | "lg" | "xl";
  onPress: () => void;
  selected: boolean;
}) {
  const displayLabel = useMemo(() => label.replace("\\n", "\n"), [label]);
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      className="flex flex-col items-center justify-center gap-2 w-14"
      onPress={handlePress}
    >
      <View className="h-9 items-center justify-center flex">
        <View
          className={`rounded-full  ${size === "xl" ? "h-9 w-9 p-1.5" : size === "lg" ? "h-8 w-8 p-1.5" : size === "md" ? "h-7 w-7 p-1" : "h-6 w-6 p-1"} border-2 ${color === "positive" ? "border-green-600" : color === "negative" ? "border-red-500" : "border-pastel-gray"}`}
        >
          {selected && (
            <View
              className={`rounded-full ${color === "positive" ? "bg-green-500" : color === "negative" ? "bg-red-500" : "bg-pastel-gray"} w-full h-full`}
            ></View>
          )}
        </View>
      </View>
      <View className="h-6 justify-center flex flex-row">
        <Text
          className={`${color === "positive" ? "text-green-600" : color === "negative" ? "text-red-500" : "text-pastel-gray"} text-center text-xs font-medium`}
        >
          {displayLabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
