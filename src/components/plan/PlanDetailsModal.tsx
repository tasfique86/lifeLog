import { Colors } from "@/constants/Colors";
import { useCategories } from "@/hooks/useCategories";
import { useThemeStore } from "@/store/themeStore";
import { Plan } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

interface PlanDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Plan> & { note?: string }) => void;
  plan: Plan | null;
}

export function PlanDetailsModal({
  visible,
  onClose,
  onSave,
  plan,
}: PlanDetailsModalProps) {
  const { mode } = useThemeStore();
  const systemScheme = useColorScheme();
  const activeScheme = mode === "system" ? (systemScheme ?? "light") : mode;
  const theme = Colors[activeScheme];
  const { categories } = useCategories("task");

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [priority, setPriority] = useState<1 | 2 | 3>(2);
  const [note, setNote] = useState("");
  const [statusLabel, setStatusLabel] = useState("CREATED");

  useEffect(() => {
    if (plan) {
      setTitle(plan.title);
      setCategoryId(plan.category_id || "");
      if (plan.date) {
        const [y, m, d] = plan.date.split("-").map(Number);
        setSelectedDate(new Date(y, m - 1, d));
      }
      setPriority((plan.priority as 1 | 2 | 3) || 2);
      // Assuming 'note' is not on Plan type mainly, but we handle it if passed or managing locally
      // For now, empty or from plan if extended
      setNote((plan as any).note || "");

      if (plan.status) {
        setStatusLabel(plan.status.name.toUpperCase());
      } else {
        setStatusLabel("CREATED");
      }
    }
  }, [plan, visible]);

  const onChangeDate = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSave = () => {
    if (!plan || !title.trim()) return;

    const dateStr =
      selectedDate.getFullYear() +
      "-" +
      String(selectedDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(selectedDate.getDate()).padStart(2, "0");

    const timeStr = selectedDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // We can format note with time as requested previously if needed, or just pass note
    // Preserving previous logic of appending time if note exists or just adding it
    // But since this is specific "details" view, maybe just save the note directly if backend supports it.
    // If backend ignores 'note', we might lose it, but assuming 'onSave' handles it.

    onSave(plan.id, {
      title,
      category_id: categoryId || undefined,
      priority,
      date: dateStr,
      note, // Pass note directly, let parent handle formatting or backend specific logic
    });
    onClose();
  };

  const currentCategory = categories.find((c) => c.id === categoryId);

  if (!plan && !visible) return null;

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: activeScheme === "dark" ? "#1a1a1a" : "#F5F5F5",
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons
                name="chevron-back"
                size={28}
                color={activeScheme === "dark" ? "white" : "black"}
              />
              <Text
                style={[
                  styles.headerTitle,
                  { color: activeScheme === "dark" ? "white" : "black" },
                ]}
              >
                Plan Details
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {/* Top Info: Category & Title */}
            <View style={styles.topSection}>
              <Text style={{ color: "#999", fontSize: 14, marginBottom: 4 }}>
                {currentCategory ? `${currentCategory.name}` : "General Task"}
              </Text>
              <TextInput
                style={[
                  styles.titleInput,
                  { color: activeScheme === "dark" ? "white" : "black" },
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="Task Title"
                placeholderTextColor="#999"
                multiline
              />
            </View>

            {/* Main Details Card */}
            <View
              style={[
                styles.card,
                { backgroundColor: activeScheme === "dark" ? "#333" : "white" },
              ]}
            >
              {/* Row 1: Status & Priority */}
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.label}>Status</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: plan?.status?.color || "#4CAF50" },
                    ]}
                  >
                    <Text style={styles.statusText}>{statusLabel}</Text>
                    <Ionicons name="chevron-down" size={16} color="white" />
                  </View>
                </View>
                <View>
                  <Text style={[styles.label, { textAlign: "right" }]}>
                    Priority
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: "#E3F2FD" },
                    ]}
                    onPress={() =>
                      setPriority((p) => (p === 3 ? 1 : ((p + 1) as 1 | 2 | 3)))
                    }
                  >
                    <Text style={{ color: "#2196F3", fontWeight: "600" }}>
                      {priority === 1
                        ? "Low"
                        : priority === 2
                          ? "Normal"
                          : "High"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Row 2: Assignees */}
              <View style={styles.row}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="person-circle-outline"
                    size={24}
                    color="black"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Assignees</Text>
                  <View style={styles.assigneePlaceholder}>
                    {/* Just a placeholder avatar for 'Me' */}
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: "#eee",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="person" size={20} color="#666" />
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Row 3: Scheduled Date */}
              <View style={styles.row}>
                <View style={styles.iconContainer}>
                  <Ionicons name="calendar-outline" size={24} color="black" />
                </View>
                <View style={{ flex: 1 }}>
                  <TouchableOpacity
                    onPress={() => {
                      if (Platform.OS !== "ios") {
                        setShowPicker(true);
                        setPickerMode("date");
                      }
                    }}
                  >
                    <Text style={styles.label}>Scheduled date</Text>
                    <Text
                      style={[
                        styles.valueText,
                        { color: activeScheme === "dark" ? "white" : "black" },
                      ]}
                    >
                      {selectedDate.toDateString()}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Row 4: Due/Reminder */}
              <View style={styles.rowBetween}>
                <View style={[styles.row, { flex: 1 }]}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="pie-chart-outline" size={24} color="gray" />
                  </View>
                  <View>
                    <Text style={styles.label}>Due</Text>
                    <View
                      style={{ height: 2, width: 40, backgroundColor: "#ddd" }}
                    />
                  </View>
                </View>

                <View style={[styles.row, { flex: 1 }]}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="alarm-outline" size={24} color="black" />
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      if (Platform.OS !== "ios") {
                        setShowPicker(true);
                        setPickerMode("time");
                      }
                    }}
                  >
                    <Text style={styles.label}>Reminder</Text>
                    <Text
                      style={[
                        styles.valueText,
                        { color: activeScheme === "dark" ? "white" : "black" },
                        {
                          minWidth: 60,
                          borderBottomWidth: 1,
                          borderColor: "#ddd",
                        },
                      ]}
                    >
                      {selectedDate.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Note Card */}
            <Text style={styles.sectionHeader}>NOTE</Text>
            <View
              style={[
                styles.card,
                styles.noteCard,
                { backgroundColor: activeScheme === "dark" ? "#333" : "white" },
              ]}
            >
              <TextInput
                style={[
                  styles.noteInput,
                  { color: activeScheme === "dark" ? "white" : "black" },
                ]}
                value={note}
                onChangeText={setNote}
                multiline
                placeholder="Add notes..."
                placeholderTextColor="#999"
              />
            </View>
          </ScrollView>

          {/* Footer Save Button */}
          <View
            style={[
              styles.footer,
              {
                backgroundColor:
                  activeScheme === "dark" ? "#1a1a1a" : "#F5F5F5",
              },
            ]}
          >
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>

          {showPicker && (
            <DateTimePicker
              value={selectedDate}
              mode={pickerMode}
              is24Hour={true}
              display="default"
              onChange={onChangeDate}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 40 : 60,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  topSection: {
    marginBottom: 20,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 4,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end", // Align bottom
    paddingVertical: 12,
  },
  label: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  valueText: {
    fontSize: 16,
    fontWeight: "400",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 40, // Indent for icon
  },
  iconContainer: {
    width: 40,
    alignItems: "flex-start",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  assigneePlaceholder: {
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333", // Or active text
    marginBottom: 8,
    textTransform: "uppercase",
  },
  noteCard: {
    minHeight: 200,
  },
  noteInput: {
    fontSize: 16,
    textAlignVertical: "top",
    flex: 1,
  },
  footer: {
    padding: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  saveBtn: {
    backgroundColor: "#2E5077", // Industrial blue-ish
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
