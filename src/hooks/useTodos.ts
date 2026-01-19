import { SqliteTodoRepository } from "@/src/services/todo/SqliteTodoRepository";
import { EntityId, Todo } from "@/src/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";

const todoRepo = new SqliteTodoRepository();

export function useTodos() {
  const queryClient = useQueryClient();

  const todosQuery = useQuery({
    queryKey: ["todos"],
    queryFn: () => todoRepo.getAll(),
  });

  const addTodoMutation = useMutation({
    mutationFn: async (
      todoData: Omit<Todo, "id" | "created_at" | "updated_at" | "deleted_at">,
    ) => {
      const now = new Date().toISOString();
      const newTodo: Todo = {
        id: Crypto.randomUUID(),
        created_at: now,
        updated_at: now,
        ...todoData,
      };
      await todoRepo.create(newTodo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const toggleTodoMutation = useMutation({
    mutationFn: async ({
      id,
      is_completed,
    }: {
      id: EntityId;
      is_completed: boolean;
    }) => {
      const now = new Date().toISOString();

      // Update the todo
      await todoRepo.update(id, {
        is_completed,
        completed_at: is_completed ? now : null,
        updated_at: now,
      });

      // If completing, add to history
      if (is_completed) {
        await todoRepo.addHistory(id, {
          id: Crypto.randomUUID(),
          completed_at: now,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async (id: EntityId) => {
      await todoRepo.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  return {
    todos: todosQuery.data || [],
    isLoading: todosQuery.isLoading,
    error: todosQuery.error,
    addTodo: addTodoMutation.mutate,
    toggleTodo: toggleTodoMutation.mutate,
    deleteTodo: deleteTodoMutation.mutate,
  };
}
