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
];

export const DB_NAME = "lifelog.db";

export async function initDatabase() {
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  // Run Migrations (Simple version for v1)
  // In a real app, we would track migration version in a separate table.
  try {
    for (const query of MIGRATIONS) {
      await db.execAsync(query);
    }
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }

  return db;
}

export const getDb = async () => {
  return await SQLite.openDatabaseAsync(DB_NAME);
};
