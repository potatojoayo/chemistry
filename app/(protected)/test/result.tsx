import AnimatedPageWrapper from "@/components/common/animated-page-wrapper";
import ReportCard from "@/components/test/report-card";
import { Profile, ReportAAS, ReportFlexibility } from "@/db/schema";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import { useInvitationStore } from "@/stores/invitation-store";
import { RelativePathString, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TestResult() {
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<ReportAAS | null>(null);
  const [flexibilityReport, setFlexibilityReport] =
    useState<ReportFlexibility | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { inviterProfileId, clearInvitation } = useInvitationStore();
  const [inviterProfile, setInviterProfile] = useState<Profile | null>(null);
  const { authRedirectPath, setAuthRedirectPath } = useAuthStore();
  const [relationshipId, setRelationshipId] = useState<string | null>(null);

  useEffect(() => {
    if (inviterProfileId && profile) {
      supabase
        .from("profiles")
        .select("*")
        .eq("id", inviterProfileId)
        .is("deleted_at", null)
        .single()
        .then(({ data }) => {
          if (data) {
            setInviterProfile(data);
          }
        });

      supabase
        .from("relationships")
        .select("id")
        .or(
          `and(inviter_profile_id.eq.${profile.id},invitee_profile_id.eq.${inviterProfileId}),and(inviter_profile_id.eq.${inviterProfileId},invitee_profile_id.eq.${profile.id})`
        )
        .is("deleted_at", null)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setRelationshipId(data.id);
          }
        });
    }
  }, [inviterProfileId, profile]);

  const handleClickNext = () => {
    if (inviterProfile && relationshipId) {
      clearInvitation();
      router.push(`/test/chemistry/${relationshipId}`);
    } else {
      if (authRedirectPath) {
        router.push(authRedirectPath as RelativePathString);
        setAuthRedirectPath(null);
        return;
      }
      router.push("/");
    }
  };

  useEffect(() => {
    async function fetchReports() {
      if (!profile) return;

      try {
        if (
          !profile.emotional_flexibility_level ||
          !profile.attachment_type ||
          !profile.flexibility_level
        ) {
          setError("테스트 결과가 완전하지 않습니다.");
          setLoading(false);
          return;
        }

        console.log("Querying reports with:", {
          level: profile.emotional_flexibility_level,
          type: profile.attachment_type,
          flexibility: profile.flexibility_level,
        });

        const [aasResult, flexibilityResult] = await Promise.all([
          supabase
            .from("report_aas")
            .select("*")
            .eq(
              "emotional_flexibility_level",
              profile.emotional_flexibility_level
            )
            .eq("type", profile.attachment_type)
            .single(),
          supabase
            .from("report_flexibility")
            .select("*")
            .eq("flexibility_level", profile.flexibility_level)
            .single(),
        ]);

        if (aasResult.error) {
          console.error("Error fetching AAS report:", aasResult.error);
          setError("애착 유형 보고서를 불러오는데 실패했습니다.");
          return;
        }

        if (flexibilityResult.error) {
          console.error(
            "Error fetching flexibility report:",
            flexibilityResult.error
          );
          setError("유연성 보고서를 불러오는데 실패했습니다.");
          return;
        }

        setReport(aasResult.data as ReportAAS);
        setFlexibilityReport(flexibilityResult.data as ReportFlexibility);
      } catch (e) {
        console.error("Unexpected error:", e);
        setError("알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [profile]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#ECEEDF" />
      </View>
    );
  }

  if (error || !report || !flexibilityReport) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-foreground">
          {error || "보고서를 찾을 수 없습니다."}
        </Text>
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
      <View className="flex-1 flex-col">
        {/* Header */}
        <View className="flex flex-row items-center justify-center px-4 h-14 border-b border-pastel-gray/10">
          <Text className="text-foreground font-semibold text-lg">
            나의 마음 보고서
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          className="flex-1"
        >
          <ReportCard
            test="성인 애착 유형"
            title={report.title}
            badges={[
              "유형: " + report.type_text,
              "마음 평온도: " + report.emotional_flexibility_text,
            ]}
            overallEvaluation={report.overall_evaluation}
            detailEvaluations={report.detail_evaluations}
            counselingText={report.counseling_text}
          />

          <ReportCard
            test="정서적 유연성"
            title={flexibilityReport.title}
            badges={[
              "유연성: " + profile?.flexibility_percentage?.toFixed(1) + "%",
            ]}
            overallEvaluation={flexibilityReport.overall_evaluation}
            detailEvaluations={flexibilityReport.detail_evaluation}
            counselingText={flexibilityReport.counseling_text}
          />

          <TouchableOpacity
            className="w-full bg-foreground h-14 rounded-full items-center justify-center mt-4"
            activeOpacity={0.8}
            onPress={handleClickNext}
          >
            <Text className="text-background font-semibold text-base">
              {inviterProfile
                ? `${inviterProfile.nickname}님과의 케미스트리 확인하기`
                : "시작하기"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </AnimatedPageWrapper>
  );
}
