import BlurHeader from "@/components/common/blur-header";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#ECEEDF",
        tabBarInactiveTintColor: "#666",
        tabBarLabelPosition: "below-icon",
        tabBarStyle: {
          position: "absolute",
          borderTopColor: "transparent",
          height: 60 + bottom,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={40}
            tint="dark"
            style={{
              flex: 1,
              backgroundColor: "transparent",
            }}
          />
        ),
        tabBarLabelStyle: {
          fontFamily: "bold",
          fontSize: 12,
          padding: Platform.OS === "web" ? 0 : 2,
        },
        header: () => <BlurHeader />,
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
