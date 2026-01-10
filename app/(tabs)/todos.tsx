import { TaskItem } from "@/src/components/TaskItem";
import { Colors } from "@/src/constants/Colors";
import { useTodos } from "@/src/hooks/useTodos";
import { useThemeStore } from "@/src/store/themeStore";
import { Todo } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TodosScreen() {
  const { getComputedScheme } = useThemeStore();
  const theme = getComputedScheme();
  const activeColors = Colors[theme];
  const { todos, isLoading, addTodo, toggleTodo, deleteTodo } = useTodos();

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (!title.trim()) return;
    addTodo({
      title,
      description,
      priority: 1, // Default to Low
      is_completed: false,
    });
    setTitle("");
    setDescription("");
    setModalVisible(false);
  };
  const renderItem = ({ item }: { item: Todo }) => (
    <TaskItem
      todo={item}
      onToggle={(id, currentStatus) =>
        toggleTodo({ id, is_completed: !currentStatus })
      }
      onDelete={(id) => deleteTodo(id)}
      onLongPress={() => {
        setTitle(item.title);
        setDescription(item.description || "");
        setModalVisible(true);
        // Note: Logic for editing isn't fully implemented in the modal yet (it just creates new),
        // but this wires up the gesture.
      }}
    />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeColors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: activeColors.text }]}>Tasks</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={32} color={activeColors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: activeColors.textSecondary }}>
              No tasks yet.
            </Text>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: activeColors.card },
            ]}
          >
            <Text style={[styles.modalTitle, { color: activeColors.text }]}>
              New Task
            </Text>

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

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalBtn}
              >
                <Text style={{ color: activeColors.textSecondary }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreate}
                style={[
                  styles.modalBtn,
                  { backgroundColor: activeColors.primary },
                ]}
              >
                <Text style={{ color: "#FFF" }}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: "center",
  },
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
});
