import RadarChart from "@/components/chart/radar-chart";
import SummaryCard from "@/components/chart/summary-card";
import TabPageWrapper from "@/components/common/tab-page-wrapper";
import { supabase } from "@/lib/supabase";
import { ReportAAS } from "@/models/report_aas";
import { ReportFlexibility } from "@/models/report_flexibility";
import { useAuthStore } from "@/stores/auth-store";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function Chart() {
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [aasReport, setAasReport] = useState<ReportAAS | null>(null);
  const [flexibilityReport, setFlexibilityReport] =
    useState<ReportFlexibility | null>(null);

  useEffect(() => {
    async function fetchReports() {
      if (
        !profile?.emotional_stability_level ||
        !profile?.attachment_type ||
        !profile?.flexibility_level
      ) {
        setLoading(false);
        return;
      }

      try {
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

        if (aasResult.data) setAasReport(aasResult.data as ReportAAS);
        if (flexibilityResult.data)
          setFlexibilityReport(flexibilityResult.data as ReportFlexibility);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [profile]);

  if (!profile) return null;

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#ECEEDF" />
      </View>
    );
  }

  const big5Data = [
    {
      label: "개방성",
      value: Math.round(((profile.openness ?? 0) / 5) * 100),
      color: "#222",
    },
    {
      label: "성실성",
      value: Math.round(((profile.conscientiousness ?? 0) / 5) * 100),
      color: "#222",
    },
    {
      label: "외향성",
      value: Math.round(((profile.extraversion ?? 0) / 5) * 100),
      color: "#222",
    },
    {
      label: "친밀성",
      value: Math.round(((profile.agreeableness ?? 0) / 5) * 100),
      color: "#222",
    },
    {
      label: "신경성",
      value: Math.round(((profile.neuroticism ?? 0) / 5) * 100),
      color: "#222",
    },
  ];

  return (
    <TabPageWrapper>
      <ScrollView className="flex flex-col">
        <Animated.View entering={FadeInDown.springify().duration(300)} className="p-3 pt-1">
          <View className="flex flex-row gap-3">
            <View className="flex flex-col p-5 rounded-2xl bg-foreground flex-1 shadow-lg">
              <View className="w-full border-t"></View>
              <Text className="text-xs">BIG 5</Text>
              <View className="flex items-center justify-center mt-4">
                <RadarChart data={big5Data} size={220} />
              </View>
            </View>
          </View>
          <View className="flex flex-row gap-3 mt-3">
            {aasReport && (
              <SummaryCard
                label="애착 유형"
                value={aasReport.type_text}
                subValue={"마음평온도: " + aasReport.emotional_stability_text}
                colorClass="bg-foreground/5"
                onPress={() => router.push("/report/aas")}
              />
            )}
            {flexibilityReport && (
              <SummaryCard
                label="정서적 유연성"
                value={flexibilityReport.flexibility_label}
                subValue={
                  "유연성: " +
                  profile.flexibility_percentage?.toFixed(1) +
                  "%"
                }
                colorClass="bg-foreground/5"
                onPress={() => router.push("/report/flexibility")}
              />
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </TabPageWrapper>
  );
}
