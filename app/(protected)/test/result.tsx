import AnimatedPageWrapper from "@/components/common/animated-page-wrapper";
import ReportCard from "@/components/test/report-card";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/models/profile";
import { ReportAAS } from "@/models/report_aas";
import { ReportFlexibility } from "@/models/report_flexibility";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TestResult() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<ReportAAS | null>(null);
  const [flexibilityReport, setFlexibilityReport] =
    useState<ReportFlexibility | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResult() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("사용자 정보를 찾을 수 없습니다.");
          setLoading(false);
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (profileError || !profileData) {
          console.error("Error fetching profile:", profileError);
          setError("프로필을 불러오는데 실패했습니다.");
          setLoading(false);
          return;
        }

        setProfile(profileData);

        if (
          !profileData.emotional_stability_level ||
          !profileData.attachment_type ||
          !profileData.flexibility_level
        ) {
          setError("테스트 결과가 완전하지 않습니다.");
          setLoading(false);
          return;
        }

        console.log("Querying reports with:", {
          level: profileData.emotional_stability_level,
          type: profileData.attachment_type,
          flexibility: profileData.flexibility_level,
        });

        const [aasResult, flexibilityResult] = await Promise.all([
          supabase
            .from("report_aas")
            .select("*")
            .eq(
              "emotional_stability_level",
              profileData.emotional_stability_level
            )
            .eq("type", profileData.attachment_type)
            .single(),
          supabase
            .from("report_flexibility")
            .select("*")
            .eq("flexibility_level", profileData.flexibility_level)
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

    fetchResult();
  }, []);

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
        <Text className="text-foreground">{error || "보고서를 찾을 수 없습니다."}</Text>
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
              "마음 평온도: " + report.emotional_stability_text,
            ]}
            overallEvaluation={report.overall_evaluation}
            detailEvaluations={report.detail_evaluations}
            counselingText={report.counseling_text}
          />

          <ReportCard
            test="정서적 유연성"
            title={flexibilityReport.title}
            badges={[
             "유연성: " + profile?.flexibility_percentage?.toFixed(1) +'%',
            ]}
            overallEvaluation={flexibilityReport.overall_evaluation}
            detailEvaluations={flexibilityReport.detail_evaluation}
            counselingText={flexibilityReport.counseling_text}
          />

          <TouchableOpacity
            className="w-full bg-foreground h-14 rounded-full items-center justify-center mt-4"
            activeOpacity={0.8}
            onPress={() => router.push('/')}
          >
            <Text className="text-background font-semibold text-base">
              시작하기
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </AnimatedPageWrapper>
  );
}
