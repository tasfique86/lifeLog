import { CircularProgress } from "@/components/CircularProgress";
import ThemeToggle from "@/components/ThemeToggle";
import { Colors } from "@/constants/Colors";
import { useTodos } from "@/hooks/useTodos";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Dashboard() {
  const { getComputedScheme } = useThemeStore();
  const { user } = useAuthStore();
  const activeColors = Colors[getComputedScheme()];
  const { todos } = useTodos();

  // --- Statistics Logic ---
  const today = new Date();
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const completedToday = todos.filter(
    (t) =>
      t.is_completed &&
      t.completed_at &&
      isSameDay(new Date(t.completed_at), today),
  );
  const pendingTasks = todos.filter((t) => !t.is_completed);

  // Total for the day = Completed Today + Pending (Active)
  const totalDaily = completedToday.length + pendingTasks.length;
  const completionCount = completedToday.length;
  const percentage = totalDaily > 0 ? completionCount / totalDaily : 0;

  // Show top 3 pending tasks
  const displayTasks = pendingTasks.slice(0, 3);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: activeColors.background, padding: 20 }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: activeColors.text,
            }}
          >
            Hello, {user?.name}
          </Text>
          <Text style={{ fontSize: 16, color: activeColors.textSecondary }}>
            Here is your dashboard overview.
          </Text>
        </View>
        <ThemeToggle />
      </View>

      {/* Stats Row */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {/* Left Col: Daily Task List */}
        <View style={{ flex: 1, marginRight: 16 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: activeColors.text,
              marginBottom: 12,
            }}
          >
            Daily task
          </Text>

          <View>
            {displayTasks.length === 0 && completionCount > 0 && (
              <Text style={{ color: activeColors.textSecondary }}>
                All caught up!
              </Text>
            )}
            {displayTasks.length === 0 && completionCount === 0 && (
              <Text style={{ color: activeColors.textSecondary }}>
                No tasks yet.
              </Text>
            )}

            {displayTasks.map((task) => (
              <View
                key={task.id}
                style={{
                  backgroundColor: activeColors.card,
                  padding: 12,
                  marginBottom: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: activeColors.border,
                }}
              >
                <Text
                  style={{ color: activeColors.text, fontSize: 14 }}
                  numberOfLines={1}
                >
                  {task.title}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Right Col: Progress Ring */}
        <View
          style={{
            backgroundColor: activeColors.card,
            borderRadius: 16,
            padding: 16,
            alignItems: "center",
            justifyContent: "center",
            width: 150,
            // Shadow
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <CircularProgress
            progress={percentage}
            size={100}
            strokeWidth={12}
            backgroundColor={activeColors.border} // Track color
            label={`${Math.round(percentage * 100)}%`}
            subLabel={`Complete\n${completionCount}/${totalDaily}`}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
