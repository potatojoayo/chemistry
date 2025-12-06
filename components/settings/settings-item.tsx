import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface SettingsItemProps {
  label: string;
  onPress?: () => void;
  icon?: string;
  value?: string;
  isDestructive?: boolean;
}

export default function SettingsItem({
  label,
  onPress,
  icon,
  value,
  isDestructive = false,
}: SettingsItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center justify-between py-3 active:opacity-70`}
    >
      <View className="flex-row items-center gap-3">
        {icon && (
          <View className="w-8 items-center">
            <FontAwesome6
              name={icon}
              size={18}
              color={isDestructive ? "#ef4444" : "#ECEEDF"}
            />
          </View>
        )}
        <Text
          className={`text-base font-medium ${
            isDestructive ? "text-red-500" : "text-white"
          }`}
        >
          {label}
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        {value && <Text className="text-white/60 text-sm">{value}</Text>}
        {/* {onPress && (
          <FontAwesome6 name="chevron-right" size={14} color="#a1a1aa" />
        )} */}
      </View>
    </Pressable>
  );
}
