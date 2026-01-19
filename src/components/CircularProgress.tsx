import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  subLabel?: string;
}

export function CircularProgress({
  progress,
  size = 120,
  strokeWidth = 10,
  color = "#22c55e",
  backgroundColor = "#e5e7eb",
  label,
  subLabel,
}: CircularProgressProps) {
  // Dynamic color logic
  let activeColor = color;
  if (!color || color === "#22c55e") {
    // Only strict override if default or undefined
    if (progress < 0.25)
      activeColor = "#ef4444"; // Red
    else if (progress < 0.5)
      activeColor = "#f97316"; // Orange
    else if (progress < 0.75)
      activeColor = "#eab308"; // Yellow
    else activeColor = "#22c55e"; // Green
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 1000 });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: circumference * (1 - animatedProgress.value),
    };
  });

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={activeColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        {label && (
          <Text
            style={{
              fontSize: size * 0.2,
              fontWeight: "bold",
              color: "#6b7280",
            }}
          >
            {label}
          </Text>
        )}
        {subLabel && (
          <Text
            style={{
              fontSize: size * 0.1,
              color: "#6b7280",
              marginTop: 4,
              textAlign: "center",
            }}
          >
            {subLabel}
          </Text>
        )}
      </View>
    </View>
  );
}
