import TabPageWrapper from "@/components/common/tab-page-wrapper";
import AttachmentResultCard from "@/components/test/attachment-result-card";
import Big5ResultCard from "@/components/test/big-5-result-card";
import DiscResultCard from "@/components/test/disc-result-card";
import EnneagramResultCard from "@/components/test/enneargram-result-card";
import TestCard from "@/components/test/test-card";
import { useTestStore } from "@/stores/test-store";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
} from "@expo/vector-icons";
import { Platform, Text, View } from "react-native";

export default function Home() {
  const { tests } = useTestStore();
  return (
    <TabPageWrapper>
      <View className="p-3 flex flex-col">
        <Text
          className={`text-foreground  font-semibold ${Platform.OS === "web" ? "text-xl" : "text-2xl"}`}
        >
          나를 아는 여정은,
        </Text>
        <Text
          className={`text-foreground  font-semibold ${Platform.OS === "web" ? "text-xl" : "text-2xl"}`}
        >
          내 안의 깊은 세계를 마주하는 일입니다.
        </Text>
        {tests.some((test) => test.result) && (
          <View className="flex flex-col">
            <View className="border-t border-foreground my-4 flex flex-row items-center"></View>
            <View className="flex flex-row flex-wrap gap-3">
              {tests.find((test) => test.id === "big-5")?.result && (
                <View className="flex-1 min-w-0" style={{ maxWidth: "48%" }}>
                  <Big5ResultCard
                    test={tests.find((test) => test.id === "big-5")!}
                  />
                </View>
              )}
              {tests.find((test) => test.id === "enneagram")?.result && (
                <View className="flex-1 min-w-0" style={{ maxWidth: "48%" }}>
                  <EnneagramResultCard
                    test={tests.find((test) => test.id === "enneagram")!}
                  />
                </View>
              )}
              {tests.find((test) => test.id === "disc")?.result && (
                <View className="flex-1 min-w-0" style={{ maxWidth: "48%" }}>
                  <DiscResultCard
                    test={tests.find((test) => test.id === "disc")!}
                  />
                </View>
              )}
              {tests.find((test) => test.id === "attachment")?.result && (
                <View className="flex-1 min-w-0" style={{ maxWidth: "48%" }}>
                  <AttachmentResultCard
                    test={tests.find((test) => test.id === "attachment")!}
                  />
                </View>
              )}
            </View>
          </View>
        )}
        {tests.some((test) => !test.result) && (
          <View className="border-t border-foreground my-4" />
        )}
        <View className="flex flex-col gap-4">
          <TestCard
            test={tests.find((test) => test.id === "big-5")!}
            icon={<MaterialIcons name="waves" size={32} color="#222" />}
          />
          <TestCard
            test={tests.find((test) => test.id === "enneagram")!}
            icon={<Octicons name="north-star" size={32} color="#222" />}
          />
          <TestCard
            test={tests.find((test) => test.id === "disc")!}
            icon={<Ionicons name="disc" size={32} color="#222" />}
          />
          <TestCard
            test={tests.find((test) => test.id === "attachment")!}
            icon={
              <MaterialCommunityIcons
                name="head-heart"
                size={36}
                color="#222"
              />
            }
          />
        </View>
      </View>
    </TabPageWrapper>
  );
}
