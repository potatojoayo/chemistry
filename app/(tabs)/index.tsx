import PageWrapper from "@/components/common/PageWrapper";
import TestCardItem from "@/components/test/test-card-item";
import { Platform, Text, View } from "react-native";

export default function Home() {
  return (
    <PageWrapper>
      <View className="p-3 flex flex-col">
        <Text
          className={`text-foreground  font-semiBold ${Platform.OS === "ios" ? "text-2xl" : "text-xl"}`}
        >
          나를 아는 여정은,
        </Text>
        <Text
          className={`text-foreground  font-semiBold ${Platform.OS === "ios" ? "text-2xl" : "text-xl"}`}
        >
          내 안의 깊은 세계를 마주하는 일입니다.
        </Text>
        <View className="border-t border-foreground my-6" />
        <TestCardItem
          title="애니어그램 (Enneagram)"
          description="에니어그램은 인간의 성격을 9가지 유형으로 나누어 설명합니다. 겉으로 드러나는 모습뿐 아니라, 내 안의 욕구와 두려움까지 비춰주는 심리학적 거울입니다."
          link="/tests/enneagram"
        />
      </View>
    </PageWrapper>
  );
}
