import { getDb } from "@/db/client";
import { EntityId, Todo } from "@/types";
import { SQLiteDatabase } from "expo-sqlite";
import { TodoRepository } from "./TodoRepository";

export class SqliteTodoRepository implements TodoRepository {
  private db: SQLiteDatabase | null = null;

  private async getDatabase(): Promise<SQLiteDatabase> {
    if (!this.db) {
      this.db = await getDb();
    }
    return this.db;
  }

  async getAll(): Promise<Todo[]> {
    const db = await this.getDatabase();
    // Only fetch non-deleted items
    const result = await db.getAllAsync<Todo>(
      "SELECT * FROM todos WHERE deleted_at IS NULL ORDER BY created_at DESC"
    );
    return result;
  }

  async getById(id: EntityId): Promise<Todo | null> {
    const db = await this.getDatabase();
    const result = await db.getFirstAsync<Todo>(
      "SELECT * FROM todos WHERE id = ? AND deleted_at IS NULL",
      [id]
    );
    return result || null;
  }

  async create(todo: Todo): Promise<void> {
    const db = await this.getDatabase();
    await db.runAsync(
      `INSERT INTO todos (id, title, description, due_date, is_completed, priority, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        todo.id,
        todo.title,
        todo.description ?? null,
        todo.due_date ?? null,
        todo.is_completed ? 1 : 0,
        todo.priority,
        todo.created_at,
        todo.updated_at,
      ]
    );
  }

  async update(id: EntityId, updates: Partial<Todo>): Promise<void> {
    const db = await this.getDatabase();

    // Dynamically build query
    const fields = Object.keys(updates).filter((k) => k !== "id");
    if (fields.length === 0) return;

    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => {
      const val = updates[f as keyof Todo];
      if (typeof val === "boolean") return val ? 1 : 0;
      return val === undefined ? null : val;
    });

    // Always update 'updated_at'
    // We append updated_at to the setClause if it's not already there?
    // Usually the service layer handles setting updated_at, but we can enforce it here too.
    // For now, assume service passed usage of updated_at or we trust it.

    await db.runAsync(`UPDATE todos SET ${setClause} WHERE id = ?`, [
      ...values,
      id,
    ] as (string | number | null)[]);
  }

  async delete(id: EntityId): Promise<void> {
    const db = await this.getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      "UPDATE todos SET deleted_at = ?, updated_at = ? WHERE id = ?",
      [now, now, id]
    );
  }
}
