import AnimatedPageWrapper from "@/components/common/animated-page-wrapper";
import ReportCard from "@/components/test/report-card";
import { supabase } from "@/lib/supabase";
import { ReportAAS } from "@/models/report_aas";
import { ReportFlexibility } from "@/models/report_flexibility";
import { useAuthStore } from "@/stores/auth-store";
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
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<ReportAAS | null>(null);
  const [flexibilityReport, setFlexibilityReport] =
    useState<ReportFlexibility | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResult() {
      try {
        if (!profile) {
          setError("User not found");
          setLoading(false);
          return;
        }

        if (
          !profile.emotional_stability_level ||
          !profile.attachment_type ||
          !profile.flexibility_level
        ) {
          setError("Incomplete test results");
          setLoading(false);
          return;
        }

        console.log("Querying reports with:", {
          level: profile.emotional_stability_level,
          type: profile.attachment_type,
          flexibility: profile.flexibility_level,
        });

        const [aasResult, flexibilityResult] = await Promise.all([
          supabase
            .from("report_aas")
            .select("*")
            .eq("emotional_stability_level", profile.emotional_stability_level)
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
          setError("Failed to load AAS report");
          return;
        }

        if (flexibilityResult.error) {
          console.error(
            "Error fetching flexibility report:",
            flexibilityResult.error
          );
          setError("Failed to load flexibility report");
          return;
        }

        setReport(aasResult.data as ReportAAS);
        setFlexibilityReport(flexibilityResult.data as ReportFlexibility);
      } catch (e) {
        console.error("Unexpected error:", e);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
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
        <Text className="text-foreground">{error || "No report found"}</Text>
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
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
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
