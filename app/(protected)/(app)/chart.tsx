import RadarChart from "@/components/chart/radar-chart";
import TabPageWrapper from "@/components/common/tab-page-wrapper";
import { useAuthStore } from "@/stores/auth-store";
import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
export default function Chart() {
  const { profile } = useAuthStore();

  if (!profile) return null;

  const big5Data = [
    {
      label: "개방성",
      value: Math.round(((profile.openness ?? 0) / 5) * 100),
      color: "#222",
    },
    {
      label: "성실성",
      value: Math.round(((profile.conscientiousness ?? 0) / 5) * 100),
      color: "#222",
    },
    {
      label: "외향성",
      value: Math.round(((profile.extraversion ?? 0) / 5) * 100),
      color: "#222",
    },
    {
      label: "친밀성",
      value: Math.round(((profile.agreeableness ?? 0) / 5) * 100),
      color: "#222",
    },
    {
      label: "신경성",
      value: Math.round(((profile.neuroticism ?? 0) / 5) * 100),
      color: "#222",
    },
  ];

  return (
    <TabPageWrapper>
      <ScrollView className="flex flex-col">
        <View className="p-3 pt-1">
          <View className="flex flex-row gap-3">
            <View className="flex flex-col p-5 rounded-2xl bg-foreground flex-1 shadow-lg">
              <View className="w-full border-t"></View>
              <Text className="text-xs">BIG 5</Text>
              <View className="flex items-center justify-center mt-4">
                <RadarChart data={big5Data} size={220} />
              </View>
            </View>
          </View>
          <View className="flex flex-row gap-3 mt-3">
            <View className="flex flex-col p-5 rounded-2xl bg-pastel-green flex-1 shadow-lg">
              <View className="w-full border-t"></View>
              <Text className="text-xs">애착 유형</Text>
              <Text className="text-xl font-medium mt-6">안정형</Text>
              <Text className="text-[11px] mt-1">맑게 겐 하늘</Text>
            </View>
            <View className="flex flex-col p-5 rounded-2xl bg-yellow-300 flex-1 shadow-lg">
              <View className="w-full border-t"></View>
              <Text className="text-xs">정서적 유연성</Text>
              <Text className="text-xl font-medium mt-6">마음의 정원사</Text>
              <Text className="text-[11px] mt-1 ">사랑에 물을 주는</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </TabPageWrapper>
  );
}
