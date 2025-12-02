import { useAuthStore } from "@/stores/auth-store";
import { Redirect, Stack, usePathname } from "expo-router";
import { View } from "react-native";

export default function ProtectedLayout() {
  const { profile, user, setRedirectPath, loading } = useAuthStore();
  const pathname = usePathname();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
      </View>
    );
  }

  if (!user || !profile) {
    // 현재 경로를 auth-store에 저장
    setRedirectPath(pathname);
    return <Redirect href="/login" />;
  }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(app)" />
      <Stack.Screen name="report/[type]" />
      <Stack.Screen name="test" />
    </Stack>
  );
}
