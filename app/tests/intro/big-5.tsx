import { useTestStore } from "@/stores/test-store";
import { MaterialIcons } from "@expo/vector-icons";
import { usePathname } from "expo-router";
import { Text, View } from "react-native";

export default function Big5Intro() {
  const path = usePathname();
  const testId = path.split("/").pop();

  const { tests } = useTestStore();

  const test = tests.find((test) => test.id === testId);
  if (!test) {
    return null;
  }
  let icon;

  switch (testId) {
    case "big-5":
      icon = <MaterialIcons name="waves" size={32} color="#222" />;
      break;
    default:
      icon = null;
  }
  return (
    <View className="px-3">
      <View
        className="rounded-lg p-4 flex flex-row items-center gap-2 w-fit"
        style={{
          backgroundColor: test.color,
        }}
      >
        <View>{icon}</View>
        <Text className="text-background font-semibold text-2xl">
          {test.name}
        </Text>
      </View>
    </View>
  );
}
