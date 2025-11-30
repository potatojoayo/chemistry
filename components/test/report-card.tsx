import { Text, View } from "react-native";

interface ReportCardProps {
  test: string;
  title: string;
  badges: string[];
  overallEvaluation: string;
  detailEvaluations: string;
  counselingText: string;
}

export default function ReportCard({
  test,
  title,
  badges,
  overallEvaluation,
  detailEvaluations,
  counselingText,
}: ReportCardProps) {
  const formatContent = (text: string) => {
    return text.replace(/\*/g, "").replace(/:(?=[^ ])/g, ":\n");
  };

  return (
    <View className="mb-12">
      <Text className="text-pastel-gray text-sm font-medium mb-2">{test}</Text>
      <View className="bg-foreground/5 rounded-3xl p-6 border border-foreground/10">
        <Text className="text-2xl font-bold text-foreground mb-4">{title}</Text>

        <View className="flex flex-row flex-wrap items-center gap-2 mb-8">
          {badges.map((badge, index) => (
            <View
              key={index}
              className="bg-foreground/10 px-3 py-1 rounded-full"
            >
              <Text className="text-foreground font-medium text-sm">
                {badge}
              </Text>
            </View>
          ))}
        </View>

        <View className="mb-8">
          <Text className="text-xl font-bold text-foreground mb-3">
            종합 평가
          </Text>
          <Text className="text-pastel-gray text-base leading-7">
            {formatContent(overallEvaluation)}
          </Text>
        </View>

        <View className="mb-8">
          <Text className="text-xl font-bold text-foreground mb-3">
            세부 평가
          </Text>
          <Text className="text-pastel-gray text-base leading-7">
            {formatContent(detailEvaluations)}
          </Text>
        </View>

        <View>
          <Text className="text-xl font-bold text-foreground mb-3">조언</Text>
          <Text className="text-pastel-gray text-base leading-7">
            {formatContent(counselingText)}
          </Text>
        </View>
      </View>
    </View>
  );
}
