import CleanHeader from "@/components/common/clean-header";
import { useAuthStore } from "@/stores/auth-store";
import { Entypo } from "@expo/vector-icons";
import { Redirect, Tabs, router } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();

  const { profile } = useAuthStore();

  if (!profile?.test_completed) {
    if (profile?.test_index === 55) {
      return <Redirect href="/test" />;
    }
    return <Redirect href="/test/intro" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#ECEEDF",
        tabBarInactiveTintColor: "#666",
        tabBarLabelPosition: "below-icon",
        tabBarStyle: {
          position: "absolute",
          borderTopColor: "transparent",
          height: 64 + bottom,
          backgroundColor: "transparent", // background handled by tabBarBackground
          elevation: 0, // remove shadow on android
        },
        tabBarBackground: () => (
          <View className="flex-1 bg-background border-t border-pastel-gray/10" />
        ),
        tabBarItemStyle: {
          justifyContent: "center",
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: "bold",
          fontSize: 10,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "케미스트리",
          tabBarIcon: ({ color, focused }) => (
            <View className="w-[30px] h-[30px] items-center justify-center">
              <Entypo size={24} name="lab-flask" color={color} />
            </View>
          ),
          header: () => (
            <CleanHeader>
              <Image
                source={require("../../../assets/images/logo-foreground.png")}
                style={{ width: 120, height: 32, marginTop: 8 }}
                resizeMode="contain"
              />
            </CleanHeader>
          ),
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: "마이페이지",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`w-[30px] h-[30px] items-center justify-center rounded-full border ${
                focused ? "border-foreground" : "border-foreground/10"
              }`}
            >
              <Image
                source={{ uri: profile?.avatar_url }}
                style={{ width: 26, height: 26, borderRadius: 12 }}
                resizeMode="cover"
              />
            </View>
          ),
          header: () => (
            <CleanHeader>
              <View className="flex-1 flex-row items-center justify-between">
                <Text className="text-foreground font-semibold text-[20px]">
                  마이페이지
                </Text>
                <Pressable
                  onPress={() => router.push("/settings")}
                  className="p-2"
                >
                  <Entypo name="cog" size={24} color="#ECEEDF" />
                </Pressable>
              </View>
            </CleanHeader>
          ),
        }}
      />
    </Tabs>
  );
}
