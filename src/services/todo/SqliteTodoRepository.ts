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
    // Only fetch non-deleted items with category details
    const result = await db.getAllAsync<any>(
      `SELECT 
        t.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        c.type as category_type
       FROM todos t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.deleted_at IS NULL 
       ORDER BY 
         t.is_completed ASC, 
         t.priority DESC, 
         COALESCE(t.due_date, '9999-12-31') ASC, 
         t.created_at DESC`,
    );

    // Map result to Todo objects with nested category
    return result.map((row) => {
      const {
        category_name,
        category_icon,
        category_color,
        category_type,
        ...todoFields
      } = row;
      return {
        ...todoFields,
        category: todoFields.category_id
          ? {
              id: todoFields.category_id,
              name: category_name,
              icon: category_icon,
              color: category_color,
              type: category_type,
              created_at: "", // Placeholder
              updated_at: "", // Placeholder
            }
          : undefined,
      };
    });
  }

  async getById(id: EntityId): Promise<Todo | null> {
    const db = await this.getDatabase();
    const result = await db.getFirstAsync<Todo>(
      "SELECT * FROM todos WHERE id = ? AND deleted_at IS NULL",
      [id],
    );
    return result || null;
  }

  async create(todo: Todo): Promise<void> {
    const db = await this.getDatabase();
    await db.runAsync(
      `INSERT INTO todos (id, title, description, due_date, is_completed, priority, recurring_rule, tags, category_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        todo.id,
        todo.title,
        todo.description ?? null,
        todo.due_date ?? null,
        todo.is_completed ? 1 : 0,
        todo.priority,
        todo.recurring_rule ?? null,
        todo.tags ?? null,
        todo.category_id ?? null,
        todo.created_at,
        todo.updated_at,
      ],
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
      [now, now, id],
    );
  }
  async addHistory(
    todoId: EntityId,
    entry: { id: string; completed_at: string; notes?: string },
  ): Promise<void> {
    const db = await this.getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO todo_history (id, todo_id, completed_at, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [entry.id, todoId, entry.completed_at, entry.notes ?? null, now, now],
    );
  }
  async getCompletedRecurringTasks(type: string): Promise<Todo[]> {
    const db = await this.getDatabase();
    // Fetch completed tasks with specific recurring rule
    // Note: This matches exact string 'daily'. Ideally, we might parse rules, but for now 'daily' is the implementation.
    return await db.getAllAsync<Todo>(
      "SELECT * FROM todos WHERE recurring_rule = ? AND is_completed = 1 AND deleted_at IS NULL",
      [type],
    );
  }

  async resetTasks(ids: EntityId[]): Promise<void> {
    if (ids.length === 0) return;
    const db = await this.getDatabase();
    const now = new Date().toISOString();

    const placeholders = ids.map(() => "?").join(",");
    // Reset is_completed to 0, clear completed_at
    await db.runAsync(
      `UPDATE todos SET is_completed = 0, completed_at = NULL, updated_at = ? WHERE id IN (${placeholders})`,
      [now, ...ids],
    );
  }
}
