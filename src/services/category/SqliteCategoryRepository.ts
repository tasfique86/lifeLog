import { getDb } from "@/src/db/client";
import { Category } from "@/src/types";
import * as Crypto from "expo-crypto";

export class SqliteCategoryRepository {
  async getAllByType(type: "income" | "expense" | "task"): Promise<Category[]> {
    const db = await getDb();
    const result = await db.getAllAsync<Category>(
      `SELECT * FROM categories WHERE type = ? AND deleted_at IS NULL ORDER BY name ASC`,
      [type],
    );
    return result;
  }

  async seedTaskCategories(): Promise<void> {
    const db = await getDb();

    // Check if any task categories exist
    const existing = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM categories WHERE type = 'task' AND deleted_at IS NULL`,
    );

    if (existing && existing.count > 0) return;

    // Seed defaults
    const defaults = [
      { name: "Work", type: "task", icon: "briefcase", color: "#3b82f6" }, // Blue
      { name: "Personal", type: "task", icon: "person", color: "#8b5cf6" }, // Purple
      { name: "Health", type: "task", icon: "fitness", color: "#10b981" }, // Emerald
      { name: "Study", type: "task", icon: "book", color: "#f59e0b" }, // Amber
    ];

    for (const cat of defaults) {
      await db.runAsync(
        `INSERT INTO categories (id, name, type, icon, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          Crypto.randomUUID(),
          cat.name,
          cat.type,
          cat.icon,
          cat.color,
          new Date().toISOString(),
          new Date().toISOString(),
        ],
      );
    }
  }
}
