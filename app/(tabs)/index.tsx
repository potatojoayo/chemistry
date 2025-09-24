import PageWrapper from "@/components/common/PageWrapper";
import TestCard from "@/components/test/test-card";
import { useTestStore } from "@/stores/test-store";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Platform, Text, View } from "react-native";

export default function Home() {
  const { tests } = useTestStore();
  return (
    <PageWrapper>
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
        <View className="border-t border-foreground my-6" />
        <View className="flex flex-col gap-4">
          <TestCard
            test={tests.find((test) => test.id === "big-5")!}
            icon={<MaterialIcons name="waves" size={32} color="#222" />}
          />
          <TestCard
            test={tests.find((test) => test.id === "enneagram")!}
            icon={<MaterialIcons name="waves" size={32} color="#222" />}
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
                size={32}
                color="#222"
                className="ml-1"
              />
            }
          />
        </View>
      </View>
    </PageWrapper>
  );
}
