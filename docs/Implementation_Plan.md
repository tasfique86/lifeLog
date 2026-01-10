# Implementation Plan - LifeLog

## Goal Description

Initialize the LifeLog project with a professional, scalable architecture. Implement the core offline-first infrastructure using SQLite, React Query, and Zustand. Build the Onboarding flow and scaffolding for main features.

## User Review Required

> [!IMPORTANT]
> I will be using standard `StyleSheet` for styling to ensure valid React Native code, rather than CSS files which are better suited for Web.
> I will install `expo-sqlite`, `zustand`, `@tanstack/react-query`, `react-hook-form`, `zod`, `uuid`, and `@react-native-async-storage/async-storage`.

## Proposed Changes

### Dependencies

- Install core libraries: `expo-sqlite`, `zustand`, `@tanstack/react-query`, `react-hook-form`, `zod`, `uuid`, `@react-native-async-storage/async-storage`.

### Architecture & Folder Structure

- Create `src` directory with subfolders: `db`, `services`, `store`, `components`, `features`, `types`.
- **Database**: Initialize SQLite database in `src/db/client.ts` with a migration system for tables (`todos`, `categories`, `transactions`).
- **Services**: Create base service structure.

### Component Layer

- **Theme**: Setup `src/constants/Colors.ts` and basic layout components.
- **Navigation**: Configure `app/_layout.tsx` for Context providers (QueryClient).

### Features

#### 1. Onboarding

- Create `src/store/authStore.ts` (Zustand + AsyncStorage) to track `isRegistered`.
- Create `app/onboarding/index.tsx` screen.
- Implement redirection in `app/_layout.tsx` based on registration state.

#### 2. Dashboard Scaffolding

- Create `app/(tabs)/_layout.tsx`.
- Create placeholder screens for Dashboard, Todos, Expenses.

## Verification Plan

### Automated Tests

- Verify dependency installation via `package.json`.
- (Future) Unit tests for Services.

### Manual Verification

- **Launch**: Run app, verify it opens.
- **Onboarding**: Verify user is redirected to Onboarding on first launch.
- **Registration**: Complete onboarding, restart app, verify user goes to Dashboard.
- **Database**: Verify tables are created (can log to console on init).
