import ThemeToggle from "@/components/ThemeToggle";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Dashboard() {
  const { getComputedScheme } = useThemeStore();
  const { user } = useAuthStore();
  const activeColors = Colors[getComputedScheme()];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: activeColors.background, padding: 20 }}
    >
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
    </SafeAreaView>
  );
}
