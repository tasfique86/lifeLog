import { getDb } from "@/db/client";
import { EntityId, Plan, PlanExecution, PlanStatus } from "@/types";
import * as Crypto from "expo-crypto";
import { SQLiteDatabase } from "expo-sqlite";
import { PlanRepository } from "./PlanRepository";

export class SqlitePlanRepository implements PlanRepository {
  private async getDatabase(): Promise<SQLiteDatabase> {
    return await getDb();
  }

  // --- Plan Operations ---

  async getPlans(date?: string): Promise<Plan[]> {
    const db = await this.getDatabase();
    // Fetch plans with Category and Status details
    let query = `SELECT 
        p.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        c.type as category_type,
        s.name as status_name,
        s.color as status_color,
        s.sort_order as status_order,
        s.is_system as status_is_system
       FROM plans p
       LEFT JOIN categories c ON p.category_id = c.id
       INNER JOIN plan_statuses s ON p.status_id = s.id
       WHERE p.deleted_at IS NULL`;

    const params: any[] = [];
    if (date) {
      query += ` AND p.date = ?`;
      params.push(date);
    }

    query += ` ORDER BY p.date ASC, p.priority DESC, p.created_at ASC`;

    const rows = await db.getAllAsync<any>(query, params);

    return rows.map((row) => {
      const {
        category_name,
        category_icon,
        category_color,
        category_type,
        status_name,
        status_color,
        status_order,
        status_is_system,
        ...planFields
      } = row;

      return {
        ...planFields,
        category: planFields.category_id
          ? {
              id: planFields.category_id,
              name: category_name,
              icon: category_icon,
              color: category_color,
              type: category_type,
              created_at: "",
              updated_at: "",
            }
          : undefined,
        status: {
          id: planFields.status_id,
          name: status_name,
          color: status_color,
          sort_order: status_order,
          is_system: !!status_is_system,
          created_at: "",
          updated_at: "",
        },
      };
    });
  }

  async getPlanById(id: EntityId): Promise<Plan | null> {
    const db = await this.getDatabase();
    const row = await db.getFirstAsync<any>(
      `SELECT * FROM plans WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );
    if (!row) return null;
    return row;
  }

  async createPlan(
    plan: Omit<Plan, "id" | "created_at" | "updated_at">,
  ): Promise<Plan> {
    const db = await this.getDatabase();
    const now = new Date().toISOString();
    const id = Crypto.randomUUID();

    const newPlan: Plan = {
      ...plan,
      id,
      created_at: now,
      updated_at: now,
    };

    await db.runAsync(
      `INSERT INTO plans (id, title, category_id, status_id, date, priority, planned_duration_minutes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newPlan.id,
        newPlan.title,
        newPlan.category_id ?? null,
        newPlan.status_id,
        newPlan.date,
        newPlan.priority,
        newPlan.planned_duration_minutes ?? null,
        newPlan.created_at,
        newPlan.updated_at,
      ],
    );

    return newPlan;
  }

  async updatePlan(id: EntityId, updates: Partial<Plan>): Promise<Plan> {
    const db = await this.getDatabase();
    const now = new Date().toISOString();

    // Filter columns to avoid "no such column 'category'" errors
    const validColumns = [
      "title",
      "category_id",
      "status_id",
      "date",
      "priority",
      "planned_duration_minutes",
    ];
    const fields = Object.keys(updates).filter((k) => validColumns.includes(k));

    // If no valid columns to update, but the call was made, check if we should just touch updated_at
    if (fields.length === 0) {
      // If we really wanted to update something but filtered everything out,
      // we might still want to bump timestamp or return current.
      // If 'updated_at' was manually passed, ignore it because we set it anyway.
      await db.runAsync(`UPDATE plans SET updated_at = ? WHERE id = ?`, [
        now,
        id,
      ]);
      return (await this.getPlanById(id))!;
    }

    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => {
      const val = updates[f as keyof Plan];
      // Ensure standard primitives for SQLite
      if (typeof val === "boolean") return val ? 1 : 0;
      return val === undefined ? null : val;
    });

    await db.runAsync(
      `UPDATE plans SET ${setClause}, updated_at = ? WHERE id = ?`,
      [...(values as any[]), now, id],
    );

