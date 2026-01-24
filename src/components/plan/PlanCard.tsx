import { Colors } from "@/constants/Colors";
import { useThemeStore } from "@/store/themeStore";
import { Plan } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface PlanCardProps {
  plan: Plan;
  onPress: (plan: Plan) => void;
}

export function PlanCard({ plan, onPress }: PlanCardProps) {
  const { mode } = useThemeStore();
  const systemScheme = useColorScheme();
  const activeScheme = mode === "system" ? (systemScheme ?? "light") : mode;
  const theme = Colors[activeScheme];

  const scale = useSharedValue(1);

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  // Helper to format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate relative time (simple approximation for "1d 1h left")
  const getRelativeTime = (dateStr: string) => {
    const target = new Date(dateStr).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff < 0) return "Overdue";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return "Soon";
  };

  const timeLeft = getRelativeTime(plan.date);
  const isOverdue = timeLeft === "Overdue";

  return (
    <Animated.View
      style={[
        styles.container,
        rStyle,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderWidth: 1, // Subtle border
        },
      ]}
    >
      <Pressable
        onPress={() => onPress(plan)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.innerContainer}
      >
        {/* Top: Category Name */}
        <Text style={[styles.categoryText, { color: theme.textSecondary }]}>
          {plan.category?.name || "General"}
        </Text>

        {/* Middle: Icon & Title */}
        <View style={styles.titleRow}>
          <Ionicons
            name={(plan.category?.icon as any) || "folder-outline"}
            size={20}
            color={theme.text}
          />
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
            {plan.title}
          </Text>
        </View>

        {/* Separator */}
        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        {/* Footer */}
        <View style={styles.footer}>
          {/* Date */}
          <View style={styles.footerRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={theme.textSecondary}
            />
            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
              {formatDate(plan.date)}
            </Text>
          </View>

          {/* Badges Row */}
          <View style={styles.badgesRow}>
            {/* Time Badge */}
            <View
              style={[
                styles.badge,
                { backgroundColor: isOverdue ? theme.error : theme.success },
              ]}
            >
              <Text style={styles.badgeTextWhite}>{timeLeft}</Text>
            </View>

            {/* Priority Badge */}
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: "transparent",
                  borderColor: theme.primary,
                  borderWidth: 1,
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: theme.primary }]}>
                {getPriorityLabel(plan.priority)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// Helpers
function getPriorityLabel(p: number) {
  if (p >= 3) return "High";
  if (p === 2) return "Medium";
  return "Normal";
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    // Shadow for elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  innerContainer: {
    padding: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  separator: {
    height: 1,
    width: "100%",
    marginBottom: 12,
  },
  footer: {
    gap: 12,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
  },
  badgesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  badgeTextWhite: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
});
