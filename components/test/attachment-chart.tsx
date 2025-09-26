import { AttachmentResult, Test } from "@/lib/types";
import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Line, Rect, Text as SvgText } from "react-native-svg";

interface AttachmentChartProps {
  test: Test;
  size?: number;
  showLegend?: boolean;
}

export default function AttachmentChart({
  test,
  size = 240,
  showLegend = true,
}: AttachmentChartProps) {
  const result = test.result as AttachmentResult;
  const anxiety = result.anxiety.average;
  const avoidance = result.avoidance.average;

  const center = size / 2;
  const axisLength = size * 0.4; // 축 길이를 늘려서 여유분 확보
  const fontSize = size * 0.06;

  // 사용자 유형에 따른 색상 결정
  const getUserTypeColor = (anxiety: number, avoidance: number) => {
    if (anxiety >= 3.5 && avoidance >= 3.5) return "#F44336"; // 혼란형 (빨간색)
    if (anxiety < 3.5 && avoidance >= 3.5) return "#2196F3"; // 회피형 (파란색)
    if (anxiety < 3.5 && avoidance < 3.5) return "#4CAF50"; // 안정형 (녹색)
    if (anxiety >= 3.5 && avoidance < 3.5) return "#FF9800"; // 불안형 (주황색)
    return "#000"; // 기본값
  };

  // 사용자 위치 계산 (1~5 범위를 그래프 안에 맞추기)
  const userX = center + (anxiety - 3) * (axisLength / 2.2); // 3으로 나누어서 범위 확장
  const userY = center - (avoidance - 3) * (axisLength / 2.2); // 3으로 나누어서 범위 확장

  // 간격 설정
  const offset = 8;

  // 4개 사분면 정의 (올바른 Attachment Styles 배치)
  const quadrants = [
    {
      name: "혼란형", // High Anxiety, High Avoidance
      x: center + offset,
      y: center - axisLength,
      width: axisLength - offset,
      height: axisLength - offset,
      color: "#F44336", // 빨간색
    },
    {
      name: "회피형", // Low Anxiety, High Avoidance
      x: center - axisLength,
      y: center - axisLength,
      width: axisLength - offset,
      height: axisLength - offset,
      color: "#2196F3", // 파란색
    },
    {
      name: "안정형", // Low Anxiety, Low Avoidance
      x: center - axisLength,
      y: center + offset,
      width: axisLength - offset,
      height: axisLength - offset,
      color: "#4CAF50", // 녹색
    },
    {
      name: "불안형", // High Anxiety, Low Avoidance
      x: center + offset,
      y: center + offset,
      width: axisLength - offset,
      height: axisLength - offset,
      color: "#FF9800", // 주황색
    },
  ];

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size} style={{ transform: [{ scale: 1.15 }] }}>
        {/* 4개 사분면 */}
        {quadrants.map((quadrant, index) => (
          <Rect
            key={index}
            x={quadrant.x}
            y={quadrant.y}
            width={quadrant.width}
            height={quadrant.height}
            rx="8"
            ry="8"
            fill={quadrant.color}
            fillOpacity="0.2"
            stroke={quadrant.color}
            strokeWidth="1"
          />
        ))}

        {/* x축 */}
        <Line
          x1={center - axisLength}
          y1={center}
          x2={center + axisLength}
          y2={center}
          stroke="#000"
          strokeWidth="1.5"
        />

        {/* y축 */}
        <Line
          x1={center}
          y1={center - axisLength}
          x2={center}
          y2={center + axisLength}
          stroke="#000"
          strokeWidth="1.5"
        />

        {/* 사분면 텍스트 */}
        {quadrants.map((quadrant, index) => (
          <SvgText
            key={`text-${index}`}
            x={quadrant.x + quadrant.width / 2}
            y={quadrant.y + quadrant.height / 2 + 4}
            fontSize={fontSize}
            fill="#000"
            textAnchor="middle"
            fontWeight="bold"
          >
            {quadrant.name}
          </SvgText>
        ))}

        {/* 사용자 위치 점 - 예쁘게 스타일링 */}
        {/* 그림자 효과 */}
        <Circle
          cx={userX + 1}
          cy={userY + 1}
          r="6"
          fill="#000"
          fillOpacity="0.2"
        />
        {/* 메인 원 */}
        <Circle
          cx={userX}
          cy={userY}
          r="8"
          fill="#fff"
          stroke={getUserTypeColor(anxiety, avoidance)}
        />
        <Circle
          cx={userX}
          cy={userY}
          r="4"
          fill={getUserTypeColor(anxiety, avoidance)}
        />
      </Svg>

      {/* 점수 표시 - showLegend가 true일 때만 표시 */}
      {showLegend && (
        <View className="my-4 p-3 bg-background/10 rounded-lg w-full">
          <View className="flex-row justify-between">
            <View className="flex-1 items-center">
              <Text className="text-background/60 text-sm">불안 (Anxiety)</Text>
              <Text className="text-background font-bold text-lg">
                {anxiety.toFixed(1)}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-background/60 text-sm">
                회피 (Avoidance)
              </Text>
              <Text className="text-background font-bold text-lg">
                {avoidance.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
