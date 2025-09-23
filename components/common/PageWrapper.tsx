import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BlurHeader from "./BlurHeader";

export default function PageWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View className="flex-1 bg-background">
      <BlurHeader />
      <ScrollView
        className="bg-background flex-1"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
      >
        <View
          className="max-w-xl w-full mx-auto h-full"
          style={{
            paddingTop: insets.top + 52, // status bar + 헤더 높이 + 여백
            paddingBottom: tabBarHeight + 16,
          }}
        >
          {children}
        </View>
      </ScrollView>
    </View>
  );
}
