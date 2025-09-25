import { Big5Result, Test } from "@/lib/types";
import { useTestStore } from "@/stores/test-store";
import { Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Polygon,
  Stop,
  Text as SvgText,
} from "react-native-svg";

interface Big5RadarChartProps {
  test: Test;
  size?: number;
  showLegend?: boolean;
}

const Big5RadarChart = ({
  test,
  size = 240,
  showLegend = true,
}: Big5RadarChartProps) => {
  const { tests } = useTestStore();
  const currentTest = tests.find((t) => t.id === test.id);

  if (!currentTest?.result) {
    return null;
  }

  const result = currentTest.result as Big5Result;
  const center = size / 2;
  const radius = size * 0.35;

  // Big5 특성들
  const traits = [
    { key: "O", name: "개방성", color: "#FF6B6B" },
    { key: "C", name: "성실성", color: "#4ECDC4" },
    { key: "E", name: "외향성", color: "#45B7D1" },
    { key: "A", name: "친화성", color: "#96CEB4" },
    { key: "N", name: "신경성", color: "#FFEAA7" },
  ];

  // 각 특성의 점수를 0-100 스케일로 변환
  const getTraitScore = (traitKey: string) => {
    const trait = result.byTrait[traitKey as keyof typeof result.byTrait];
    return trait ? trait.scaled0to100 : 0;
  };

  // 각 점을 계산하는 함수
  const getPoint = (index: number, score: number) => {
    const angle = (index * 2 * Math.PI) / traits.length - Math.PI / 2;
    const distance = (score / 100) * radius;
    const x = center + distance * Math.cos(angle);
    const y = center + distance * Math.sin(angle);
    return { x, y };
  };

  // 다각형 경로 생성
  const createPolygonPath = () => {
    const points = traits.map((trait, index) => {
      const score = getTraitScore(trait.key);
      const point = getPoint(index, score);
      return `${point.x},${point.y}`;
    });
    return points.join(" ");
  };

  // 그리드 라인 생성
  const createGridLines = () => {
    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
    return gridLevels.map((level, levelIndex) => {
      const points = traits.map((_, index) => {
        const point = getPoint(index, level * 100);
        return `${point.x},${point.y}`;
      });
      return (
        <Polygon
          key={levelIndex}
          points={points.join(" ")}
          fill="none"
          stroke="#333"
          strokeWidth="1"
          opacity={0.3}
        />
      );
    });
  };

  // 축 라인 생성
  const createAxisLines = () => {
    return traits.map((_, index) => {
      const point = getPoint(index, 100);
      return (
        <Line
          key={index}
          x1={center}
          y1={center}
          x2={point.x}
          y2={point.y}
          stroke="#333"
          strokeWidth="1"
          opacity={0.3}
        />
      );
    });
  };

  // 라벨 생성
  const createLabels = () => {
    return traits.map((trait, index) => {
      const point = getPoint(index, 126); // 라벨을 더 멀리 떨어뜨림
      const score = getTraitScore(trait.key);
      return (
        <G key={index}>
          <SvgText
            x={point.x}
            y={point.y}
            fontSize="12"
            fill="#222"
            fontWeight="bold"
            textAnchor="middle"
          >
            {trait.name}
          </SvgText>
          <SvgText
            x={point.x}
            y={point.y + 13}
            fontSize="11"
            fill="#222"
            textAnchor="middle"
          >
            {Math.round(score)}
          </SvgText>
        </G>
      );
    });
  };

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient
            id="radarGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop offset="0%" stopColor="#5AAEFF" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#5AAEFF" stopOpacity="0.1" />
          </LinearGradient>
        </Defs>

        {/* 그리드 라인 */}
        {createGridLines()}

        {/* 축 라인 */}
        {createAxisLines()}

        {/* 중앙 원 */}
        <Circle cx={center} cy={center} r="3" fill="#222" />

        {/* 데이터 다각형 면 */}
        <Polygon
          points={createPolygonPath()}
          fill="#222"
          fillOpacity={0.4}
          stroke="#222"
          strokeWidth="2"
        />

        {/* 데이터 포인트들 */}
        {traits.map((trait, index) => {
          const score = getTraitScore(trait.key);
          const point = getPoint(index, score);
          return (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#222"
              strokeWidth="2"
            />
          );
        })}

        {/* 라벨들 */}
        {createLabels()}
      </Svg>

      {/* 범례 */}
      {showLegend && (
        <View className="mt-4 flex-row flex-wrap justify-center gap-3">
          {traits.map((trait, index) => {
            const score = getTraitScore(trait.key);
            return (
              <View key={index} className="flex-row items-center gap-1">
                <View className="w-1.5 h-1.5 rounded-full bg-background" />
                <Text className="text-xs text-background">
                  {trait.name}: {Math.round(score)}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default Big5RadarChart;
