import ReportCard from "@/components/test/report-card";
import { supabase } from "@/lib/supabase";
import { ReportAAS } from "@/models/report_aas";
import { ReportFlexibility } from "@/models/report_flexibility";
import { useAuthStore } from "@/stores/auth-store";
import { FontAwesome6 } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function ReportPage() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [aasReport, setAasReport] = useState<ReportAAS | null>(null);
  const [flexibilityReport, setFlexibilityReport] =
    useState<ReportFlexibility | null>(null);
  const [error, setError] = useState<string | null>(null);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  useEffect(() => {
    if (!loading) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withTiming(0, { duration: 300 });
    }
  }, [loading]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    async function fetchResult() {
      try {
        if (!profile) {
          setError("User not found");
          setLoading(false);
          return;
        }

        if (type === "aas") {
          if (
            !profile.emotional_stability_level ||
            !profile.attachment_type
          ) {
            setError("Incomplete test results");
            setLoading(false);
            return;
          }
          const { data, error } = await supabase
            .from("report_aas")
            .select("*")
            .eq("emotional_stability_level", profile.emotional_stability_level)
            .eq("type", profile.attachment_type)
            .single();

          if (error) {
            console.error("Error fetching AAS report:", error);
            setError("Failed to load AAS report");
          } else {
            setAasReport(data as ReportAAS);
          }
        } else if (type === "flexibility") {
          if (!profile.flexibility_level) {
            setError("Incomplete test results");
            setLoading(false);
            return;
          }
          const { data, error } = await supabase
            .from("report_flexibility")
            .select("*")
            .eq("flexibility_level", profile.flexibility_level)
            .single();

          if (error) {
            console.error("Error fetching flexibility report:", error);
            setError("Failed to load flexibility report");
          } else {
            setFlexibilityReport(data as ReportFlexibility);
          }
        } else {
            setError("Invalid report type");
        }

      } catch (e) {
        console.error("Unexpected error:", e);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
  }, [profile, type]);


  if (!loading && (error || (!aasReport && !flexibilityReport))) {
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
      <View className="flex-1 flex-col bg-background">
        {/* Header */}
        <View className="flex flex-row items-center justify-between px-4 h-14 border-b border-pastel-gray/10">
          <Pressable onPress={() => router.back()} className="p-2">
            <FontAwesome6 name="chevron-left" size={20} color="#ECEEDF" />
          </Pressable>
          <Text className="text-foreground font-semibold text-lg">
            {type === "aas" ? "성인 애착 유형" : "정서적 유연성"}
          </Text>
          <View className="w-9" />
        </View>
        {!loading && (
          <Animated.View style={[{ flex: 1 }, animatedStyle]}>
            <ScrollView
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
              className="flex-1"
            >
              {type === "aas" && aasReport && (
                <ReportCard
                  test="성인 애착 유형"
                  title={aasReport.title}
                  badges={[
                    "유형: " + aasReport.type_text,
                    "마음 평온도: " + aasReport.emotional_stability_text,
                  ]}
                  overallEvaluation={aasReport.overall_evaluation}
                  detailEvaluations={aasReport.detail_evaluations}
                  counselingText={aasReport.counseling_text}
                />
              )}

              {type === "flexibility" && flexibilityReport && (
                <ReportCard
                  test="정서적 유연성"
                  title={flexibilityReport.title}
                  badges={[
                    "유연성: " +
                      profile?.flexibility_percentage?.toFixed(1) +
                      "%",
                  ]}
                  overallEvaluation={flexibilityReport.overall_evaluation}
                  detailEvaluations={flexibilityReport.detail_evaluation}
                  counselingText={flexibilityReport.counseling_text}
                />
              )}
            </ScrollView>
          </Animated.View>
        )}
      </View>
  );
}

