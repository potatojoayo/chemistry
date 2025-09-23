import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#D9E9CF",
        tabBarInactiveTintColor: "gray",
        tabBarLabelPosition: "below-icon",
        tabBarStyle: {
          backgroundColor: "#111",
          borderTopColor: "transparent",
          height: 60 + bottom,
        },
        tabBarLabelStyle: {
          fontFamily: "semiBold",
          fontSize: 10,
          padding: Platform.OS === "ios" ? 4 : 0,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "차트",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              size={24}
              name="view-grid-plus"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          title: "마이페이지",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 size={22} solid name="user-circle" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
