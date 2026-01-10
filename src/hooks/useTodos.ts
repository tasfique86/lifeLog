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
      todoData: Omit<Todo, "id" | "created_at" | "updated_at" | "deleted_at">
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
      await todoRepo.update(id, {
        is_completed,
        updated_at: new Date().toISOString(),
      });
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
