import TabPageWrapper from "@/components/common/tab-page-wrapper";
import { useTestStore } from "@/stores/test-store";
import { View } from "react-native";

export default function Home() {
  const { tests } = useTestStore();
  return (
    <TabPageWrapper>
      <View className="h-screen"></View>
    </TabPageWrapper>
  );
}
