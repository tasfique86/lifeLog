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
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

interface PlanModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: Plan | null;
}

export function PlanModal({
  visible,
  onClose,
  onSave,
  initialData,
}: PlanModalProps) {
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

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCategoryId(initialData.category_id || "");
      // Parse YYYY-MM-DD to local date
      if (initialData.date) {
        const [y, m, d] = initialData.date.split("-").map(Number);
        setSelectedDate(new Date(y, m - 1, d));
      }
      setPriority(initialData.priority as 1 | 2 | 3);
      setNote("");
    } else {
      resetForm();
    }
  }, [initialData, visible]);

  const resetForm = () => {
    setTitle("");
    setCategoryId("");
    setSelectedDate(new Date());
    setPriority(2);
    setNote("");
  };

  const onChangeDate = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;
    // Format date as YYYY-MM-DD for backend
    const dateStr =
      selectedDate.getFullYear() +
      "-" +
      String(selectedDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(selectedDate.getDate()).padStart(2, "0");

    // Check if time is non-default (optional enhancement, here we just pass note)
    // Maybe append time to note if user wants time persistence
    const timeStr = selectedDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const noteWithTime = note
      ? `${note}\n[Time: ${timeStr}]`
      : `[Time: ${timeStr}]`;

    onSave({
      title,
      category_id: categoryId || undefined,
      priority,
      date: dateStr,
      note: noteWithTime,
    });
    onClose();
  };

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
            styles.modal,
            {
              backgroundColor: theme.background,
              borderWidth: 1.5,
              borderColor: theme.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              {initialData ? "Edit Plan" : "Create Plan"}
            </Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView contentContainerStyle={styles.content}>
            {/* Title */}
            <Input
              label="Title"
              value={title}
              onChangeText={setTitle}
              placeholder="Plan Title"
              theme={theme}
              required
            />

            {/* Category */}
            <Section title="Category" theme={theme}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.pill,
                      { borderColor: theme.border },
                      categoryId === cat.id && {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      },
                    ]}
                    onPress={() => setCategoryId(cat.id)}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        { color: theme.text },
                        categoryId === cat.id && { color: "white" },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
                {categories.length === 0 && (
                  <Text style={{ color: theme.textSecondary }}>
                    No categories
                  </Text>
                )}
              </ScrollView>
            </Section>

            {/* Date + Time */}
            <Section title="Schedule" theme={theme}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  style={[
                    styles.input,
                    {
                      flex: 1,
                      justifyContent: "center",
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => {
                    if (showPicker && pickerMode === "date") {
                      setShowPicker(false);
                    } else {
                      setPickerMode("date");
                      setShowPicker(true);
                    }
                  }}
                >
                  <Text style={{ color: theme.text }}>
                    {selectedDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.input,
                    {
                      flex: 1,
                      justifyContent: "center",
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => {
                    if (showPicker && pickerMode === "time") {
                      setShowPicker(false);
                    } else {
                      setPickerMode("time");
                      setShowPicker(true);
                    }
                  }}
                >
                  <Text style={{ color: theme.text }}>
                    {selectedDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>
              </View>

              {showPicker && (
                <View>
                  <DateTimePicker
                    value={selectedDate}
                    mode={pickerMode}
                    is24Hour={true}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onChangeDate}
                    themeVariant={activeScheme}
                    textColor={theme.text}
                  />
                  {Platform.OS === "ios" && (
                    <TouchableOpacity
                      style={[
                        styles.btn,
                        { backgroundColor: theme.card, marginTop: 8 },
                      ]}
                      onPress={() => setShowPicker(false)}
                    >
                      <Text
                        style={{ color: theme.primary, fontWeight: "bold" }}
                      >
                        Done
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <View style={styles.reminderRow}>
                <Ionicons name="alarm-outline" size={20} color={theme.text} />
                <Text style={{ color: theme.text, flex: 1, marginLeft: 8 }}>
                  Reminder
                </Text>
                <Ionicons name="toggle" size={24} color={theme.textSecondary} />
              </View>
            </Section>

            {/* Priority */}
            <Section title="Priority" theme={theme}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {[
                  { label: "Low", value: 1 },
                  { label: "Normal", value: 2 },
                  { label: "High", value: 3 },
                ].map((p) => (
                  <TouchableOpacity
                    key={p.label}
                    style={[
                      styles.pill,
                      {
                        flex: 1,
                        alignItems: "center",
                        borderColor: theme.border,
                      },
                      priority === p.value && {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      },
                    ]}
                    onPress={() => setPriority(p.value as 1 | 2 | 3)}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        { color: theme.text },
                        priority === p.value && { color: "white" },
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Section>

            {/* Note */}
            <Input
              label="Note"
              value={note}
              onChangeText={setNote}
              multiline
              theme={theme}
              placeholder="Add notes..."
            />
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[
                styles.btn,
                styles.btnOutline,
                { borderColor: theme.border },
              ]}
              onPress={onClose}
            >
              <Text style={{ color: theme.text }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btn,
                styles.btnPrimary,
                { backgroundColor: theme.primary },
              ]}
              onPress={handleSave}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                {initialData ? "Update" : "Create"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Sub-components for cleaner code
const Section = ({ title, children, theme }: any) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
      {title}
    </Text>
    {children}
  </View>
);

const Input = ({ label, required, multiline, theme, ...props }: any) => (
  <View style={styles.section}>
    {label && (
      <Text style={[styles.label, { color: theme.text }]}>
        {label} {required && <Text style={{ color: "red" }}>*</Text>}
      </Text>
    )}
    <TextInput
      style={[
        styles.input,
        {
          color: theme.text,
          borderColor: theme.border,
          backgroundColor: theme.card,
          height: multiline ? 80 : 44,
          textAlignVertical: multiline ? "top" : "center",
        },
      ]}
      multiline={multiline}
      placeholderTextColor={theme.textSecondary}
      {...props}
    />
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    borderRadius: 16,
    maxHeight: "90%",
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    fontWeight: "600",
    marginBottom: 4,
  },
  label: {
    fontWeight: "500",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "500",
  },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  btn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  btnOutline: {
    borderWidth: 1,
  },
  btnPrimary: {
    // bg set in inline
  },
});
