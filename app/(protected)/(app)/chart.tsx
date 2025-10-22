import TabPageWrapper from "@/components/common/tab-page-wrapper";
import { useAuthStore } from "@/stores/auth-store";
import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
export default function Chart() {
  const { profile } = useAuthStore();

  if (!profile) return null;

  return (
    <TabPageWrapper>
      <ScrollView className="flex flex-col">
        <View className="p-3">
          <View className="flex flex-col p-3 rounded-xl bg-blue-500">
            <View className="w-full border-t"></View>
            <Text className="font-medium">BIG 5</Text>
            <View className="flex flex-row items-center justify-between mt-4 font-medium">
              <Text className="font-medium">개방성</Text>
              <Text className="font-medium">{profile.openness}</Text>
            </View>
            <View className="flex flex-row items-center justify-between font-medium">
              <Text className="font-medium">신경성</Text>
              <Text className="font-medium">{profile.neuroticism}</Text>
            </View>
            <View className="flex flex-row items-center justify-between font-medium">
              <Text className="font-medium">외향성</Text>
              <Text className="font-medium">{profile.extraversion}</Text>
            </View>
            <View className="flex flex-row items-center justify-between font-medium">
              <Text className="font-medium">친밀성</Text>
              <Text className="font-medium">{profile.agreeableness}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </TabPageWrapper>
  );
}
