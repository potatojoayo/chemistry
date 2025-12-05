import ReportCard from "@/components/test/report-card";
import {
  Profile,
  Relationship,
  ReportChemistry,
  ReportPassion,
  ReportTikitaka,
} from "@/db/schema";
import { useEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface ChemistryResultViewProps {
  relationship: Relationship;
  partner: Profile;
  myProfile: Profile | null;
  chemistryReport: ReportChemistry | null;
  passionReport: ReportPassion | null;
  tikitakaReport: ReportTikitaka | null;
  children?: React.ReactNode;
}

export default function ChemistryResultView({
  relationship,
  partner,
  myProfile,
  chemistryReport,
  passionReport,
  tikitakaReport,
  children,
}: ChemistryResultViewProps) {
  const fillHeight = useSharedValue(0);

  useEffect(() => {
    fillHeight.value = withTiming(relationship.chemistry_index, {
      duration: 1500,
    });
  }, [relationship]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: `${fillHeight.value}%`,
    };
  });

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View className="flex-1 flex-col items-center justify-between p-4">
        <View className="mt-4 items-center">
          <Text className="text-foreground text-2xl font-semibold mb-2">
            케미스트리 분석 결과
          </Text>
          <Text className="text-pastel-gray text-base">
            {myProfile?.nickname}님과 {partner.nickname}님의 케미 지수
          </Text>
        </View>

        <View className="items-center justify-center w-full my-10">
          {/* Thermometer Container */}
          <View className="w-24 h-80 bg-foreground/10 rounded-full overflow-hidden relative justify-end">
            {/* Animated Fill */}
            <Animated.View
              className="w-full bg-[#FF6B6B]"
              style={[
                animatedStyle,
                {
                  width: "100%",
                },
              ]}
            />
          </View>

          {/* Score Display */}
          <View className="mt-8 items-center">
            <Text className="text-6xl font-bold text-foreground">
              {relationship.chemistry_index.toFixed(1)}
              <Text className="text-2xl font-normal text-pastel-gray">°C</Text>
            </Text>
          </View>
        </View>

        {/* Reports */}
        <View className="w-full">
          {chemistryReport && (
            <ReportCard
              test="케미스트리 종합"
              title={chemistryReport.title}
              badges={[]}
              overallEvaluation={chemistryReport.overall_evaluation}
              detailEvaluations={chemistryReport.detail_evaluations}
              counselingText={chemistryReport.counseling_text}
            />
          )}

          {passionReport && (
            <ReportCard
              test="열정 유형"
              title={passionReport.title}
              badges={[
                `나의 유형: ${passionReport.male_passion_type}`, // Assuming male/female logic is handled or generic
                `상대방 유형: ${passionReport.female_passion_type}`,
              ]}
              overallEvaluation={passionReport.overall_evaluation}
              detailEvaluations={passionReport.detail_evaluations}
              counselingText={passionReport.counseling_text}
            />
          )}

          {tikitakaReport && (
            <ReportCard
              test="티키타카 지수"
              title={tikitakaReport.title}
              badges={[`점수: ${relationship.tikitaka_index.toFixed(0)}점`]}
              overallEvaluation={tikitakaReport.overall_evaluation}
              detailEvaluations={tikitakaReport.detail_evaluations}
              counselingText={tikitakaReport.counseling_text}
            />
          )}
        </View>

        {children}
      </View>
    </ScrollView>
  );
}
