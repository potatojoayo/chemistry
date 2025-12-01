import BlurHeader from "@/components/common/blur-header";
import { useAuthStore } from "@/stores/auth-store";
import { Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Redirect, Tabs } from "expo-router";
import { Image, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();

  const { profile } = useAuthStore();

  if (!profile?.test_completed) {
    if(profile?.test_index===55){
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
            <BlurHeader>
              <Image
                source={require("../../../assets/images/logo-foreground.png")}
                style={{ width: 132 }}
                resizeMode="contain"
              />
            </BlurHeader>
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
            <BlurHeader>
              <Text className="text-foreground font-semibold text-2xl mb-2">
                차트
              </Text>
            </BlurHeader>
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
            <BlurHeader>
              <Text className="text-foreground font-semibold text-2xl mb-2">
                설정
              </Text>
            </BlurHeader>
          ),
        }}
      />
    </Tabs>
  );
}
