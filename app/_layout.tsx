import * as Sentry from "@sentry/react-native";
import { useFonts } from "expo-font";
import { Slot, SplashScreen, useSegments } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
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

export default Sentry.wrap(function RootLayout() {
  const segments = useSegments();
  const progress = useSharedValue(0);

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

  useEffect(() => {
    progress.value = 0.5;
    progress.value = withTiming(1, { duration: 300 }); // 300ms 전환
  }, [segments, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 16 }], // 오른쪽에서 슬라이드 인
  }));

  if (!loaded) return null; // 로딩 중에는 렌더하지 않음(스플래시 유지)

  return (
    <GestureHandlerRootView className="flex-1">
      {Platform.OS === "web" ? (
        <Animated.View style={[{ height: "100%" }, style]}>
          <Slot />
        </Animated.View>
      ) : (
        <Slot />
      )}
    </GestureHandlerRootView>
  );
});
