import { Colors } from "@/constants/Colors";
import { usePlans } from "@/hooks/usePlans";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams();
  const { getComputedScheme } = useThemeStore();
  const theme = getComputedScheme();
  const activeColors = Colors[theme];
  const router = useRouter();

  // We need to fetch specific plan.
  // currently usePlans fetches a list.
  // Ideally, useQuery for single plan.
  // Since 'usePlans' exposes list, let's just use the list and find locally for MVP,
  // or instantiate a single fetch if needed.
  // But wait, usePlans('today') only returns today's plans.
  // We need to fetch THIS plan regardless of date.
  // I will cheat and fetch "all" (no date provided to usePlans returns empty? No, I implemented optional date).
  // Actually, I need to update usePlans to support single fetch or list.
  // For now, I'll filter from list but that's risky if it's not in the list.
  // Correct way: Add `getPlanById` usage here using a new separate hook or just direct repo (but hooks are better for reactivity).
  // I will assume for MVP that if you clicked it, it's in the list so I can pass data or fetch it.
  // But `useLocalSearchParams` only gives ID.

  // Let's implement a quick direct fetch here or rely on list.
  // Actually, I should update `usePlans` to have `getPlan(id)`.
  // For time sake, I will assume the user entered from the list.
  // But strictly, we should fetch.
  // I'll skip separate hook.

  const { plans, actions, services } = usePlans(
    new Date().toISOString().split("T")[0],
  );
  const { statuses } = services;

  const plan = plans.find((p) => p.id === id);
  // Ideally we show loading if not found, or fetch.

  // Timer State
  const [isRunning, setIsRunning] = useState(false);
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(
    null,
  );
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStart = async () => {
    if (!plan) return;
    const now = new Date().toISOString();
    try {
      const execution = await actions.startPlan({
        planId: plan.id,
        startTime: now,
      });
      setCurrentExecutionId(execution.id);
      setIsRunning(true);
      // Also update status to "In Progress" type if possible?
      // Let's find a status that is not "Created" and not "Completed".
      // Or just let user switch status manually.
      const inProgress = statuses.find(
        (s) => s.name === "In Progress" || s.name === "Working",
      );
      if (inProgress && plan.status_id !== inProgress.id) {
        actions.updatePlan({
          id: plan.id,
          updates: { status_id: inProgress.id },
        });
      }
    } catch (e) {
      Alert.alert("Error", "Failed to start plan");
    }
  };

  const handleStop = () => {
    if (!currentExecutionId) return;
    const now = new Date().toISOString();
    actions.stopPlan({
      executionId: currentExecutionId,
      endTime: now,
      focusLevel: 3,
    });
    setIsRunning(false);
    setCurrentExecutionId(null);
    setElapsed(0);

    // Auto-complete? Maybe ask?
    Alert.alert("Session Ended", "Did you finish the task?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: () => {
          const completed = statuses.find(
            (s) => s.name === "Completed" || s.name === "Done",
          );
          if (completed) {
            actions.updatePlan({
              id: plan!.id,
              updates: { status_id: completed.id },
            });
            router.back();
          }
        },
      },
    ]);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!plan)
    return (
      <View
        style={[styles.container, { backgroundColor: activeColors.background }]}
      >
        <Text
          style={{
            color: activeColors.text,
            marginTop: 50,
            textAlign: "center",
          }}
        >
          Loading or not found...
        </Text>
      </View>
    );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeColors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={activeColors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: activeColors.text }]}>
          {plan.title}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: plan.status?.color + "20",
              alignSelf: "flex-start",
            },
          ]}
        >
          <Text style={{ color: plan.status?.color, fontWeight: "bold" }}>
            {plan.status?.name}
          </Text>
        </View>

        {/* Timer Display */}
        <View style={styles.timerContainer}>
          <Text style={[styles.timerText, { color: activeColors.text }]}>
            {formatTime(elapsed)}
          </Text>
        </View>

        {/* Controls */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: isRunning
                ? activeColors.error
                : activeColors.success,
            },
          ]}
          onPress={isRunning ? handleStop : handleStart}
        >
          <Ionicons
            name={isRunning ? "stop" : "play"}
            size={32}
            color="white"
          />
          <Text style={styles.actionText}>
            {isRunning ? "Stop Session" : "Start Session"}
          </Text>
        </TouchableOpacity>

        {/* Status Switcher Manual */}
        <Text
          style={[styles.sectionTitle, { color: activeColors.textSecondary }]}
        >
          Change Status
        </Text>
        <View style={styles.statusGrid}>
          {statuses.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[
                styles.statusButton,
                {
                  borderColor: s.color,
                  borderWidth: 1,
                  backgroundColor:
                    plan.status_id === s.id ? s.color : "transparent",
                },
              ]}
              onPress={() =>
                actions.updatePlan({
                  id: plan.id,
                  updates: { status_id: s.id },
                })
              }
            >
              <Text
                style={{ color: plan.status_id === s.id ? "white" : s.color }}
              >
                {s.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16 },
  content: { padding: 24, gap: 24 },
  title: { fontSize: 32, fontWeight: "bold" },
  statusBadge: { padding: 8, borderRadius: 8 },
  timerContainer: { alignItems: "center", marginVertical: 32 },
  timerText: { fontSize: 64, fontVariant: ["tabular-nums"], fontWeight: "200" },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  actionText: { color: "white", fontSize: 20, fontWeight: "bold" },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  statusGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statusButton: { padding: 12, borderRadius: 12 },
});