    return (await this.getPlanById(id))!;
  }

  async deletePlan(id: EntityId): Promise<void> {
    const db = await this.getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(`UPDATE plans SET deleted_at = ? WHERE id = ?`, [
      now,
      id,
    ]);
  }

  // --- Execution Operations ---

  async startPlan(planId: EntityId, startTime: string): Promise<PlanExecution> {
    const db = await this.getDatabase();
    const now = new Date().toISOString();
    const id = Crypto.randomUUID();

    const execution: PlanExecution = {
      id,
      plan_id: planId,
      actual_start_time: startTime,
      distraction_count: 0,
      created_at: now,
      updated_at: now,
    };

    await db.runAsync(
      `INSERT INTO plan_executions (id, plan_id, actual_start_time, distraction_count, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      [
        execution.id,
        execution.plan_id,
        execution.actual_start_time ?? null,
        0,
        execution.created_at,
        execution.updated_at,
      ],
    );

    return execution;
  }

  async stopPlan(
    executionId: EntityId,
    endTime: string,
    focusLevel?: number,
    distractionCount?: number,
  ): Promise<void> {
    const db = await this.getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE plan_executions 
           SET actual_end_time = ?, focus_level = ?, distraction_count = ?, updated_at = ?
           WHERE id = ?`,
      [endTime, focusLevel ?? null, distractionCount ?? 0, now, executionId],
    );
  }

  async updateExecution(
    id: EntityId,
    updates: Partial<PlanExecution>,
  ): Promise<void> {
    const db = await this.getDatabase();
    const now = new Date().toISOString();
    if (updates.distraction_count !== undefined) {
      await db.runAsync(
        `UPDATE plan_executions SET distraction_count = ?, updated_at = ? WHERE id = ?`,
        [updates.distraction_count, now, id],
      );
    }
  }

  async getExecutionsByPlanId(planId: EntityId): Promise<PlanExecution[]> {
    const db = await this.getDatabase();
    return await db.getAllAsync<PlanExecution>(
      `SELECT * FROM plan_executions WHERE plan_id = ? AND deleted_at IS NULL ORDER BY created_at DESC`,
      [planId],
    );
  }

  // --- Status Operations ---

  async getStatuses(): Promise<PlanStatus[]> {
    const db = await this.getDatabase();
    return await db.getAllAsync<PlanStatus>(
      `SELECT * FROM plan_statuses WHERE deleted_at IS NULL ORDER BY sort_order ASC`,
    );
  }

  async createStatus(
    status: Omit<PlanStatus, "id" | "created_at" | "updated_at">,
  ): Promise<PlanStatus> {
    const db = await this.getDatabase();
    const now = new Date().toISOString();
    const id = Crypto.randomUUID();

    const newStatus: PlanStatus = {
      ...status,
      id,
      created_at: now,
      updated_at: now,
    };

    await db.runAsync(
      `INSERT INTO plan_statuses (id, name, color, sort_order, is_system, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        status.name,
        status.color,
        status.sort_order,
        status.is_system ? 1 : 0,
        now,
        now,
      ],
    );

    return newStatus;
  }

  async updateStatus(
    id: EntityId,
    updates: Partial<PlanStatus>,
  ): Promise<PlanStatus> {
    const db = await this.getDatabase();
    const now = new Date().toISOString();

    const fields = Object.keys(updates).filter(
      (k) => k !== "id" && k !== "created_at",
    );
    if (fields.length === 0) throw new Error("No updates provided");

    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => {
      const val = updates[f as keyof PlanStatus];
      if (typeof val === "boolean") return val ? 1 : 0;
      return val === undefined ? null : val;
    });

    await db.runAsync(
      `UPDATE plan_statuses SET ${setClause}, updated_at = ? WHERE id = ?`,
      [...(values as any[]), now, id],
    );

    return { ...updates, id } as PlanStatus; // Placeholder return, usually fetch again
  }

  async deleteStatus(id: EntityId): Promise<void> {
    const db = await this.getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(`UPDATE plan_statuses SET deleted_at = ? WHERE id = ?`, [
      now,
      id,
    ]);
  }
}
