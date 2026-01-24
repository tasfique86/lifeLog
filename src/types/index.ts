export type EntityId = string; // UUID

export interface BaseEntity {
  id: EntityId;
  created_at: string; // ISO Date
  updated_at: string; // ISO Date
  deleted_at?: string | null; // For Soft Delete / Sync
}

export interface Todo extends BaseEntity {
  title: string;
  description?: string;
  due_date?: string; // ISO Date
  is_completed: boolean;
  priority: 1 | 2 | 3; // 1 = Low, 2 = Medium, 3 = High
  completed_at?: string | null; // ISO Date of completion
  recurring_rule?: string | null; // e.g., 'daily', 'weekly'
  tags?: string; // Comma-separated tags
  category_id?: EntityId; // Link to Category
  category?: Category; // Hydrated Category object
}

export interface TodoHistory extends BaseEntity {
  todo_id: EntityId;
  completed_at: string;
  notes?: string;
}

export interface Category extends BaseEntity {
  name: string;
  type: "income" | "expense" | "task";
  icon: string; // Icon name
  color: string; // Hex code
}

export interface Transaction extends BaseEntity {
  amount: number;
  category_id: EntityId;
  date: string; // ISO Date
  note?: string;
  type: "income" | "expense"; // Denormalized for easier querying
}

export interface UserProfile {
  name: string;
  currency: string;
  isRegistered: boolean;
}

export interface PlanStatus extends BaseEntity {
  name: string;
  color: string;
  sort_order: number;
  is_system: boolean;
}

export interface Plan extends BaseEntity {
  title: string;
  category_id?: EntityId;
  status_id: EntityId;
  date: string; // YYYY-MM-DD
  priority: number;
  planned_duration_minutes?: number;
  // Relations
  category?: Category;
  status?: PlanStatus;
}

export interface PlanExecution extends BaseEntity {
  plan_id: EntityId;
  actual_start_time?: string;
  actual_end_time?: string;
  focus_level?: number;
  distraction_count: number;
}
