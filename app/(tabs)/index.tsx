import PageWrapper from "@/components/common/PageWrapper";
import TestCardItem from "@/components/test/test-card-item";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
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
        <View className="flex flex-col gap-4">
          <TestCardItem
            title="에니어그램"
            description="에니어그램은 인간의 성격을 9가지 유형으로 나누어 설명합니다. 겉으로 드러난 모습이 아니라, 나를 움직이는 핵심 욕구와 두려움을 비춰주는 심리학적 거울입니다. 스스로를 더 깊이 이해하고 관계 속에서 진짜 나를 발견할 수 있습니다."
            link="/tests/enneagram"
            color="#26B066"
          />
          <TestCardItem
            title="OCEAN"
            description="OCEAN은 인간의 성격을 개방성·성실성·외향성·친화성·신경성의 다섯 축으로 비춥니다. 점수가 옳고 그름을 말하지는 않아요. 다만, 당신이 어떻게 세상을 보고 반응하는지에 대한 명확한 지도를 건네줍니다."
            link="/tests/ocean"
            color="#5AAEFF"
            icon={<MaterialIcons name="waves" size={32} color="#222" />}
          />
          <TestCardItem
            title="DISC"
            description="DISC는 인간의 행동을 지배(D), 사교(I), 안정(S), 신중(C) 네 가지 유형으로 나눕니다. 당신이 세상과 어울리고 선택하는 방식 속에는 고유한 패턴이 숨어 있습니다. 이 테스트는 그 패턴을 비추어, 관계와 협업에서의 당신의 강점을 알려줍니다."
            link="/tests/disc"
            color="#F58476"
            icon={<Ionicons name="disc" size={32} color="#222" />}
          />
          <TestCardItem
            title="MBTI"
            description="MBTI는 외향·내향, 감각·직관, 사고·감정, 판단·인식 네 가지 축을 조합해 우리의 성격을 16가지 유형으로 보여줍니다. 많은 사람들이 자기이해와 관계 탐색의 첫걸음으로 삼는 친숙한 심리학 도구입니다."
            link="/tests/mbti"
            color="#ffd54f"
            icon={
              <MaterialCommunityIcons name="puzzle" size={32} color="#222" />
            }
          />
        </View>
      </View>
    </PageWrapper>
  );
}
