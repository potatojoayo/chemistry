import ChemistryResultView from "@/components/chemistry/chemistry-result-view";
import AnimatedPageWrapper from "@/components/common/animated-page-wrapper";
import {
  Profile,
  Relationship,
  ReportChemistry,
  ReportPassion,
  ReportTikitaka,
} from "@/db/schema";
import { supabase } from "@/lib/supabase";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PublicChemistryPage() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [chemistryReport, setChemistryReport] =
    useState<ReportChemistry | null>(null);
  const [passionReport, setPassionReport] = useState<ReportPassion | null>(
    null
  );
  const [tikitakaReport, setTikitakaReport] = useState<ReportTikitaka | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      try {
        // Fetch specific relationship
        const { data: relData, error: relError } = await supabase
          .from("relationships")
          .select("*")
          .eq("id", id)
          .single();

        if (relError) {
          console.error("Error fetching relationship:", relError);
          setError("Relationship not found");
          setLoading(false);
          return;
        }

        setRelationship(relData);

        // Fetch profiles
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .in("id", [relData.inviter_profile_id, relData.invitee_profile_id]);

        if (profilesError || !profiles || profiles.length !== 2) {
          console.error("Error fetching profiles:", profilesError);
          setError("Profiles not found");
          setLoading(false);
          return;
        }

        // Assign profiles (arbitrarily assign one as 'myProfile' and other as 'partner' for display)
        // Or we could just pass them as is. ChemistryResultView expects myProfile and partner.
        // Let's assign inviter as myProfile and invitee as partner for consistency.
        const inviter = profiles.find(
          (p) => p.id === relData.inviter_profile_id
        );
        const invitee = profiles.find(
          (p) => p.id === relData.invitee_profile_id
        );

        if (inviter) setMyProfile(inviter);
        if (invitee) setPartner(invitee);

        // Fetch Reports
        const [chemRes, passionRes, tikitakaRes] = await Promise.all([
          supabase
            .from("report_chemistry")
            .select("*")
            .eq("aas_level", relData.aas_level)
            .eq("big_5_level", relData.big_5_level)
            .eq("flexibility_level", relData.flexibility_level)
            .single(),
          supabase
            .from("report_passion")
            .select("*")
            .eq("type_number", relData.passion_type_number)
            .single(),
          supabase
            .from("report_tikitaka")
            .select("*")
            .lte("min_index", Math.round(relData.tikitaka_index))
            .gte("max_index", Math.round(relData.tikitaka_index))
            .order("min_index", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        if (chemRes.data) setChemistryReport(chemRes.data);
        if (passionRes.data) setPassionReport(passionRes.data);
        if (tikitakaRes.data) setTikitakaReport(tikitakaRes.data);

        setLoading(false);
      } catch (error) {
        console.error("Unexpected error:", error);
        setError("An unexpected error occurred");
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#ECEEDF" />
      </View>
    );
  }

  if (error || !relationship || !partner || !myProfile) {
    return (
      <View className="flex-1 justify-center items-center bg-background p-4">
        <Text className="text-foreground text-lg mb-4">
          {error || "데이터를 찾을 수 없습니다."}
        </Text>
        <TouchableOpacity
          className="bg-foreground px-6 py-3 rounded-full"
          onPress={() => router.push("/")}
        >
          <Text className="text-background font-semibold">홈으로 가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <AnimatedPageWrapper>
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 h-12 border-b border-pastel-gray/10">
        <Pressable onPress={() => router.push("/")}>
          <Image
            source={require("@/assets/images/logo-foreground.png")}
            style={{ width: 100, height: 32 }}
            contentFit="contain"
          />
        </Pressable>
      </View>

      <View style={{ flex: 1 }}>
        <ChemistryResultView
          relationship={relationship}
          partner={partner}
          myProfile={myProfile}
          chemistryReport={chemistryReport}
          passionReport={passionReport}
          tikitakaReport={tikitakaReport}
        >
          <TouchableOpacity
            className="w-full bg-foreground h-14 rounded-full items-center justify-center"
            activeOpacity={0.8}
            onPress={() => router.push("/")}
          >
            <Text className="text-background font-semibold text-base">
              나도 테스트 하러가기
            </Text>
          </TouchableOpacity>
        </ChemistryResultView>
      </View>
    </AnimatedPageWrapper>
  );
}
