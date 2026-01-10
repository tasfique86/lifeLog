# Architecture Decisions & Examples

This document explains the advanced architectural patterns suggested for LifeLog to ensure scalability and future backend integration.

## 1. Repository Pattern

**The Problem:**
If you write SQLite queries directly inside your React components or hooks, your app becomes tightly coupled to SQLite. If you later want to switch to Supabase, Firebase, or another backend, you have to rewrite every single file that fetches data.

**The Solution:**
We create a "contract" (Interface) that defines _what_ we need to do (e.g., `getTodos`, `addTodo`), but not _how_. Then we write an implementation for SQLite. Later, we can write an implementation for Supabase.

### Example: Todo Repository

**1. The Interface (The Contract)**
`src/services/todo/TodoRepository.ts`

```typescript
export interface TodoRepository {
  getAll(): Promise<Todo[]>;
  create(todo: Todo): Promise<void>;
  update(id: string, updates: Partial<Todo>): Promise<void>;
  delete(id: string): Promise<void>;
}
```

**2. The SQLite Implementation (Current)**
`src/services/todo/SqliteTodoRepository.ts`

```typescript
import { useSQLiteContext } from 'expo-sqlite';

export class SqliteTodoRepository implements TodoRepository {
  constructor(private db: SQLiteDatabase) {}

  async getAll() {
    return await this.db.getAllAsync('SELECT * FROM todos WHERE deleted_at IS NULL');
  }

  async create(todo) {
    await this.db.runAsync('INSERT INTO todos ...', [todo.id, todo.title...]);
  }
  // ... other methods
}
```

**3. The Supabase Implementation (Future)**
`src/services/todo/SupabaseTodoRepository.ts`

```typescript
import { supabase } from "@/lib/supabase";

export class SupabaseTodoRepository implements TodoRepository {
  async getAll() {
    const { data } = await supabase.from("todos").select("*");
    return data;
  }
  // ... other methods
}
```

**4. Usage in Hook (Transparent)**
The generic hook doesn't care which one is used.

```typescript
const todoRepo = useRepository("todo"); // Returns SqliteRepo for now

const { data } = useQuery({
  queryKey: ["todos"],
  queryFn: () => todoRepo.getAll(), // Works with SQLite OR Supabase!
});
```

---

## 2. Sync Preparation (Soft Deletes & Timestamps)

**The Problem:**
When two devices are offline and modify data, how do you merge them? If User A deletes a task offline, and User B updates it, merging is hard. If you harder delete a row (`DELETE FROM todos`), the sync engine won't know it was ever there to tell the other device to delete it.

**The Solution:**

1.  **Soft Deletes**: Instead of deleting the row, we set a `deleted_at` timestamp. The row stays in the DB but is filtered out of the UI. Sync engines can see this and know "Oh, this was deleted."
2.  **Last Updated**: We track `last_updated_at` so we know which change is newer.

### Schema Changes

**Standard Table:**
| id | title | completed |
|----|-------|-----------|
| 1 | Buy Milk | false |

**Sync-Ready Table:**
| id | title | completed | created_at | updated_at | deleted_at |
|----|-------|-----------|------------|------------|------------|
| 1 | Buy Milk | false | 10:00 AM | 10:05 AM | NULL |
| 2 | Old Task | true | 09:00 AM | 09:30 AM | 11:00 AM |

**Query Change:**
Instead of:
`SELECT * FROM todos`
We use:
`SELECT * FROM todos WHERE deleted_at IS NULL`

**Why do this now?**
Adding these columns later requires complex database migrations. Adding them now costs almost nothing and makes the app "Sync Ready" from day one.
