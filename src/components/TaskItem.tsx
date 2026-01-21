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
  const systemScheme = useColorScheme();
  const activeScheme = mode === "system" ? (systemScheme ?? "light") : mode;
  const theme = Colors[activeScheme];

  /* ------------------ Animations ------------------ */
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(80);
  const opacity = useSharedValue(1);
  const marginVertical = useSharedValue(8);

  const deleteThreshold = -SCREEN_WIDTH * 0.3;
  const completeThreshold = SCREEN_WIDTH * 0.3;

  const pan = Gesture.Pan()
    .enabled(!todo.is_completed)
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onChange((e) => {
      translateX.value = e.translationX;
    })
    .onFinalize(() => {
      if (translateX.value < deleteThreshold) {
        translateX.value = withTiming(-SCREEN_WIDTH, {}, () => {
          runOnJS(onDelete)(todo.id);
        });
        itemHeight.value = withTiming(0);
        marginVertical.value = withTiming(0);
        opacity.value = withTiming(0);
      } else if (translateX.value > completeThreshold) {
        translateX.value = withSpring(0);
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

  const rBackgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: translateX.value > 0 ? theme.success : theme.error,
  }));

  /* ------------------ Helpers ------------------ */
  const getSmartTime = (dateString?: string) => {
    if (!dateString) return null;

    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const displayTime = getSmartTime(todo.due_date);

  const isOverdue =
    !!todo.due_date &&
    !todo.is_completed &&
    new Date(todo.due_date) < new Date();

  const getPriorityColor = (p: number) => {
    switch (p) {
      case 3:
        return theme.error;
      case 2:
        return theme.warning;
      default:
        return theme.success;
    }
  };

  /* ------------------ Render ------------------ */
  return (
    <Animated.View style={[styles.containerWrapper, rContainerStyle]}>
      {/* Swipe background */}
      <Animated.View style={[styles.iconContainer, rBackgroundStyle]}>
        <Ionicons
          name="trash-outline"
          size={28}
          color="white"
          style={{ position: "absolute", right: 24 }}
        />
        <Ionicons
          name="checkmark-circle-outline"
          size={28}
          color="white"
          style={{ position: "absolute", left: 24 }}
        />
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.taskContainer, rStyle]}>
          <Pressable
            onLongPress={() => onLongPress?.(todo)}
            delayLongPress={200}
            disabled={!!todo.is_completed}
            style={{ flex: 1 }}
          >
            {/* Glow Border */}
            <LinearGradient
              colors={
                activeScheme === "dark"
                  ? todo.is_completed
                    ? [theme.success, theme.success]
                    : ["#22c55e", "transparent", "transparent", "#ef4444"]
                  : ["transparent", "transparent"]
              }
              locations={
                activeScheme === "dark"
                  ? todo.is_completed
                    ? [0, 1]
                    : [0, 0.95, 0.95, 1]
                  : [0, 1]
              }
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[
                styles.glowContainer,
                {
                  padding: activeScheme === "dark" ? 1.5 : 0,
                  borderColor: theme.border,
                  borderWidth: activeScheme === "dark" ? 0 : 1,
                },
              ]}
            >
              {/* Card */}
              <LinearGradient
                colors={[theme.card, theme.background]}
                style={styles.card}
              >
                {/* Left */}
                <View style={styles.textContainer}>
                  <View style={styles.titleRow}>
                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: getPriorityColor(todo.priority) },
                      ]}
                    />
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.title,
                        {
                          color: theme.text,
                          textDecorationLine: todo.is_completed
                            ? "line-through"
                            : "none",
                          opacity: todo.is_completed ? 0.6 : 1,
                        },
                      ]}
                    >
                      {todo.title}
                    </Text>

                    {todo.recurring_rule === "daily" && (
                      <Ionicons
                        name="repeat"
                        size={14}
                        color={theme.textSecondary}
                      />
                    )}
                  </View>

                  <View style={styles.metaRow}>
                    {displayTime && (
                      <Text
                        style={[
                          styles.time,
                          {
                            color: isOverdue
                              ? theme.error
                              : theme.textSecondary,
                            fontWeight: isOverdue ? "600" : "400",
                          },
                        ]}
                      >
                        {displayTime}
                      </Text>
                    )}

                    {todo.category && (
                      <View
                        style={[
                          styles.categoryChip,
                          {
                            backgroundColor: todo.category.color + "20", // 12% opacity
                            borderColor: todo.category.color,
                          },
                        ]}
                      >
                        <Ionicons
                          name={todo.category.icon as any}
                          size={10}
                          color={todo.category.color}
                        />
                        <Text
                          style={[
                            styles.categoryText,
                            { color: todo.category.color },
                          ]}
                        >
                          {todo.category.name}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Right */}
                {!!todo.is_completed ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={theme.success}
                  />
                ) : (
                  !!onLongPress && (
                    <Pressable
                      onPress={() => onLongPress(todo)}
                      style={styles.editButton}
                    >
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color={theme.textSecondary}
                      />
                    </Pressable>
                  )
                )}
              </LinearGradient>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

/* ------------------ Styles ------------------ */
const styles = StyleSheet.create({
  containerWrapper: {
    overflow: "hidden",
  },
  taskContainer: {
    flex: 1,
    elevation: 2,
  },
  glowContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  card: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderRadius: 15,
  },
  iconContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    flexShrink: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    gap: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "600",
  },
  time: {
    fontSize: 12,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
  },
});
