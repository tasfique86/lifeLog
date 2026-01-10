# LifeLog - Project Plan

LifeLog is a professional-grade React Native (Expo) mobile application designed for personal management. It combines future planning, daily task management, and expense tracking into a single, offline-first application.

## Core Philosophy

- **Local-First:** All data lives on the device. No internet required.
- **Privacy-Focused:** No account creation or cloud data harvesting in v1.
- **Scalable:** Built with synchronization in mind for future backend integration (Supabase).
- **Professional UX:** High-quality animations, smooth interactions, and robust error handling.

## Tech Stack

- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **Routing:** Expo Router
- **Database:** `expo-sqlite` (Primary Data), `AsyncStorage` (Preferences)
- **State Management:** `Zustand` (Global UI), `React Query` (Server State / DB Caching)
- **Forms:** `React Hook Form` + `Zod`

## Architecture

We follow a strict unidirectional data flow and separation of concerns:

```
UI (Screens/Components)
       │
       ▼
Custom Hooks (useTodos, useExpenses)
       │
       ▼
Service Layer (TodoService, ExpenseService)
       │
       ▼
Repository/Database (SQLite)
```

### Folder Structure

```
/app                # Expo Router screens
/src
  /components       # Reusable UI components
  /constants        # Theme, Colors, Config
  /context          # React Contexts (Theme, Auth state)
  /db               # Database setup and schema
  /features         # Feature-based modules
    /dashboard
    /todos
    /expenses
    /onboarding
  /hooks            # Global hooks
  /lib              # Third-party lib configurations (queryClient, etc.)
  /services         # Business logic & DB interaction
  /store            # Zustand stores
  /types            # TypeScript definitions
  /utils            # Helper functions
```

## Core Features (v1)

### 1. Onboarding

- First-launch experience.
- User inputs Name and Currency preference.
- Data stored in AsyncStorage.

### 2. Dashboard

- Summary view.
- Today's Todos.
- Monthly financial brief.

### 3. Todos

- CRUD for tasks.
- Fields: Title, Description, Due Date, Priority, Completed.

### 4. Expense Tracker

- income/Expense logging.
- Categories.
- Transaction history.

## Database Schema (SQLite)

**Table: `todos`**

- `id` (UUID, PK)
- `title` (TEXT)
- `description` (TEXT)
- `due_date` (ISO8601 TEXT)
- `priority` (INTEGER: 1=Low, 2=Med, 3=High)
- `is_completed` (BOOLEAN)
- `created_at` (TEXT)
- `updated_at` (TEXT)

**Table: `categories`**

- `id` (UUID, PK)
- `name` (TEXT)
- `type` (TEXT: 'income' | 'expense')
- `icon` (TEXT)
- `color` (TEXT)

**Table: `transactions`**

- `id` (UUID, PK)
- `amount` (REAL)
- `category_id` (UUID, FK)
- `date` (ISO8601 TEXT)
- `note` (TEXT)
- `created_at` (TEXT)

## Future Considerations (v2)

- Supabase Backend.
- Cloud Sync.
- Multi-device support.
