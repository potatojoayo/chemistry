import { useAuthStore } from "@/stores/auth-store";
import { Redirect, Stack, usePathname } from "expo-router";
export default function ProtectedLayout() {
  const { profile, user, setRedirectPath } = useAuthStore();
  const pathname = usePathname();

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
