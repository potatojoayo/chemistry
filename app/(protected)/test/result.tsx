import AnimatedPageWrapper from "@/components/common/animated-page-wrapper";
import ReportCard from "@/components/test/report-card";
import { supabase } from "@/lib/supabase";
import { ReportAAS } from "@/models/report_aas";
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResult() {
      try {
        if (!profile) {
          setError("User not found");
          setLoading(false);
          return;
        }

        if (!profile.emotional_stability_level || !profile.attachment_type) {
          setError("Incomplete test results");
          setLoading(false);
          return;
        }

        console.log("Querying report_aas with:", {
          level: profile.emotional_stability_level,
          type: profile.attachment_type,
        });

        const { data: reportData, error: reportError } = await supabase
          .from("report_aas")
          .select("*")
          .eq("emotional_stability_level", profile.emotional_stability_level)
          .eq("type", profile.attachment_type)
          .single();

        if (reportError) {
          console.error("Error fetching report:", reportError);
          setError("Failed to load report");
          return;
        }

        setReport(reportData as ReportAAS);
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

  if (error || !report) {
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
            badges={[report.type_text, report.emotional_stability_text]}
            overallEvaluation={report.overall_evaluation}
            detailEvaluations={report.detail_evaluations}
            counselingText={report.counseling_text}
          />

          <TouchableOpacity
            className="w-full bg-foreground h-14 rounded-full items-center justify-center mt-4"
            activeOpacity={0.8}
            onPress={() => router.dismissAll()}
          >
            <Text className="text-background font-semibold text-base">
              확인
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </AnimatedPageWrapper>
  );
}
