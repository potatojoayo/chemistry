import { DiscKey, DiscResult, Test } from "@/lib/types";
import { useTestStore } from "@/stores/test-store";
import { Text, View } from "react-native";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  Path,
  Text as SvgText,
} from "react-native-svg";

interface DiscCircleChartProps {
  test: Test;
  size?: number;
  showLegend?: boolean;
}

const DiscCircleChart = ({
  test,
  size = 300,
  showLegend = true,
}: DiscCircleChartProps) => {
  const { tests } = useTestStore();
  const currentTest = tests.find((t) => t.id === test.id);

  if (!currentTest?.result) {
    return null;
  }

  const result = currentTest.result as DiscResult;
  const center = size / 2;
  const radius = size * 0.35;
  const fontSize = size * 0.1;

  // DISC 4개 유형과 색상
  const discTypes = [
    {
      key: "D" as DiscKey,
      name: "Dominance",
      color: "#4CAF50", // 초록
      position: "top-left",
    },
    {
      key: "I" as DiscKey,
      name: "Influence",
      color: "#FF6B35", // 주황/빨강
      position: "top-right",
    },
    {
      key: "S" as DiscKey,
      name: "Steadiness",
      color: "#87CEEB", // 연한 파랑
      position: "bottom-right",
    },
    {
      key: "C" as DiscKey,
      name: "Conscientiousness",
      color: "#FFD700", // 노랑/금색
      position: "bottom-left",
    },
  ];

  // 각 유형의 점수 가져오기
  const getTypeScore = (typeKey: DiscKey) => {
    return result.byStyle[typeKey]?.total || 0;
  };

  // 사용자 위치 계산 (DISC 좌표계)
  const dScore = getTypeScore("D");
  const iScore = getTypeScore("I");
  const sScore = getTypeScore("S");
  const cScore = getTypeScore("C");

  // DISC 좌표계: S가 높으면 아래쪽, I가 높으면 오른쪽
  const x = (iScore - cScore) / 25;
  const y = (sScore - dScore) / 25; // S가 높으면 양수, D가 높으면 음수

  // S가 primary일 때 확실히 S 사분면(bottom-right)에 위치하도록 조정
  const maxScore = Math.max(dScore, iScore, sScore, cScore);
  const isS = sScore === maxScore;

  let adjustedX = x;
  let adjustedY = y;

  if (isS) {
    // S가 primary면 확실히 오른쪽 아래로
    adjustedX = Math.max(x, 0.3); // 최소 0.3 (오른쪽)
    adjustedY = Math.max(y, 0.3); // 최소 0.3 (아래쪽)
  }

  const userX = center + adjustedX * radius * 0.7;
  const userY = center + adjustedY * radius * 0.7;

  // 메인 원 중심에서 User 점을 향한 선이 원주와 만나는 점 계산
  const getShadeCenter = () => {
    // User 점 방향의 단위 벡터
    const dx = userX - center;
    const dy = userY - center;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 단위 벡터 (User 점 방향)
    const unitX = dx / distance;
    const unitY = dy / distance;

    // 원 테두리와 만나는 점 (User 점 방향)
    const borderX = center + unitX * radius;
    const borderY = center + unitY * radius;

    return { x: borderX, y: borderY };
  };

  const shadeCenter = getShadeCenter();
  const shadeCenterX = shadeCenter.x;
  const shadeCenterY = shadeCenter.y;

  // 각도/좌표 유틸
  const rad = (deg: number) => (Math.PI / 180) * deg;
  const toScreen = (angleDeg: number) => ({
    x: center + radius * Math.cos(rad(angleDeg)),
    y: center - radius * Math.sin(rad(angleDeg)), // 화면 좌표: y는 -sin
  });

  // primary와 neighbor(인접/반대) 조합에 따른 시작각과 부호
  // 경계 각도: I–S=0°, I–D=90°, D–C=180°, C–S=270°
  const angleTowardNeighbor = (
    primary: DiscKey,
    neighbor: DiscKey,
    t: number
  ) => {
    const span = 90; // 이웃 사분면으로 최대 회전각(기본 90°). 45°로 제한하고 싶으면 45로 바꿔도 됨.
    switch (primary) {
      case "S":
        if (neighbor === "I") return 0 + span * t; // 0° → +90°
        if (neighbor === "C") return 270 - span * t; // 270° → 180°
        break;
      case "I":
        if (neighbor === "D") return 90 + span * t; // 90° → 180°
        if (neighbor === "S") return 0 - span * t; // 0° → -90°(=270°)
        break;
      case "D":
        if (neighbor === "I") return 90 - span * t; // 90° → 0°
        if (neighbor === "C") return 180 + span * t; // 180° → 270°
        break;
      case "C":
        if (neighbor === "D") return 180 - span * t; // 180° → 90°
        if (neighbor === "S") return 270 + span * t; // 270° → 360°(=0°)
        break;
    }
    return 0;
  };

  // Primary 타입 찾기
  const total = dScore + iScore + sScore + cScore;
  const primary = (["D", "I", "S", "C"] as DiscKey[])
    .map((k) => ({ k, v: getTypeScore(k as DiscKey) }))
    .sort((a, b) => b.v - a.v)[0].k as DiscKey;

  // "두 번째 점"을 어떤 이웃으로 잡을지 정의 (시계/반시계 중 하나로 고정)
  const rightNeighbor: Record<DiscKey, DiscKey> = {
    S: "I",
    I: "D",
    D: "C",
    C: "S",
  };
  const leftNeighbor: Record<DiscKey, DiscKey> = {
    S: "C",
    C: "D",
    D: "I",
    I: "S",
  };

  // 이웃 점수 비율 (25점 대비 - 해당 영역에서의 상대 위치)
  const ratioTo = (k: DiscKey) => getTypeScore(k) / 25;

  // 두 점 계산
  const angle2 = angleTowardNeighbor(
    primary,
    rightNeighbor[primary],
    ratioTo(rightNeighbor[primary])
  );
  const angle3 = angleTowardNeighbor(
    primary,
    leftNeighbor[primary],
    ratioTo(leftNeighbor[primary])
  );
  const secondPoint = toScreen(angle2);
  const thirdPoint = toScreen(angle3);

  // 각 타입별 최대 가능한 점수 (DISC 테스트: 각 타입별 5문항 * 5점 = 25점)
  const maxD = 25; // D (주도형): 5문항
  const maxI = 25; // I (사교형): 5문항
  const maxS = 25; // S (안정형): 5문항
  const maxC = 25; // C (신중형): 5문항

  console.log("각 분야별 점수 및 비율:", {
    D: `${dScore}/${maxD} (${((dScore / maxD) * 100).toFixed(1)}%)`,
    I: `${iScore}/${maxI} (${((iScore / maxI) * 100).toFixed(1)}%)`,
    S: `${sScore}/${maxS} (${((sScore / maxS) * 100).toFixed(1)}%)`,
    C: `${cScore}/${maxC} (${((cScore / maxC) * 100).toFixed(1)}%)`,
    total: total,
  });

  // 타원형 shade 계산 (3개 점으로 정의)
  const getShadeEllipse = () => {
    // 세 점을 지나는 타원 계산
    const centerX = shadeCenterX;
    const centerY = shadeCenterY;

    // 두 번째 점과의 거리
    const distanceToSecond = Math.sqrt(
      (secondPoint.x - centerX) ** 2 + (secondPoint.y - centerY) ** 2
    );

    // 세 번째 점과의 거리
    const distanceToThird = Math.sqrt(
      (thirdPoint.x - centerX) ** 2 + (thirdPoint.y - centerY) ** 2
    );

    // 타원의 반지름 계산
    const radiusX = Math.max(distanceToSecond, distanceToThird);
    const radiusY = Math.min(distanceToSecond, distanceToThird);

    // 최소 반지름 보장
    const finalRadiusX = Math.max(radiusX, radius * 0.3);
    const finalRadiusY = Math.max(radiusY, radius * 0.2);

    return {
      centerX,
      centerY,
      radiusX: finalRadiusX,
      radiusY: finalRadiusY,
    };
  };

  const shadeEllipse = getShadeEllipse();

  // 4등분 섹션 생성 (원래대로 복원)
  const createQuadrantPath = (quadrant: string) => {
    const paths = [];

    switch (quadrant) {
      case "top-left": // D
        paths.push(`M ${center} ${center}`);
        paths.push(`L ${center - radius} ${center}`);
        paths.push(`A ${radius} ${radius} 0 0 1 ${center} ${center - radius}`);
        paths.push(`L ${center} ${center}`);
        break;
      case "top-right": // I
        paths.push(`M ${center} ${center}`);
        paths.push(`L ${center} ${center - radius}`);
        paths.push(`A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`);
        paths.push(`L ${center} ${center}`);
        break;
      case "bottom-right": // S
        paths.push(`M ${center} ${center}`);
        paths.push(`L ${center + radius} ${center}`);
        paths.push(`A ${radius} ${radius} 0 0 1 ${center} ${center + radius}`);
        paths.push(`L ${center} ${center}`);
        break;
      case "bottom-left": // C
        paths.push(`M ${center} ${center}`);
        paths.push(`L ${center} ${center + radius}`);
        paths.push(`A ${radius} ${radius} 0 0 1 ${center - radius} ${center}`);
        paths.push(`L ${center} ${center}`);
        break;
    }
    return paths.join(" ");
  };

  // 섹션의 중심점 계산 (각 4분원의 정확한 중심에 위치)
  const getQuadrantCenter = (quadrant: string) => {
    const offset = radius * 0.4; // 각 4분원의 정확한 중심
    switch (quadrant) {
      case "top-left":
        return { x: center - offset, y: center - offset * 0.8 };
      case "top-right":
        return { x: center + offset, y: center - offset * 0.8 };
      case "bottom-right":
        return { x: center + offset, y: center + offset * 1.3 };
      case "bottom-left":
        return { x: center - offset, y: center + offset * 1.3 };
      default:
        return { x: center, y: center };
    }
  };

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size} style={{ transform: [{ scale: 1.15 }] }}>
        <Defs>
          {/* 메인 원 클리핑 패스 */}
          <ClipPath id="mainCircleClip">
            <Circle cx={center} cy={center} r={radius} />
          </ClipPath>

          {/* Shade 타원 클리핑 패스 */}
          <ClipPath id="shadeClip">
            <Ellipse
              cx={shadeEllipse.centerX}
              cy={shadeEllipse.centerY}
              rx={shadeEllipse.radiusX}
              ry={shadeEllipse.radiusY}
            />
          </ClipPath>
        </Defs>

        {/* 4등분 섹션들 */}
        <G clipPath="url(#mainCircleClip)">
          {discTypes.map((type, index) => {
            return (
              <G key={type.key}>
                {/* 섹션 배경 (회색) */}
                <Path
                  d={createQuadrantPath(type.position)}
                  fill="#222"
                  fillOpacity="0.3"
                  stroke="#F58476"
                  strokeWidth="3"
                />

                {/* Shade 원 내부 영역만 원래 색상으로 표시 */}
                <G clipPath="url(#shadeClip)">
                  <Path
                    d={createQuadrantPath(type.position)}
                    fill={type.color}
                    stroke="#F58476"
                    strokeWidth="3"
                  />
                </G>
              </G>
            );
          })}
        </G>

        {/* 섹션 라벨들 */}
        {discTypes.map((type, index) => {
          const quadrantCenter = getQuadrantCenter(type.position);
          return (
            <SvgText
              key={`label-${type.key}`}
              x={quadrantCenter.x}
              y={quadrantCenter.y}
              fontSize={fontSize}
              fill="#222"
              textAnchor="middle"
              fontWeight="bold"
            >
              {type.key}
            </SvgText>
          );
        })}
      </Svg>

      {/* 범례 */}
      {showLegend && (
        <View className="flex-row flex-wrap justify-center gap-4 mt-4">
          {discTypes.map((type, index) => {
            const score = getTypeScore(type.key);
            return (
              <View key={index} className="flex-row items-center gap-2">
                <View
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: type.color }}
                />
                <Text className="text-sm text-background">
                  {type.key}: {score}점
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default DiscCircleChart;
