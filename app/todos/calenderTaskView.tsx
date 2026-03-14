import { Colors } from "@/constants/Colors";
import { useThemeStore } from "@/store/themeStore";
import React, { useState } from "react";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CalenderTaskView() {
  const [selected, setSelected] = useState("");
  const { getComputedScheme } = useThemeStore();
  const theme = getComputedScheme();
  const activeColors = Colors[theme];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: activeColors.background }}>
      <Calendar
        onDayPress={(day) => {
          setSelected(day.dateString);
        }}
        markedDates={{
          [selected]: {
            selected: true,
            disableTouchEvent: true,
            selectedColor: "orange",
          },
        }}
        style={{
          borderWidth: 1,
          borderColor: "gray",
          backgroundColor: activeColors.background,
        }}
        theme={{
          backgroundColor: activeColors.background,
          calendarBackground: activeColors.background,
          textSectionTitleColor: activeColors.text,
          selectedDayBackgroundColor: activeColors.primary,
          selectedDayTextColor: activeColors.text,
          todayTextColor: activeColors.primary,
          dayTextColor: activeColors.text,
          textDisabledColor: activeColors.textSecondary,
          arrowColor: activeColors.primary,
          monthTextColor: activeColors.text,
          indicatorColor: activeColors.primary,
        }}
      />
    </SafeAreaView>
  );
}
