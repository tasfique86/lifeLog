import { Colors } from "@/src/constants/Colors";
import { useCategories } from "@/src/hooks/useCategories";
import { useThemeStore } from "@/src/store/themeStore";
import { Todo } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface TodoModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    priority: 1 | 2 | 3;
    recurring_rule: "daily" | null;
    due_date?: string;
    category_id?: string;
  }) => void;
  initialData?: Todo | null;
}

export function TodoModal({
  visible,
  onClose,
  onSave,
  initialData,
}: TodoModalProps) {
  const { getComputedScheme } = useThemeStore();
  const theme = getComputedScheme();
  const activeColors = Colors[theme];
  const { categories } = useCategories("task");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<1 | 2 | 3>(1);
  const [isRecurring, setIsRecurring] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >(undefined);

  // Load initial data when valid, otherwise reset
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || "");
        setPriority(initialData.priority as 1 | 2 | 3);
        setIsRecurring(initialData.recurring_rule === "daily");
        setDueDate(
          initialData.due_date ? new Date(initialData.due_date) : undefined,
        );
        setSelectedCategoryId(initialData.category_id);
      } else {
        resetForm();
      }
    }
  }, [visible, initialData]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority(1);
    setIsRecurring(false);
    setDueDate(undefined);
    setSelectedCategoryId(undefined);
  };

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title,
      description,
      priority,
      recurring_rule: isRecurring ? "daily" : null,
      due_date: dueDate ? dueDate.toISOString() : undefined,
      category_id: selectedCategoryId,
    });

    // Close & Reset is handled by parent or effect, but good to ensure
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View
          style={[styles.modalContent, { backgroundColor: activeColors.card }]}
        >
          <Text style={[styles.modalTitle, { color: activeColors.text }]}>
            {initialData ? "Edit Task" : "New Task"}
          </Text>

          {/* Title Input */}
          <TextInput
            style={[
              styles.input,
              { color: activeColors.text, borderColor: activeColors.border },
            ]}
            placeholder="Task Title"
            placeholderTextColor={activeColors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />

          {/* Description Input */}
          <TextInput
            style={[
              styles.input,
              {
                color: activeColors.text,
                borderColor: activeColors.border,
                height: 80,
              },
            ]}
            placeholder="Description (Optional)"
            placeholderTextColor={activeColors.textSecondary}
            multiline
            value={description}
            onChangeText={setDescription}
          />

          {/* Category Selector */}
          <View style={styles.optionRow}>
            <Text style={[styles.optionLabel, { color: activeColors.text }]}>
              Category
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            {categories.map((cat) => {
              const isActive = selectedCategoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() =>
                    setSelectedCategoryId(isActive ? undefined : cat.id)
                  }
                  style={[
                    styles.categoryChip,
                    {
                      borderColor: cat.color,
                      backgroundColor: isActive ? cat.color : "transparent",
                    },
                  ]}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={16}
                    color={isActive ? "#FFF" : cat.color}
                  />
                  <Text
                    style={{
                      color: isActive ? "#FFF" : cat.color,
                      fontWeight: "600",
                      fontSize: 12,
                    }}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Priority Selector */}
          <View style={[styles.optionRow, { marginTop: 16 }]}>
            <Text style={[styles.optionLabel, { color: activeColors.text }]}>
              Priority
            </Text>
            <View style={styles.priorityContainer}>
              {[1, 2, 3].map((p) => {
                const getActiveColor = (val: number) => {
                  switch (val) {
                    case 3:
                      return "#ef4444"; // Red
                    case 2:
                      return "#f97316"; // Orange
                    default:
                      return "#22c55e"; // Green
                  }
                };
                const activeColor = getActiveColor(p);
                const isActive = priority === p;

                return (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPriority(p as 1 | 2 | 3)}
                    style={[
                      styles.priorityBtn,
                      isActive && {
                        backgroundColor: activeColor,
                        borderColor: activeColor,
                      },
                      !isActive && { borderColor: activeColors.border },
                    ]}
                  >
                    <Text
                      style={{
                        color: isActive ? "#FFF" : activeColors.text,
                        fontWeight: "600",
                      }}
                    >
                      {p === 1 ? "Low" : p === 2 ? "Med" : "High"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Recurring Toggle */}
          <View style={styles.optionRow}>
            <Text style={[styles.optionLabel, { color: activeColors.text }]}>
              Repeat Daily
            </Text>
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
              trackColor={{ false: "#767577", true: activeColors.primary }}
              thumbColor={isRecurring ? "#fff" : "#f4f3f4"}
            />
          </View>

          {/* Time Picker Section */}
          <View style={styles.optionRow}>
            <Text style={[styles.optionLabel, { color: activeColors.text }]}>
              Due Time
            </Text>
            {Platform.OS === "android" && (
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={{
                  backgroundColor: activeColors.card,
                  padding: 8,
                  borderRadius: 8,
                  borderColor: activeColors.border,
                  borderWidth: 1,
                }}
              >
                <Text
                  style={{ color: activeColors.primary, fontWeight: "600" }}
                >
                  {dueDate
                    ? dueDate.toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Set Time"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="time"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDueDate(selectedDate);
                }
              }}
            />
          )}

          {/* Action Buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={handleClose} style={styles.modalBtn}>
              <Text style={{ color: activeColors.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={[
                styles.modalBtn,
                { backgroundColor: activeColors.primary },
              ]}
            >
              <Text style={{ color: "#FFF" }}>
                {initialData ? "Update" : "Create"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 300,
    marginHorizontal: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  priorityContainer: {
    flexDirection: "row",
    gap: 8,
  },
  priorityBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryContainer: {
    paddingVertical: 8,
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    marginRight: 8,
  },
});
