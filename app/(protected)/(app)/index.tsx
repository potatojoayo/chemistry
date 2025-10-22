import SupabaseImage from "@/components/common/supabase-image";
import TabPageWrapper from "@/components/common/tab-page-wrapper";
import { useAuthStore } from "@/stores/auth-store";
import { FontAwesome6 } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function Home() {
  const { profile } = useAuthStore();

  if (!profile) return null;

  return (
    <TabPageWrapper>
      <ScrollView className="flex flex-col">
        <View className="flex flex-col p-3">
          <View className="flex flex-row items-center gap-3 h-10">
            <View className="w-9">
              <SupabaseImage
                path={profile.avatar_url}
                bucket="images"
                style={{ width: 36, height: 36, borderRadius: 40 }}
                resizeMode="cover"
              />
            </View>
            <View className="flex flex-col">
              <Text className="text-foreground font-semibold">
                {profile.nickname}
              </Text>
            </View>
          </View>
          <View className="mt-3 border-t w-full border-pastel-gray py-3 flex flex-row items-center gap-3">
            <View className="rounded-xl w-10 h-10 bg-foreground flex items-center justify-center">
              <FontAwesome6 name="plus" size={20} color="#222" />
            </View>
            <Text className="text-foreground font-medium">케미스트리 추가</Text>
          </View>
        </View>
      </ScrollView>
    </TabPageWrapper>
  );
}
