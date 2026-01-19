import * as SQLite from "expo-sqlite";

// Migration Queries
const MIGRATIONS = [
  // Migration 0: Initial Schema
  `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    is_completed INTEGER DEFAULT 0,
    priority INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'income' or 'expense'
    icon TEXT,
    color TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY NOT NULL,
    amount REAL NOT NULL,
    category_id TEXT NOT NULL,
    date TEXT NOT NULL,
    note TEXT,
    type TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (category_id) REFERENCES categories (id)
  );
  `,
  // Migration 1: Gamification & Analyitcs
  `
  -- Add new columns to todos
  ALTER TABLE todos ADD COLUMN completed_at TEXT;
  ALTER TABLE todos ADD COLUMN recurring_rule TEXT;
  ALTER TABLE todos ADD COLUMN tags TEXT;
  ALTER TABLE todos ADD COLUMN category_id TEXT REFERENCES categories(id);

  -- Create History Table
  CREATE TABLE IF NOT EXISTS todo_history (
    id TEXT PRIMARY KEY NOT NULL,
    todo_id TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (todo_id) REFERENCES todos (id)
  );
  `,
];

export const DB_NAME = "lifelog.db";

export async function initDatabase() {
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  // Get current version
  // Get current version
  const versionResult = await db.getFirstAsync<{
    user_version: number;
  }>("PRAGMA user_version");
  const currentVersion = versionResult?.user_version ?? 0;

  console.log(`Current DB Version: ${currentVersion}`);

  // Run Migrations
  try {
    for (let i = currentVersion; i < MIGRATIONS.length; i++) {
      console.log(`Running Migration ${i}...`);
      try {
        await db.execAsync(MIGRATIONS[i]);
      } catch (e: any) {
        if (e.message.includes("duplicate column name")) {
          console.warn(
            `Migration ${i} partial failure (duplicate column), continuing...`,
          );
        } else {
          throw e;
        }
      }
      // Update version
      await db.execAsync(`PRAGMA user_version = ${i + 1}`);
    }
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
    // Be robust: if duplicate column error occurs, it usually means
    // we are in a dev state where version wasn't bumped but column was added.
    // For now, re-throwing is safer than ignoring, but user might need to reinstall if stuck.
    throw error;
  }

  return db;
}

export const getDb = async () => {
  return await SQLite.openDatabaseAsync(DB_NAME);
};

export async function resetDatabase() {
  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    await db.closeAsync();
  } catch (e) {
    console.warn("Error closing DB before reset:", e);
  }

  await SQLite.deleteDatabaseAsync(DB_NAME);
  const db = await initDatabase();
  return db;
}
