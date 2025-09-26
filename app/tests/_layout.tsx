import { useTestStore } from "@/stores/test-store";
import { FontAwesome6 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router, Stack } from "expo-router";
import { Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TestsLayout() {
  const { top } = useSafeAreaInsets();
  const { clearAnswers } = useTestStore();
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "#222" },
        header: ({ options }) => {
          return (
            <BlurView
              intensity={20}
              tint="dark"
              className="absolute left-0 right-0 z-50 flex flex-row items-center bg-background"
              style={{
                top: 0, // SafeArea 밖에서 시작
                height: top + 56, // status bar 높이 + 헤더 높이
                paddingTop: top + 12, // status bar + 패딩
              }}
            >
              <View className="flex flex-row items-center px-6  ">
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
            </BlurView>
          );
        },
      }}
    >
      <Stack.Screen
        name="big-5/index"
        options={{
          title: "BIG 5",
        }}
      />
      <Stack.Screen
        name="big-5/result"
        options={{
          title: "BIG 5",
        }}
      />
      <Stack.Screen
        name="enneagram/index"
        options={{
          title: "에니어그램",
        }}
      />
      <Stack.Screen
        name="enneagram/result"
        options={{
          title: "에니어그램",
        }}
      />
      <Stack.Screen
        name="disc/index"
        options={{
          title: "DISC",
        }}
      />
      <Stack.Screen
        name="disc/result"
        options={{
          title: "DISC",
        }}
      />

      <Stack.Screen
        name="attachment/index"
        options={{
          title: "애착유형",
        }}
      />
      <Stack.Screen
        name="attachment/result"
        options={{
          title: "애착유형",
        }}
      />
    </Stack>
  );
}
