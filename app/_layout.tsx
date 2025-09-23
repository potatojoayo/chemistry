import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import "../global.css";

export default function Layout() {
  useFonts({
    Light: require("../assets/fonts/NotoSansKR-Light.ttf"),
    Regular: require("../assets/fonts/NotoSansKR-Regular.ttf"),
    Medium: require("../assets/fonts/NotoSansKR-Medium.ttf"),
    SemiBold: require("../assets/fonts/NotoSansKR-SemiBold.ttf"),
    Bold: require("../assets/fonts/NotoSansKR-Bold.ttf"),
    ExtraBold: require("../assets/fonts/NotoSansKR-ExtraBold.ttf"),
  });

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#222" },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login/index" />
    </Stack>
  );
}
