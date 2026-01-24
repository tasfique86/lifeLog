import { useCategories } from "@/hooks/useCategories";
import { usePlans } from "@/hooks/usePlans";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreatePlanScreen() {
  const router = useRouter();
  const { actions, services: planServices } = usePlans();
  const { statuses } = planServices;
  const { categories } = useCategories("task"); // Fetch real categories

  // Filter for categories that make sense for plans if needed?
  // User image shows: Personal, Office, Health, Other.
  // We'll use whatever is in DB.

  const [title, setTitle] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [priority, setPriority] = useState<1 | 2 | 3>(1); // 1=Low, 2=Normal, 3=High? User image says: Normal, Low, High.
  // Let's map: Low=1, Normal=2, High=3. Default Normal (2).
  const [note, setNote] = useState(""); // UI only for now

  // Default priority to Normal (2) to match UI "Normal" usually being default or first?
  // User image has Normal selected.

  const handleCreate = () => {
    if (!title.trim()) return;

    // Determine initial status (default 'Created' or first available)
    let initialStatusId = "";
    if (statuses.length > 0) {
      // Try to find 'Created'
      const created = statuses.find((s) => s.name === "Created");
      initialStatusId = created ? created.id : statuses[0].id;
    }

    actions.createPlan({
      title,
      category_id: selectedCategoryId || undefined,
      priority,
      date,
      status_id: initialStatusId,
      planned_duration_minutes: 60,
    });
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Orange Header */}
      <View style={styles.header}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Create Plan</Text>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        {/* Title Input */}
        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          placeholderTextColor="#9ca3af"
          value={title}
          onChangeText={setTitle}
        />

        {/* Category Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsContainer}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.pill,
                  selectedCategoryId === cat.id && styles.pillActive,
                ]}
                onPress={() => setSelectedCategoryId(cat.id)}
              >
                <Text
                  style={[
                    styles.pillText,
                    selectedCategoryId === cat.id && styles.pillTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
            {/* Fallback if no categories */}
            {categories.length === 0 && (
              <Text style={{ color: "#9ca3af", fontStyle: "italic" }}>
                No categories found
              </Text>
            )}
          </ScrollView>
        </View>

        {/* Date Section */}
        <View style={styles.section}>
          <View style={styles.dateRow}>
            <Ionicons name="calendar" size={24} color="black" />
            <Text style={styles.dateLabel}>Schedule Date :</Text>
          </View>
          <TextInput
            style={styles.dateInput}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
          />
          <View style={styles.underline} />
        </View>

        {/* Priority Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.pillsContainer}>
            {/* Mapping UI "Normal, Low, High" to 1,2,3 */}
            {[
              { label: "Normal", value: 2 },
              { label: "Low", value: 1 },
              { label: "High", value: 3 },
            ].map((p) => (
              <TouchableOpacity
                key={p.label}
                style={[styles.pill, priority === p.value && styles.pillActive]}
                onPress={() => setPriority(p.value as 1 | 2 | 3)}
              >
                <Text
                  style={[
                    styles.pillText,
                    priority === p.value && styles.pillTextActive,
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reminder (Mock) */}
        <View style={styles.section}>
          <View style={styles.dateRow}>
            <Ionicons name="alarm-outline" size={24} color="black" />
            <Text style={styles.dateLabel}>Reminder</Text>
          </View>
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.label}>Note :</Text>
          <TextInput
            style={styles.noteInput}
            multiline
            numberOfLines={6}
            value={note}
            onChangeText={setNote}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createText}>Create</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6", // Light grey background
  },
  header: {
    backgroundColor: "#f97316", // Orange
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  form: {
    padding: 20,
    gap: 24,
    paddingBottom: 100,
  },
  titleInput: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  section: {
    gap: 10,
  },
  label: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
  pillsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  pill: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  pillActive: {
    backgroundColor: "#3b82f6", // Blue
    borderColor: "#3b82f6",
  },
  pillText: {
    color: "#374151",
    fontWeight: "500",
  },
  pillTextActive: {
    color: "white",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateLabel: {
    fontSize: 16,
    color: "#374151",
  },
  dateInput: {
    fontSize: 16,
    marginTop: 4,
    paddingVertical: 4,
  },
  underline: {
    height: 1,
    backgroundColor: "#d1d5db",
  },
  noteInput: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    height: 150,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#f3f4f6",
    flexDirection: "row",
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#fee2e2", // Light red
    borderWidth: 1,
    borderColor: "#ef4444",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelText: {
    color: "#dc2626",
    fontWeight: "bold",
    fontSize: 16,
  },
  createButton: {
    flex: 1,
    backgroundColor: "#dcfce7", // Light green
    borderWidth: 1,
    borderColor: "#22c55e",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  createText: {
    color: "#15803d",
    fontWeight: "bold",
    fontSize: 16,
  },
});
