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
import { useAuthStore } from "@/stores/auth-store";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export default function TestChemistryResultPage() {
  const { id } = useLocalSearchParams();
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [chemistryReport, setChemistryReport] =
    useState<ReportChemistry | null>(null);
  const [passionReport, setPassionReport] = useState<ReportPassion | null>(
    null
  );
  const [tikitakaReport, setTikitakaReport] = useState<ReportTikitaka | null>(
    null
  );

  useEffect(() => {
    async function fetchData() {
      if (!profile || !id) return;

      try {
        // Fetch specific relationship
        const { data: relData, error: relError } = await supabase
          .from("relationships")
          .select("*")
          .eq("id", id)
          .single();

        if (relError) {
          console.error("Error fetching relationship:", relError);
          setLoading(false);
          return;
        }

        setRelationship(relData);

        // Fetch partner profile
        const partnerId =
          relData.inviter_profile_id === profile.id
            ? relData.invitee_profile_id
            : relData.inviter_profile_id;

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
        setLoading(false);
      }
    }

    fetchData();
  }, [profile, id]);

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
          onPress={() => router.back()}
        >
          <Text className="text-background font-semibold">돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <AnimatedPageWrapper>
      <ChemistryResultView
        relationship={relationship}
        partner={partner}
        myProfile={profile}
        chemistryReport={chemistryReport}
        passionReport={passionReport}
        tikitakaReport={tikitakaReport}
      >
        <TouchableOpacity
          className="w-full bg-foreground h-14 rounded-full items-center justify-center mt-6"
          activeOpacity={0.8}
          onPress={() => router.push("/")}
        >
          <Text className="text-background font-semibold text-base">
            시작하기
          </Text>
        </TouchableOpacity>
      </ChemistryResultView>
    </AnimatedPageWrapper>
  );
}
