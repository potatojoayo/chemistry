import CleanHeader from "@/components/common/clean-header";
import { useAuthStore } from "@/stores/auth-store";
import { Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { Image, Text, View } from "react-native";
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
          height: 56 + bottom,
          backgroundColor: "transparent", // background handled by tabBarBackground
          elevation: 0, // remove shadow on android
        },
        tabBarBackground: () => (
          <View className="flex-1 bg-background border-t border-pastel-gray/10" />
        ),
        tabBarLabelStyle: {
          fontFamily: "bold",
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "케미스트리",
          tabBarIcon: ({ color }) => (
            <Entypo size={20} name="lab-flask" color={color} />
          ),
          header: () => (
            <CleanHeader>
              <Image
                source={require("../../../assets/images/logo-foreground.png")}
                style={{ width: 120, marginTop: 8 }}
                resizeMode="contain"
              />
            </CleanHeader>
          ),
        }}
      />
      <Tabs.Screen
        name="chart"
        options={{
          title: "차트",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              size={20}
              name="view-grid-plus"
              color={color}
            />
          ),
          header: () => (
            <CleanHeader>
              <Text className="text-foreground font-semibold text-2xl">
                차트
              </Text>
            </CleanHeader>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "설정",
          tabBarIcon: ({ color }) => (
            <Entypo size={20} name="cog" color={color} />
          ),
          header: () => (
            <CleanHeader>
              <Text className="text-foreground font-semibold text-2xl">
                설정
              </Text>
            </CleanHeader>
          ),
        }}
      />
    </Tabs>
  );
}
