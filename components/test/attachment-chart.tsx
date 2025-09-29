import { AttachmentResult, Test } from "@/lib/types";
import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";

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
  const fontSize = 12;

  // 사용자 유형에 따른 색상 결정 (1-5점 기준)
  const getUserTypeColor = (anxiety: number, avoidance: number) => {
    if (anxiety >= 3 && avoidance >= 3) return "#F44336"; // 혼란형 (빨간색)
    if (anxiety < 3 && avoidance >= 3) return "#2196F3"; // 회피형 (파란색)
    if (anxiety < 3 && avoidance < 3) return "#4CAF50"; // 안정형 (녹색)
    if (anxiety >= 3 && avoidance < 3) return "#FF9800"; // 불안형 (주황색)
    return "#000"; // 기본값
  };

  // 사용자 위치 계산 (1~5 범위를 그래프 안에 맞추기)
  const userX = center + (anxiety - 3) * (axisLength / 2.1); // 3으로 나누어서 범위 확장
  const userY = center - (avoidance - 3) * (axisLength / 2.1); // 3으로 나누어서 범위 확장

  // 간격 설정

  // 4개 사분면 정의 (올바른 Attachment Styles 배치)
  const quadrants = [
    {
      name: "혼란형", // High Anxiety, High Avoidance
      x: center,
      y: center - axisLength,
      width: axisLength,
      height: axisLength,
      color: "#F44336", // 빨간색
    },
    {
      name: "회피형", // Low Anxiety, High Avoidance
      x: center - axisLength,
      y: center - axisLength,
      width: axisLength,
      height: axisLength,
      color: "#2196F3", // 파란색
    },
    {
      name: "안정형", // Low Anxiety, Low Avoidance
      x: center - axisLength,
      y: center,
      width: axisLength,
      height: axisLength,
      color: "#4CAF50", // 녹색
    },
    {
      name: "불안형", // High Anxiety, Low Avoidance
      x: center,
      y: center,
      width: axisLength,
      height: axisLength,
      color: "#FF9800", // 주황색
    },
  ];

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size} style={{ transform: [{ scale: 1.15 }] }}>
        {/* 4개 사분면 - 바깥 모서리만 둥글게 */}
        {/* 회피형 (좌상) - 좌상 모서리만 둥글게 */}
        <Path
          d={`M ${center - axisLength + 8} ${center - axisLength}
             L ${center} ${center - axisLength}
             L ${center} ${center}
             L ${center - axisLength} ${center}
             L ${center - axisLength} ${center - axisLength + 8}
             Q ${center - axisLength} ${center - axisLength} ${center - axisLength + 8} ${center - axisLength}
             Z`}
          fill={quadrants[1].color}
        />

        {/* 혼란형 (우상) - 우상 모서리만 둥글게 */}
        <Path
          d={`M ${center} ${center - axisLength}
             L ${center + axisLength - 8} ${center - axisLength}
             Q ${center + axisLength} ${center - axisLength} ${center + axisLength} ${center - axisLength + 8}
             L ${center + axisLength} ${center}
             L ${center} ${center}
             L ${center} ${center - axisLength}
             Z`}
          fill={quadrants[0].color}
        />

        {/* 안정형 (좌하) - 좌하 모서리만 둥글게 */}
        <Path
          d={`M ${center - axisLength} ${center}
             L ${center} ${center}
             L ${center} ${center + axisLength}
             L ${center - axisLength + 8} ${center + axisLength}
             Q ${center - axisLength} ${center + axisLength} ${center - axisLength} ${center + axisLength - 8}
             L ${center - axisLength} ${center}
             Z`}
          fill={quadrants[2].color}
        />

        {/* 불안형 (우하) - 우하 모서리만 둥글게 */}
        <Path
          d={`M ${center} ${center}
             L ${center + axisLength} ${center}
             L ${center + axisLength} ${center + axisLength - 8}
             Q ${center + axisLength} ${center + axisLength} ${center + axisLength - 8} ${center + axisLength}
             L ${center} ${center + axisLength}
             L ${center} ${center}
             Z`}
          fill={quadrants[3].color}
        />

        {/* x축 */}
        <Line
          x1={center - axisLength}
          y1={center}
          x2={center + axisLength}
          y2={center}
          stroke="#222"
          strokeWidth="1"
        />

        {/* y축 */}
        <Line
          x1={center}
          y1={center - axisLength}
          x2={center}
          y2={center + axisLength}
          stroke="#222"
          strokeWidth="1"
        />

        {/* 사분면 텍스트 */}
        {quadrants.map((quadrant, index) => (
          <SvgText
            key={`text-${index}`}
            x={quadrant.x + quadrant.width / 2}
            y={quadrant.y + quadrant.height / 2 + 4}
            fontSize={fontSize}
            fill="#222"
            textAnchor="middle"
            fontWeight="bold"
          >
            {quadrant.name}
          </SvgText>
        ))}

        {/* 축 레이블 */}
        {/* x축 레이블 (불안) */}
        <SvgText
          x={center + axisLength - 20}
          y={center - 8}
          fontSize={10}
          fill="#222"
          textAnchor="middle"
          fontWeight="500"
        >
          불안 →
        </SvgText>

        {/* y축 레이블 (회피) */}
        <SvgText
          x={center - 18}
          y={center - axisLength + 14}
          fontSize={10}
          fill="#222"
          textAnchor="middle"
          fontWeight="500"
        >
          회피 ↑
        </SvgText>

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

      {/* 점수 퍼센테이지 그래프 */}
      {showLegend && (
        <View className="my-4 w-full px-4">
          {/* 불안 점수 */}
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-background/70 text-sm font-medium">
                불안
              </Text>
              <Text className="text-background font-bold text-sm">
                {anxiety.toFixed(1)} / 5
              </Text>
            </View>
            <View className="w-full h-2 bg-background/10 rounded-full">
              <View
                className="h-2 bg-[#F44336] rounded-full"
                style={{ width: `${Math.max(2, ((anxiety - 1) / 4) * 100)}%` }}
              />
            </View>
          </View>

          {/* 회피 점수 */}
          <View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-background/70 text-sm font-medium">
                회피
              </Text>
              <Text className="text-background font-bold text-sm">
                {avoidance.toFixed(1)} / 5
              </Text>
            </View>
            <View className="w-full h-2 bg-background/10 rounded-full">
              <View
                className="h-2 bg-[#2196F3] rounded-full"
                style={{
                  width: `${Math.max(2, ((avoidance - 1) / 4) * 100)}%`,
                }}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
