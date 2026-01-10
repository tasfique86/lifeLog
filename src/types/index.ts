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
}

export interface Category extends BaseEntity {
  name: string;
  type: "income" | "expense";
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
