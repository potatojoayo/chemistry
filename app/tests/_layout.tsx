import { useTestStore } from "@/stores/test-store";
import { FontAwesome6 } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TestsLayout() {
  const { top } = useSafeAreaInsets();
  const { clearAnswers } = useTestStore();
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "#222", paddingTop: top + 64 },
        headerStyle: {
          backgroundColor: "#222",
        },
        headerShadowVisible: false,
        headerTintColor: "#ECEEDF",
        headerTitleStyle: {
          color: "#ECEEDF",
          fontFamily: "bold",
        },
        headerTransparent: true,
        header: ({ options }) => {
          return (
            <View style={{ paddingTop: top }}>
              <View className="h-16 flex flex-row items-center px-6  ">
                <Pressable
                  className="flex flex-row items-center"
                  onPress={() => {
                    router.back();
                    clearAnswers({ id: "big-5" });
                  }}
                >
                  <FontAwesome6
                    name="arrow-left-long"
                    size={24}
                    color="#ECEEDF"
                  />
                  <Text
                    className={`text-foreground font-bold ml-4 mb-[2px] ${Platform.OS === "web" ? "text-lg" : "text-2xl"}`}
                  >
                    {options.title}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        },
      }}
    >
      <Stack.Screen
        name="big5"
        options={{
          title: "BIG 5",
        }}
      />
      <Stack.Screen
        name="intro/big-5"
        options={{
          title: "BIG 5",
        }}
      />
    </Stack>
  );
}
