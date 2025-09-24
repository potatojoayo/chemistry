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
  size: "sm" | "md" | "lg";
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
      <View className="h-11 items-center justify-center flex">
        <View
          className={`rounded-full  ${size === "lg" ? "h-11 w-11 p-1.5" : size === "md" ? "h-10 w-10 p-1.5" : "h-8 w-8 p-1"} border-2 ${color === "positive" ? "border-green" : color === "negative" ? "border-red" : "border-gray"}`}
        >
          {selected && (
            <View
              className={`rounded-full ${color === "positive" ? "bg-green" : color === "negative" ? "bg-red" : "bg-gray"} w-full h-full`}
            ></View>
          )}
        </View>
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
