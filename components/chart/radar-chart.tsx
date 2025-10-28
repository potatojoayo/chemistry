import React from "react";
import { View } from "react-native";
import Svg, {
  Circle,
  G,
  Line,
  Polygon,
  Text as SvgText,
} from "react-native-svg";

interface RadarChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  size?: number;
}

export default function RadarChart({ data, size = 200 }: RadarChartProps) {
  const center = size / 2;
  const radius = (size - 76) / 2;

  // Create points for the radar chart (5각형 기반)
  const createPoints = (values: number[]) => {
    return values
      .map((value, index) => {
        const angle = index * 72 - 90; // 5각형, 위에서 시작
        const distance = (value / 100) * radius;
        const x = center + distance * Math.cos((angle * Math.PI) / 180);
        const y = center + distance * Math.sin((angle * Math.PI) / 180);
        return `${x},${y}`;
      })
      .join(" ");
  };

  // Create hexagon grid
  const createHexagon = (scale: number) => {
    const points = [];
    for (let i = 0; i < 5; i++) {
      const angle = i * 72 - 90; // 5각형, 위에서 시작
      const x = center + radius * scale * Math.cos((angle * Math.PI) / 180);
      const y = center + radius * scale * Math.sin((angle * Math.PI) / 180);
      points.push(`${x},${y}`);
    }
    return points.join(" ");
  };

  const gridHexagons = [0.2, 0.4, 0.6, 0.8, 1.0].map((scale, index) => (
    <Polygon
      key={index}
      points={createHexagon(scale)}
      stroke="#222"
      strokeWidth={1}
      fill="none"
      opacity={0.2}
    />
  ));

  // Create axis lines (5각형의 각 꼭짓점으로)
  const axisLines = data.map((_, index) => {
    const angle = index * 72 - 90; // 5각형, 위에서 시작
    const x = center + radius * Math.cos((angle * Math.PI) / 180);
    const y = center + radius * Math.sin((angle * Math.PI) / 180);
    return (
      <Line
        key={index}
        x1={center}
        y1={center}
        x2={x}
        y2={y}
        stroke="#222"
        strokeWidth={1}
        opacity={0.5}
      />
    );
  });

  // Create labels (5각형의 각 꼭짓점에)
  const labels = data.map((item, index) => {
    const angle = index * 72 - 90; // 5각형, 위에서 시작
    const x = center + (radius + 24) * Math.cos((angle * Math.PI) / 180);
    const y = center + (radius + 24) * Math.sin((angle * Math.PI) / 180);
    return (
      <G key={item.label}>
        <SvgText
          x={x}
          y={y - 5}
          fontSize="10"
          fill="#222"
          textAnchor="middle"
          fontWeight="medium"
          fontFamily="medium"
        >
          {item.label}
        </SvgText>
        <SvgText
          x={x}
          y={y + 10}
          fontSize="12"
          fill="#222"
          textAnchor="middle"
          fontFamily="medium"
        >
          {item.value}
        </SvgText>
      </G>
    );
  });

  const dataPoints = createPoints(data.map((item) => item.value));

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size}>
        {/* Grid hexagons */}
        {gridHexagons}

        {/* Axis lines */}
        {axisLines}

        {/* Data polygon */}
        <Polygon
          points={dataPoints}
          fill="#222"
          fillOpacity={0.3}
          stroke="#222"
          strokeWidth={1.5}
        />

        {/* Data points */}
        {data.map((item, index) => {
          const angle = index * 72 - 90; // 5각형, 위에서 시작
          const distance = (item.value / 100) * radius;
          const x = center + distance * Math.cos((angle * Math.PI) / 180);
          const y = center + distance * Math.sin((angle * Math.PI) / 180);

          return (
            <Circle
              key={`point-${index}`}
              cx={x}
              cy={y}
              r={3}
              fill={item.color}
              stroke="#222"
              strokeWidth={1}
            />
          );
        })}

        {/* Labels */}
        {labels}
      </Svg>
    </View>
  );
}
