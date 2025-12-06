import AnimatedPageWrapper from "@/components/common/animated-page-wrapper";
import ReportCard from "@/components/test/report-card";
import { ReportAAS, ReportFlexibility } from "@/db/schema";
import { supabase } from "@/lib/supabase";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PublicCombinedReportPage() {
  const { profileId } = useLocalSearchParams<{
    profileId: string;
  }>();
  const [loading, setLoading] = useState(true);
  const [aasReport, setAasReport] = useState<ReportAAS | null>(null);
  const [flexibilityReport, setFlexibilityReport] =
    useState<ReportFlexibility | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [flexibilityPercentage, setFlexibilityPercentage] = useState<
    number | null
  >(null);

  useEffect(() => {
    async function fetchResult() {
      try {
        if (!profileId) {
          setError("User not found");
          setLoading(false);
          return;
        }

        // Fetch Profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", profileId)
          .single();

        if (profileError || !profile) {
          setError("Profile not found");
          setLoading(false);
          return;
        }

        setNickname(profile.nickname);
        setAvatarUrl(profile.avatar_url);
        setFlexibilityPercentage(profile.flexibility_percentage);

        const promises = [];

        // Fetch AAS Report
        if (profile.emotional_flexibility_level && profile.attachment_type) {
          promises.push(
            supabase
              .from("report_aas")
              .select("*")
              .eq(
                "emotional_flexibility_level",
                profile.emotional_flexibility_level
              )
              .eq("type", profile.attachment_type)
              .limit(1)
              .maybeSingle()
              .then(({ data, error }) => {
                if (error) console.error("Error fetching AAS report:", error);
                if (data) setAasReport(data as ReportAAS);
              })
          );
        }

        // Fetch Flexibility Report
        if (profile.flexibility_level) {
          promises.push(
            supabase
              .from("report_flexibility")
              .select("*")
              .eq("flexibility_level", profile.flexibility_level)
              .limit(1)
              .maybeSingle()
              .then(({ data, error }) => {
                if (error)
                  console.error("Error fetching flexibility report:", error);
                if (data) setFlexibilityReport(data as ReportFlexibility);
              })
          );
        }

        await Promise.all(promises);
      } catch (e) {
        console.error("Unexpected error:", e);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
  }, [profileId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#ECEEDF" />
      </View>
    );
  }

  if (error || (!aasReport && !flexibilityReport)) {
    return (
      <View className="flex-1 bg-background flex-col items-center justify-center p-4">
        <Text className="text-foreground text-lg mb-4">
          {error || "No report found"}
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

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        className="flex-1"
      >
        <View className="items-center mb-8 mt-4">
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: 80, height: 80, borderRadius: 40 }}
            contentFit="cover"
          />
          <Text className="mt-3">
            <Text className="text-foreground text-xl font-semibold">
              {nickname}
            </Text>
            <Text className="text-foreground text-base font-normal ml-1">
              님의
            </Text>
          </Text>
          <Text className="text-foreground text-base text-center">
            마음 보고서
          </Text>
        </View>

        {aasReport && (
          <View>
            <ReportCard
              test="성인 애착 유형"
              title={aasReport.title}
              badges={[
                "유형: " + aasReport.type_text,
                "마음 평온도: " + aasReport.emotional_flexibility_text,
              ]}
              overallEvaluation={aasReport.overall_evaluation}
              detailEvaluations={aasReport.detail_evaluations}
              counselingText={aasReport.counseling_text}
            />
          </View>
        )}

        {flexibilityReport && (
          <View>
            <ReportCard
              test="정서적 유연성"
              title={flexibilityReport.title}
              badges={["유연성: " + flexibilityPercentage?.toFixed(1) + "%"]}
              overallEvaluation={flexibilityReport.overall_evaluation}
              detailEvaluations={flexibilityReport.detail_evaluation}
              counselingText={flexibilityReport.counseling_text}
            />
          </View>
        )}

        <TouchableOpacity
          className="w-full bg-foreground h-14 rounded-full items-center justify-center mt-6"
          activeOpacity={0.8}
          onPress={() => router.push("/")}
        >
          <Text className="text-background font-semibold text-base">
            나도 테스트 하러가기
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </AnimatedPageWrapper>
  );
}
