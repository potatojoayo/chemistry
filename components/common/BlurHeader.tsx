import { BlurView } from "expo-blur";
import { Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BlurHeader() {
  const insets = useSafeAreaInsets();

  return (
    <BlurView
      intensity={20}
      tint="dark"
      className="absolute left-0 right-0 z-50 flex flex-row items-center bg-background"
      style={{
        top: 0, // SafeArea 밖에서 시작
        height: insets.top + 56, // status bar 높이 + 헤더 높이
        paddingTop: insets.top + 12, // status bar + 패딩
        paddingHorizontal: 12,
      }}
    >
      <Image
        source={require("../../assets/images/logo-foreground.png")}
        style={{ width: 132 }}
        resizeMode="contain"
      />
    </BlurView>
  );
}
