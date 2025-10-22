import BlurHeader from "@/components/common/blur-header";
import { useAuthStore } from "@/stores/auth-store";
import { Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Redirect, Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();

  const { profile } = useAuthStore();

  if (!profile?.test_completed) {
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
          fontSize: 10,
        },
        header: () => <BlurHeader />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "케미스트리",
          tabBarIcon: ({ color }) => (
            <Entypo size={20} name="lab-flask" color={color} />
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
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "설정",
          tabBarIcon: ({ color }) => (
            <Entypo size={20} name="cog" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
