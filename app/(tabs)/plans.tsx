import { Colors } from "@/src/constants/Colors";
import { useThemeStore } from "@/src/store/themeStore";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Plans() {
  const { getComputedScheme } = useThemeStore();
  const activeColors = Colors[getComputedScheme()];

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: activeColors.background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: activeColors.text }}>
        Planner Feature Coming Soon
      </Text>
    </SafeAreaView>
  );
}
