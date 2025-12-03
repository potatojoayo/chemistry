import AnimatedPageWrapper from "@/components/common/animated-page-wrapper";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/models/profile";
import { Relationship } from "@/models/relationship";
import { useAuthStore } from "@/stores/auth-store";
import { useInvitationStore } from "@/stores/invitation-store";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function ChemistryPage() {
  const { profile } = useAuthStore();
  const { inviterProfileId, clearInvitation } = useInvitationStore();
  const [loading, setLoading] = useState(true);
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);

  const fillHeight = useSharedValue(0);

  useEffect(() => {
    async function fetchData() {
      if (!profile) return;

      try {
        // Fetch relationship
        const { data: relData, error: relError } = await supabase
          .from("relationships")
          .select("*")
          .or(
            `inviting_profile_id.eq.${profile.id},invited_profile_id.eq.${profile.id}`
          )
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (relError) {
          console.error("Error fetching relationship:", relError);
          setLoading(false);
          return;
        }

        setRelationship(relData);

        // Fetch partner profile
        const partnerId =
          relData.inviting_profile_id === profile.id
            ? relData.invited_profile_id
            : relData.inviting_profile_id;

        const { data: partnerData, error: partnerError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", partnerId)
          .single();

        if (partnerError) {
          console.error("Error fetching partner:", partnerError);
        } else {
          setPartner(partnerData);
        }

        setLoading(false);
      } catch (error) {
        console.error("Unexpected error:", error);
        setLoading(false);
      }
    }

    fetchData();
  }, [profile]);

  useEffect(() => {
    if (!loading && relationship) {
      fillHeight.value = withTiming(relationship.chemistry_index, {
        duration: 1500,
      });
    }
  }, [loading, relationship]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: `${fillHeight.value}%`,
    };
  });

  const handleStart = () => {
    clearInvitation();
    router.push("/");
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#ECEEDF" />
      </View>
    );
  }

  if (!relationship || !partner) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-foreground">데이터를 찾을 수 없습니다.</Text>
        <TouchableOpacity
          className="mt-4 bg-foreground px-6 py-3 rounded-full"
          onPress={() => router.push("/")}
        >
          <Text className="text-background font-semibold">홈으로 가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <AnimatedPageWrapper>
      <View className="flex-1 flex-col items-center justify-between p-6 pb-10">
        <View className="mt-10 items-center">
          <Text className="text-foreground text-2xl font-semibold mb-2">
            케미스트리 분석 결과
          </Text>
          <Text className="text-pastel-gray text-base">
            {profile?.nickname}님과 {partner.nickname}님의 케미 지수
          </Text>
        </View>

        <View className="items-center justify-center flex-1 w-full">
          {/* Thermometer Container */}
          <View className="w-24 h-80 bg-foreground/10 rounded-full overflow-hidden relative border border-foreground/20 items-center justify-end p-1">
            {/* Background Gradient for Thermometer */}
            <View className="absolute w-full h-full rounded-full bg-foreground/5" />

            {/* Animated Fill */}
            <Animated.View
              className="w-full bg-red-500 rounded-b-full"
              style={[
                animatedStyle,
                {
                  width: "100%",
                  borderRadius: 40, // Match container radius
                  backgroundColor: "#FF6B6B", // Or a gradient color
                },
              ]}
            >
              <View className="w-full h-full bg-red-500 opacity-80" />
            </Animated.View>

            {/* Glass Effect Overlay (Optional) */}
            <View className="absolute w-full h-full rounded-full border border-white/10" />
          </View>

          {/* Score Display */}
          <View className="mt-8 items-center">
            <Text className="text-6xl font-bold text-foreground">
              {relationship.chemistry_index}
              <Text className="text-2xl font-normal text-pastel-gray">°C</Text>
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="w-full bg-foreground h-14 rounded-full items-center justify-center"
          activeOpacity={0.8}
          onPress={handleStart}
        >
          <Text className="text-background font-semibold text-base">
            시작하기
          </Text>
        </TouchableOpacity>
      </View>
    </AnimatedPageWrapper>
  );
}
