import { Colors } from "@/src/constants/Colors";
import { useThemeStore } from "@/src/store/themeStore";
import { Todo } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface TaskItemProps {
  todo: Todo;
  onToggle: (id: string, currentStatus: boolean | undefined) => void;
  onDelete: (id: string) => void;
  onLongPress?: (todo: Todo) => void;
}

export function TaskItem({
  todo,
  onToggle,
  onDelete,
  onLongPress,
}: TaskItemProps) {
  const { mode } = useThemeStore();
  const systemScheme = useColorScheme(); // Ensure reactivity to system changes
  const activeScheme = mode === "system" ? (systemScheme ?? "light") : mode;
  const theme = Colors[activeScheme];

  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(80);
  const opacity = useSharedValue(1);
  const marginVertical = useSharedValue(8);

  const deleteThreshold = -SCREEN_WIDTH * 0.3;
  const completeThreshold = SCREEN_WIDTH * 0.3;

  const pan = Gesture.Pan()
    .enabled(!todo.is_completed) // Disable swipe when completed
    .activeOffsetX([-10, 10]) // Only activate if moved 10px horizontally
    .failOffsetY([-5, 5]) // Fail if moved 5px vertically (allows scrolling)
    .onChange((event) => {
      translateX.value = event.translationX;
    })
    .onFinalize(() => {
      if (translateX.value < deleteThreshold) {
        // Delete (Left Swipe)
        translateX.value = withTiming(-SCREEN_WIDTH, {}, () => {
          runOnJS(onDelete)(todo.id);
        });
        itemHeight.value = withTiming(0);
        marginVertical.value = withTiming(0);
        opacity.value = withTiming(0);
      } else if (translateX.value > completeThreshold) {
        // Complete/Toggle (Right Swipe)
        translateX.value = withSpring(0); // Bounce back
        runOnJS(onToggle)(todo.id, todo.is_completed);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const rContainerStyle = useAnimatedStyle(() => ({
    height: itemHeight.value,
    marginVertical: marginVertical.value,
    opacity: opacity.value,
  }));

  const rIconStyleDelete = useAnimatedStyle(() => {
    const scale = translateX.value < deleteThreshold ? 1.2 : 0.8;
    const opacity = translateX.value < 0 ? 1 : 0;
    return {
      transform: [{ scale: withSpring(scale) }],
      opacity,
    };
  });

  const rIconStyleComplete = useAnimatedStyle(() => {
    const scale = translateX.value > completeThreshold ? 1.2 : 0.8;
    const opacity = translateX.value > 0 ? 1 : 0;
    return {
      transform: [{ scale: withSpring(scale) }],
      opacity,
    };
  });

  const rBackgroundStyle = useAnimatedStyle(() => {
    const isRight = translateX.value > 0;
    return {
      backgroundColor: isRight ? theme.success : theme.error,
    };
  });

  // Smart Date Formatting
  const getSmartDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow =
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear();

    const timeStr = date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });

    return timeStr; // Simply return time for daily focus
  };

  const displayDate = todo.due_date ? getSmartDate(todo.due_date) : ""; // Don't show created date if no due time is set, to keep it clean

  const isOverdue =
    todo.due_date && !todo.is_completed && new Date(todo.due_date) < new Date();

  const getPriorityColor = (p: number) => {
    switch (p) {
      case 3:
        return theme.error; // High
      case 2:
        return theme.warning; // Medium
      default:
        return theme.success; // Low
    }
  };

  return (
    <Animated.View style={[styles.containerWrapper, rContainerStyle]}>
      <Animated.View style={[styles.iconContainer, rBackgroundStyle]}>
        <Animated.View
          style={[{ position: "absolute", left: 24 }, rIconStyleComplete]}
        >
          <Ionicons name="checkmark-circle-outline" size={32} color="white" />
        </Animated.View>
        <Animated.View
          style={[{ position: "absolute", right: 24 }, rIconStyleDelete]}
        >
          <Ionicons name="trash-outline" size={32} color="white" />
        </Animated.View>
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.taskContainer, rStyle]}>
          <Pressable
            onLongPress={() => onLongPress?.(todo)}
            delayLongPress={200}
            disabled={!!todo.is_completed} // Disable edit on long press
            style={{ flex: 1 }}
          >
            {/* Neon Glow Container - Only Visible in Dark Mode */}
            <LinearGradient
              key={`glow-${todo.id}-${todo.is_completed}`} // Force re-render on toggle
              colors={
                activeScheme === "dark"
                  ? !!todo.is_completed
                    ? [theme.success, theme.success] // Green Border for Completed
                    : ["#22c55e", "transparent", "transparent", "#ef4444"] // Green/Red for Active
                  : ["transparent", "transparent"]
              }
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              locations={
                activeScheme === "dark"
                  ? !!todo.is_completed
                    ? [0, 1] // Solid Border (Matches 2 colors)
                    : [0, 0.95, 0.95, 1] // Asymmetric Green/Red Active (Matches 4 colors)
                  : [0, 1] // Transparent (Matches 2 colors: ["transparent", "transparent"])
              }
              style={[
                styles.glowContainer,
                {
                  padding: activeScheme === "dark" ? 1.5 : 0, // Thickness of the neon border
                  // borderRadius: 17, // Slightly larger than inner
                  opacity: activeScheme === "dark" ? 0.9 : 1,
                  borderWidth: activeScheme === "dark" ? 0 : 1, // Use standard border for light mode
                  borderColor: theme.border,
                },
              ]}
            >
              <LinearGradient
                colors={[theme.card, theme.background]}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.textContainer}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {/* Priority Circle Indicator */}
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: getPriorityColor(todo.priority),
                      }}
                    />

                    <Text
                      style={[
                        styles.text,
                        {
                          color: theme.text,
                          textDecorationLine: todo.is_completed
                            ? "line-through"
                            : "none",
                          opacity: todo.is_completed ? 0.6 : 1,
                          flexShrink: 1,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {todo.title}
                    </Text>
                    {/* Recurring Icon */}
                    {todo.recurring_rule === "daily" && (
                      <Ionicons
                        name="repeat"
                        size={14}
                        color={theme.textSecondary}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.dateText,
                      {
                        color: isOverdue ? theme.error : theme.textSecondary,
                        fontWeight: isOverdue ? "600" : "400",
                      },
                    ]}
                  >
                    {displayDate}
                  </Text>
                </View>
                {onLongPress && !todo.is_completed && (
                  <Pressable
                    onPress={() => onLongPress(todo)}
                    style={({ pressed }) => [
                      styles.editButton,
                      {
                        opacity: pressed ? 0.7 : 1,
                        backgroundColor: theme.background,
                      },
                    ]}
                  >
                    <Ionicons
                      name="create-outline"
                      size={20}
                      color={theme.textSecondary}
                    />
                  </Pressable>
                )}
                {!!todo.is_completed && (
                  <View
                    style={[
                      styles.editButton,
                      { backgroundColor: "transparent" },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={theme.success}
                    />
                  </View>
                )}
              </LinearGradient>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    overflow: "hidden",
    marginBottom: 8,
  },
  taskContainer: {
    flex: 1,
    height: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2, // Android shadow
  },
  glowContainer: {
    flex: 1, // Ensure it fills the Pressable area
    borderRadius: 16,
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderRadius: 15, // Slightly smaller than parent
  },
  iconContainer: {
    position: "absolute",
    height: "100%",
    width: "100%",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },

  text: {
    fontSize: 17, // Larger font
    fontWeight: "600",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "400",
    opacity: 0.8,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
});
