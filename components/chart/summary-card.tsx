import { Pressable, Text, View } from "react-native";

interface SummaryCardProps {
  label: string;
  value: string;
  subValue: string;
  colorClass: string;
  onPress?: () => void;
}

export default function SummaryCard({
  label,
  value,
  subValue,
  colorClass,
  onPress,
}: SummaryCardProps) {
  return (
    <Pressable
      className={`flex flex-col p-5 rounded-2xl flex-1 shadow ${colorClass}`}
      onPress={onPress}
    >
      <View className="w-full border-foreground border-t-[0.5px]"></View>
      <Text className="text-xs text-foreground mt-1">{label}</Text>
      <Text className="text-xl font-semibold mt-4 text-foreground">
        {value}
      </Text>
      <Text className="text-[11px] mt-1 opacity-80 text-foreground">
        {subValue}
      </Text>
    </Pressable>
  );
}
