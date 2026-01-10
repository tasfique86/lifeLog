import { Colors } from "@/constants/Colors";
import { useThemeStore } from "@/store/themeStore";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Expenses() {
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
        Expenses Feature Coming Soon
      </Text>
    </SafeAreaView>
  );
}
