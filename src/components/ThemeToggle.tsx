import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const TOGGLE_WIDTH = 70;
const TOGGLE_HEIGHT = 36;
const CIRCLE_SIZE = 28;
const PADDING = 4;
const TRANSLATE_X = TOGGLE_WIDTH - CIRCLE_SIZE - PADDING * 2;

export default function ThemeToggle() {
  const { mode, setMode } = useThemeStore();
  const systemScheme = useColorScheme();

  // Robustly derive the active scheme
  const activeScheme = mode === "system" ? systemScheme ?? "light" : mode;

  const isDark = activeScheme === "dark";

  const progress = useSharedValue(isDark ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isDark ? 1 : 0, {
      damping: 15,
      stiffness: 200,
    });
  }, [isDark]);

  const handleToggle = () => {
    const targetMode = isDark ? "light" : "dark";
    setMode(targetMode);
  };

  const trackAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ["#60A5FA", "#020617"] // Sky Blue (Day) -> Dark Slate (Night)
    );
    return { backgroundColor };
  });

  const circleAnimatedStyle = useAnimatedStyle(() => {
    const translateX = progress.value * TRANSLATE_X;
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ["#FFFFFF", "#0F172A"] // White -> Dark Slate
    );
    return {
      transform: [{ translateX }],
      backgroundColor,
    };
  });

  // Removed scaling as requested ("up down animation")
  const sunIconStyle = useAnimatedStyle(() => {
    return { opacity: 1 - progress.value };
  });

  const moonIconStyle = useAnimatedStyle(() => {
    return { opacity: progress.value };
  });

  const cloudsStyle = useAnimatedStyle(() => {
    return { opacity: 1 - progress.value };
  });

  const starsStyle = useAnimatedStyle(() => {
    return { opacity: progress.value };
  });

  return (
    <TouchableOpacity onPress={handleToggle} activeOpacity={0.8}>
      <Animated.View style={[styles.track, trackAnimatedStyle]}>
        {/* Sky Elements (Clouds) - Visible in Day */}
        <Animated.View style={[styles.bgContainer, cloudsStyle]}>
          <Ionicons
            name="cloud"
            size={14}
            color="rgba(255,255,255,0.8)"
            style={{ position: "absolute", right: 18, top: 4 }}
          />
          <Ionicons
            name="cloud"
            size={10}
            color="rgba(255,255,255,0.6)"
            style={{ position: "absolute", right: 35, bottom: 6 }}
          />
          <Ionicons
            name="cloud"
            size={12}
            color="rgba(255,255,255,0.7)"
            style={{ position: "absolute", right: 8, bottom: 8 }}
          />
        </Animated.View>

        {/* Night Elements (Stars) - Visible in Dark */}
        <Animated.View style={[styles.bgContainer, starsStyle]}>
          <Ionicons
            name="star"
            size={8}
            color="#FEF3C7"
            style={{ position: "absolute", left: 10, top: 6 }}
          />
          <Ionicons
            name="star"
            size={5}
            color="#FEF3C7"
            style={{ position: "absolute", left: 25, bottom: 8 }}
          />
          <Ionicons
            name="star"
            size={6}
            color="#FEF3C7"
            style={{ position: "absolute", left: 15, top: 18 }}
          />
        </Animated.View>

        <Animated.View style={[styles.circle, circleAnimatedStyle]}>
          <Animated.View style={[styles.iconContainer, sunIconStyle]}>
            <Ionicons name="sunny" size={20} color="#F59E0B" />
          </Animated.View>
          <Animated.View style={[styles.iconContainer, moonIconStyle]}>
            <Ionicons name="moon" size={18} color="#FFFFFF" />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TOGGLE_WIDTH,
    height: TOGGLE_HEIGHT,
    borderRadius: TOGGLE_HEIGHT / 2,
    justifyContent: "center",
    alignItems: "flex-start",
    padding: PADDING,
    overflow: "hidden", // Clip the decoration clouds/stars
  },
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 10, // Ensure circle is above decorations
  },
  iconContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});
