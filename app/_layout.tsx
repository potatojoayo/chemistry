import * as Sentry from "@sentry/react-native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "../global.css";

Sentry.init({
  dsn: "https://0260d38c5ecf94138de7278c21eae8fb@o4510069231845376.ingest.us.sentry.io/4510069233090560",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export default Sentry.wrap(function Layout() {
  const [loaded, error] = useFonts({
    Light: require("../assets/fonts/NotoSansKR-Light.ttf"),
    Regular: require("../assets/fonts/NotoSansKR-Regular.ttf"),
    Medium: require("../assets/fonts/NotoSansKR-Medium.ttf"),
    SemiBold: require("../assets/fonts/NotoSansKR-SemiBold.ttf"),
    Bold: require("../assets/fonts/NotoSansKR-Bold.ttf"),
    ExtraBold: require("../assets/fonts/NotoSansKR-ExtraBold.ttf"),
  });
  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded) return null; // 로딩 중에는 렌더하지 않음(스플래시 유지)j

  return (
    <GestureHandlerRootView className="flex-1">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#222" },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login/index" />
      </Stack>
    </GestureHandlerRootView>
  );
});
