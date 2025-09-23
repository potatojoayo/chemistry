import PageWrapper from "@/components/common/PageWrapper";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Home() {
  return (
    <PageWrapper>
      <View className="h-[200vh] pt-14">
        <Text className="text-white text-xl px-3 py-1">Home</Text>
        <Text className="text-white text-lg px-3 py-2">
          스크롤 가능한 콘텐츠
        </Text>
        <Text className="text-white text-lg px-3 py-2">더 많은 콘텐츠...</Text>
        <Text className="text-white text-lg px-3 py-2">
          끝까지 스크롤해보세요!
        </Text>
        <Link href="/login" asChild>
          <Pressable>
            <Text className="text-white text-lg px-3 py-2">Login</Text>
          </Pressable>
        </Link>
      </View>
    </PageWrapper>
  );
}
