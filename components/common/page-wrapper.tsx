import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PageWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <View
        className="max-w-xl w-full mx-auto h-full"
        style={{
          paddingTop: insets.top + 64, // status bar + 헤더 높이 + 여백
          paddingBottom: 16,
        }}
      >
        {children}
      </View>
    </View>
  );
}
