import { EntityId, Todo } from "@/types";

export interface TodoRepository {
  getAll(): Promise<Todo[]>;
  getById(id: EntityId): Promise<Todo | null>;
  create(todo: Todo): Promise<void>;
  update(id: EntityId, updates: Partial<Todo>): Promise<void>;
  delete(id: EntityId): Promise<void>; // Soft delete
  addHistory(
    todoId: EntityId,
    entry: { id: string; completed_at: string; notes?: string },
  ): Promise<void>;
}
