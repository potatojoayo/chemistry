import { FontAwesome6, Octicons } from "@expo/vector-icons";
import { Link, RelativePathString } from "expo-router";
import { Platform, Text, TouchableOpacity, View } from "react-native";

export default function TestCardItem({
  title,
  description,
  link,
  color = "#ECEEDF",
  textColor = "#222",
  icon,
}: {
  title: string;
  description: string;
  link: RelativePathString;
  color?: string;
  textColor?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link href={link} asChild>
      <TouchableOpacity
        className="flex rounded-xl p-4 flex-row"
        style={{ backgroundColor: color }}
        activeOpacity={0.9}
      >
        {icon || <Octicons name="north-star" size={32} color={textColor} />}
        <View className="ml-2 flex-1 flex flex-col">
          <View className="flex items-start justify-between flex-row">
            <Text
              className={` font-bold ${Platform.OS === "ios" ? "text-xl" : "text-lg"}`}
              style={{ color: textColor }}
            >
              {title}
            </Text>
          </View>
          <View
            className="border-t border-background my-2"
            style={{ borderColor: textColor }}
          ></View>
          <View
            className="border-background"
            style={{ borderColor: textColor }}
          >
            <Text
              className={`font-medium ${Platform.OS === "ios" ? "text-base" : "text-sm"}`}
              style={{ color: textColor }}
            >
              {description}
            </Text>
          </View>
          <View
            className="mt-3 rounded-lg p-2 items-center justify-center flex-row gap-2"
            style={{ backgroundColor: textColor }}
          >
            <Text
              className={`font-medium ${Platform.OS === "ios" ? "text-base" : "text-sm"}`}
              style={{ color: color }}
            >
              검사하기
            </Text>
            <FontAwesome6 name="arrow-right-long" size={12} color={color} />
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
