import { useAuthStore } from "@/stores/auth-store";
import { router, Slot } from "expo-router";
import { useEffect } from "react";
export default function ProtectedLayout() {
  const { profile, loading, user } = useAuthStore();
  useEffect(() => {
    if (loading) return;
    if (!user || !profile) {
      router.replace("/login");
    }
    // if (user && profile && !profile.test_completed) {
    //   router.replace("/(protected)/test/intro");
    // }
  }, [profile, loading, user]);
  return <Slot />;
}
