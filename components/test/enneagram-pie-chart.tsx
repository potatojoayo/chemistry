import { ENNEAGRAM_TYPE_DESCRIPTIONS } from "@/lib/descriptions/enneargram";
import { EnneaKey, EnneaResult, Test } from "@/lib/types";
import { useTestStore } from "@/stores/test-store";
import { Text, View } from "react-native";
import Svg, {
  Defs,
  G,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";

interface EnneagramPieChartProps {
  test: Test;
  size?: number;
  showLegend?: boolean;
}

const EnneagramPieChart = ({
  test,
  size = 300,
  showLegend = true,
}: EnneagramPieChartProps) => {
  const { tests } = useTestStore();
  const currentTest = tests.find((t) => t.id === test.id);

  if (!currentTest?.result) {
    return null;
  }

  const result = currentTest.result as EnneaResult;
  const center = size / 2;
  const radius = size * 0.35;
  const fontSize = size * 0.04;

  // 에니어그램 9개 유형과 색상 (ENNEAGRAM_TYPE_DESCRIPTIONS에서 가져옴)
  const types = Object.entries(ENNEAGRAM_TYPE_DESCRIPTIONS).map(
    ([key, description]) => ({
      key: key as EnneaKey,
      name: description.title,
      color: description.color,
    })
  );

  // 각 유형의 점수를 0-100 스케일로 변환
  const getTypeScore = (typeKey: string) => {
    const type = result.byType[typeKey as EnneaKey];
    return type ? type.total : 0;
  };

  // 전체 점수 합계
  const totalScore = types.reduce(
    (sum, type) => sum + getTypeScore(type.key),
    0
  );

  // 방사형 차트 경로 생성 (각도와 반지름이 모두 다름)
  const createPiePath = () => {
    if (totalScore === 0) return [];

    let currentAngle = -Math.PI / 2; // 12시 방향부터 시작
    const paths: {
      pathData: string;
      color: string;
      type: string;
      score: number;
      percentage: string;
      startAngle: number;
      endAngle: number;
      isExploded: boolean;
      offsetX: number;
      offsetY: number;
    }[] = [];

    const maxScore = Math.max(...types.map((type) => getTypeScore(type.key)));

    // 모든 섹션에 동일한 각도 적용
    const equalAngle =
      (2 * Math.PI) / types.filter((type) => getTypeScore(type.key) > 0).length;

    types.forEach((type) => {
      const score = getTypeScore(type.key);
      if (score <= 0) return;

      // 모든 섹션에 동일한 각도 사용
      const angle = equalAngle;

      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      // 섹션의 중간 각도
      const midAngle = (startAngle + endAngle) / 2;

      // 점수에 비례한 반지름 (점수 차이를 더 극명하게 표현)
      const radiusRatio = score / maxScore;
      // 최소 반지름을 더 작게, 최대 반지름을 더 크게 하여 차이를 극대화
      const segmentRadius = radius * 0.05 + radius * 0.95 * radiusRatio;

      // 오프셋 적용
      const offsetDistance = 4;
      const offsetX = offsetDistance * Math.cos(midAngle);
      const offsetY = offsetDistance * Math.sin(midAngle);

      // 오프셋이 적용된 중심점
      const offsetCenterX = center + offsetX;
      const offsetCenterY = center + offsetY;

      // 방사형 차트 경로 생성 (중심에서 바깥쪽으로)
      const x1 = offsetCenterX;
      const y1 = offsetCenterY;
      const x2 = offsetCenterX + segmentRadius * Math.cos(startAngle);
      const y2 = offsetCenterY + segmentRadius * Math.sin(startAngle);
      const x3 = offsetCenterX + segmentRadius * Math.cos(endAngle);
      const y3 = offsetCenterY + segmentRadius * Math.sin(endAngle);

      const largeArcFlag = angle > Math.PI ? 1 : 0;

      const pathData = [
        `M ${x1} ${y1}`, // 중심에서 시작
        `L ${x2} ${y2}`, // 첫 번째 외부 점으로
        `A ${segmentRadius} ${segmentRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}`, // 호
        "Z", // 중심으로 돌아가기
      ].join(" ");

      paths.push({
        pathData,
        color: type.color,
        type: type.key,
        score,
        percentage: ((score / totalScore) * 100).toFixed(1),
        startAngle,
        endAngle,
        isExploded: true,
        offsetX,
        offsetY,
      });

      currentAngle = endAngle;
    });

    return paths;
  };

  const piePaths = createPiePath();

  // 라벨 위치 계산 (조각 안에 배치)
  const getLabelPosition = (path: {
    pathData: string;
    color: string;
    type: string;
    score: number;
    percentage: string;
    startAngle: number;
    endAngle: number;
    isExploded: boolean;
    offsetX: number;
    offsetY: number;
  }) => {
    if (totalScore === 0) return { x: center, y: center };

    // 섹션의 중간 각도
    const midAngle = (path.startAngle + path.endAngle) / 2;

    // 오프셋된 중심을 기준으로 라벨 위치 계산
    const offsetCenterX = center + path.offsetX;
    const offsetCenterY = center + path.offsetY;

    // 조각 안의 중간 지점에 라벨 배치 (동일한 비율 적용)
    const maxScore = Math.max(...types.map((type) => getTypeScore(type.key)));
    const radiusRatio = path.score / maxScore;
    const segmentRadius = radius * 0.05 + radius * 0.95 * radiusRatio;
    const labelRadius = segmentRadius * 0.5; // 조각의 50% 지점에 배치

    const x = offsetCenterX + labelRadius * Math.cos(midAngle);
    const y = offsetCenterY + labelRadius * Math.sin(midAngle) + 4;

    return { x, y };
  };

  return (
    <View className="items-center justify-center">
      <Svg
        width={size}
        height={size}
        className=""
        style={{ transform: [{ scale: 1.4 }] }}
      >
        <Defs>
          {/* 그라디언트 정의 */}
          {types.map((type) => (
            <G key={type.key}>
              <Defs>
                <LinearGradient
                  id={`gradient-${type.key}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <Stop offset="0%" stopColor={type.color} stopOpacity="0.8" />
                  <Stop
                    offset="100%"
                    stopColor={type.color}
                    stopOpacity="0.4"
                  />
                </LinearGradient>
              </Defs>
            </G>
          ))}
        </Defs>

        {/* 파이 차트 섹션들 */}
        {piePaths.map((path, index) => {
          const labelPos = getLabelPosition(path);
          return (
            <G key={path.type}>
              <Path
                d={path.pathData}
                fill={path.color}
                stroke="#222"
                strokeWidth="1"
                opacity="0.9"
              />

              {/* 섹션 번호 라벨 */}
              <SvgText
                x={labelPos.x}
                y={labelPos.y}
                fontSize={fontSize}
                fill="#222"
                textAnchor="middle"
                fontWeight="bold"
              >
                {path.type.replace("Type", "")}
              </SvgText>
            </G>
          );
        })}
      </Svg>

      {/* 범례 */}
      {showLegend && (
        <View className="flex-row flex-wrap justify-center gap-3">
          {types.map((type, index) => {
            const score = getTypeScore(type.key);
            if (score <= 0) return null;
            const percentage =
              totalScore > 0 ? ((score / totalScore) * 100).toFixed(1) : "0.0";
            return (
              <View key={index} className="flex-row items-center gap-2">
                <View
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: type.color }}
                />
                <Text className="text-xs text-background">
                  {type.key.replace("Type", "")}-{type.name}: ({percentage}%)
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default EnneagramPieChart;
