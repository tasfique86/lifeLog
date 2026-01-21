import { TaskItem } from "@/src/components/TaskItem";
import { TodoModal } from "@/src/components/TodoModal";
import { Colors } from "@/src/constants/Colors";
import { useTodos } from "@/src/hooks/useTodos";
import { useThemeStore } from "@/src/store/themeStore";
import { Todo } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TodosScreen() {
  const { getComputedScheme } = useThemeStore();
  const theme = getComputedScheme();
  const activeColors = Colors[theme];
  const { todos, isLoading, addTodo, toggleTodo, deleteTodo, updateTodo } =
    useTodos();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const handleSaveTodo = (data: {
    title: string;
    description: string;
    priority: 1 | 2 | 3;
    recurring_rule: "daily" | null;
    due_date?: string;
    category_id?: string;
  }) => {
    if (editingTodo) {
      updateTodo({
        id: editingTodo.id,
        data: {
          ...data,
          category_id: data.category_id, // Explicitly pass category_id
          is_completed: editingTodo.is_completed, // Keep existing status
        },
      });
    } else {
      addTodo({
        ...data,
        category_id: data.category_id,
        is_completed: false,
      });
    }
    setModalVisible(false);
    setEditingTodo(null);
  };

  const openNewTask = () => {
    setEditingTodo(null);
    setModalVisible(true);
  };

  const openEditTask = (todo: Todo) => {
    setEditingTodo(todo);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: Todo }) => (
    <TaskItem
      todo={item}
      onToggle={(id, currentStatus) =>
        toggleTodo({ id, is_completed: !currentStatus })
      }
      onDelete={(id) => deleteTodo(id)}
      onLongPress={() => openEditTask(item)}
    />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeColors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: activeColors.text }]}>Tasks</Text>
        <TouchableOpacity onPress={openNewTask}>
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

      <TodoModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingTodo(null);
        }}
        onSave={handleSaveTodo}
        initialData={editingTodo}
      />
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
});
