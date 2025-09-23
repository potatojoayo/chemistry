import { FontAwesome6 } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TestsLayout() {
  const { top } = useSafeAreaInsets();
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
        header: ({ options }) => (
          <View style={{ paddingTop: top }}>
            <View className="h-16 flex flex-row items-center px-6  ">
              <Pressable onPress={() => router.back()}>
                <FontAwesome6
                  name="arrow-left-long"
                  size={24}
                  color="#ECEEDF"
                />
              </Pressable>
              <Text
                className={`text-foreground font-bold ml-4 mb-[2px] ${Platform.OS === "ios" ? "text-2xl" : "text-lg"}`}
              >
                {options.title}
              </Text>
            </View>
          </View>
        ),
      }}
    >
      <Stack.Screen
        name="big5"
        options={{
          title: "BIG 5",
        }}
      />
    </Stack>
  );
}
