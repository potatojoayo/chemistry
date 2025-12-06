import { useAuthStore } from "@/stores/auth-store";
import { Redirect, Stack, usePathname } from "expo-router";
import { View } from "react-native";

export default function ProtectedLayout() {
  const { profile, user, loading, setAuthRedirectPath } = useAuthStore();
  const pathname = usePathname();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background"></View>
    );
  }

  if (!user || !profile) {
    setAuthRedirectPath(pathname);
    return <Redirect href="/login" />;
  }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(app)" />
      <Stack.Screen name="report/[type]" />
      <Stack.Screen name="test" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="settings/nickname" />
    </Stack>
  );
}
