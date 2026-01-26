import { EntityId, Plan, PlanExecution, PlanStatus } from "@/src/types";

export interface PlanRepository {
  // Plan Operations
  getPlans(date?: string): Promise<Plan[]>;
  getPlanById(id: EntityId): Promise<Plan | null>;
  createPlan(
    plan: Omit<Plan, "id" | "created_at" | "updated_at">,
  ): Promise<Plan>;
  updatePlan(id: EntityId, updates: Partial<Plan>): Promise<Plan>;
  deletePlan(id: EntityId): Promise<void>;

  // Execution Operations
  startPlan(planId: EntityId, startTime: string): Promise<PlanExecution>;
  stopPlan(
    executionId: EntityId,
    endTime: string,
    focusLevel?: number,
    distractionCount?: number,
  ): Promise<void>;
  updateExecution(id: EntityId, updates: Partial<PlanExecution>): Promise<void>;
  getExecutionsByPlanId(planId: EntityId): Promise<PlanExecution[]>;

  // Status Operations
  getStatuses(): Promise<PlanStatus[]>;
  createStatus(
    status: Omit<PlanStatus, "id" | "created_at" | "updated_at">,
  ): Promise<PlanStatus>;
  updateStatus(id: EntityId, updates: Partial<PlanStatus>): Promise<PlanStatus>;
  deleteStatus(id: EntityId): Promise<void>;
}
