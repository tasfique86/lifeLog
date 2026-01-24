import { PlanCard } from "@/components/plan/PlanCard";
import { PlanModal } from "@/components/plan/PlanModal";
import { Colors } from "@/constants/Colors";
import { usePlans } from "@/hooks/usePlans";
import { useThemeStore } from "@/store/themeStore";
import { Plan, PlanStatus } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Plans() {
  const { getComputedScheme } = useThemeStore();
  const theme = getComputedScheme();
  const activeColors = Colors[theme];
  const router = useRouter();

  // State
  const [selectedStatusId, setSelectedStatusId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  // Data
  const today = new Date().toISOString().split("T")[0];
  const { plans, services, actions } = usePlans(today);
  const { statuses } = services;

  // Derived State
  const filteredPlans = plans.filter((plan) => {
    const matchesStatus =
      selectedStatusId === "ALL" || plan.status_id === selectedStatusId;
    const matchesSearch = plan.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreatePlan = (data: any) => {
    // Determine initial status (default 'Created' or first available)
    let initialStatusId = "";
    if (statuses.length > 0) {
      const created = statuses.find((s) => s.name === "Created");
      initialStatusId = created ? created.id : statuses[0].id;
    }

    actions.createPlan({
      title: data.title,
      category_id: data.category_id,
      priority: data.priority,
      date: data.date,
      status_id: initialStatusId,
      planned_duration_minutes: 60, // Default for now
    });
    // Modal will close via prop
  };

  const handlePressPlan = (plan: Plan) => {
    router.push(`/plan/${plan.id}`);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeColors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: activeColors.text }]}>
          Plans
        </Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={[styles.addButton, { backgroundColor: activeColors.primary }]}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View
        style={[styles.searchContainer, { backgroundColor: activeColors.card }]}
      >
        <Ionicons name="search" size={20} color={activeColors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: activeColors.text }]}
          placeholder="Search Plans"
          placeholderTextColor={activeColors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Status Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          <TouchableOpacity
            style={[
              styles.tab,
              selectedStatusId === "ALL" && {
                backgroundColor: activeColors.primary,
              },
              selectedStatusId !== "ALL" && {
                backgroundColor: activeColors.card,
              },
            ]}
            onPress={() => setSelectedStatusId("ALL")}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    selectedStatusId === "ALL" ? "white" : activeColors.text,
                },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {statuses.map((status: PlanStatus) => (
            <TouchableOpacity
              key={status.id}
              style={[
                styles.tab,
                selectedStatusId === status.id && {
                  backgroundColor: status.color,
                },
                selectedStatusId !== status.id && {
                  backgroundColor: activeColors.card,
                },
              ]}
              onPress={() => setSelectedStatusId(status.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  // If selected, assume white text for contrast on color, else text color
                  {
                    color:
                      selectedStatusId === status.id
                        ? "white"
                        : activeColors.text,
                  },
                ]}
              >
                {status.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={filteredPlans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlanCard plan={item} onPress={handlePressPlan} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: activeColors.textSecondary }}>
              No plans found.
            </Text>
          </View>
        }
      />

      <PlanModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleCreatePlan}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  addButton: {
    padding: 8,
    borderRadius: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabsContent: {
    gap: 8,
    paddingRight: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },
});
