import { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function QuestionSelection({
  label,
  color,
  size,
  onPress,
}: {
  label: string;
  color: "positive" | "negative" | "neutral";
  size: "sm" | "md" | "lg";
  onPress: () => void;
}) {
  const displayLabel = useMemo(() => label.replace("\\n", "\n"), [label]);
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      className="flex flex-col items-center justify-center gap-2 w-14"
      onPress={onPress}
    >
      <View className="h-11 items-center justify-center flex">
        <View
          className={`rounded-full ${size === "lg" ? "h-11 w-11" : size === "md" ? "h-10 w-10" : "h-8 w-8"} border-2 ${color === "positive" ? "border-green" : color === "negative" ? "border-red" : "border-gray"}`}
        ></View>
      </View>
      <View className="h-8 justify-center flex flex-row">
        <Text
          className={`${color === "positive" ? "text-green" : color === "negative" ? "text-red" : "text-gray"} text-center text-xs font-bold`}
        >
          {displayLabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
