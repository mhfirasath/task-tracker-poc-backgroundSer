# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build` (type-checks first; output in `dist/`)
- `npm run lint` — oxlint (not ESLint)
- `npm run preview` — serve the production build

There is no test runner configured. The Dockerfile builds with Node 22 and serves `dist/` through nginx on port 80.

## Architecture

React 19 + TypeScript + Vite single-page app that talks to a separate REST backend. There is no router and no state library; all state lives in `src/App.tsx`.

- **Auth flow**: `App` holds `session` in state. With no session it renders `LoginPage` (defined inside `App.tsx`, handles both sign-in and register). The token is stored in `sessionStorage` under `task-tracker-token`, and the axios request interceptor in `src/api/client.ts` attaches it as a Bearer header. Logout calls `sessionStorage.clear()`.
- **Navigation**: `activePage` state switches between `Dashboard` and the tasks view. `Dashboard` reads the full `tasks` array, so `showDashboard` resets filters before switching.
- **API layer** (`src/api/`): `client.ts` is the shared axios instance. The base URL comes from `VITE_API_BASE_URL`, defaulting to `http://localhost:3000`. The backend wraps every response as `{ statusCode, message, data }`, and `taskApi.ts` unwraps it with `unwrap`.
- **Filtering** (search text and completion status): there are two stages.
  - `filters` is the live input state, and `appliedFilters` is its debounced copy (300ms). Changes to `appliedFilters` trigger a server fetch via `taskApi.getTasks`, which sends `q` and `completed` as query params.
  - The result is filtered again client-side with `matchesTaskFilters` in `src/utils/taskFilters.ts`, so that optimistic updates, such as toggling a task, respect the active filters.
  - `loadTasks` uses a `latestRequestId` ref to discard stale responses from earlier searches. Keep that guard when changing the fetch logic.
- **Mutations**: `toggleTask` and `updateTask` patch the task in local state first, then re-fetch the list. `addTask` and `deleteTask` only re-fetch.

## Notes

- `client.ts` contains a commented-out production backend URL. Use `VITE_API_BASE_URL` to switch backends instead of editing the default.
