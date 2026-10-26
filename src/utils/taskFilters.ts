import type { Task } from "../types/Task";
import type { TaskFilters } from "../types/TaskFilters";

// Mirrors the server-side filter so results stay correct if the API ignores the params.
export const matchesTaskFilters = (task: Task, filters: TaskFilters): boolean => {
  const query = filters.q.trim().toLowerCase();

  if (query) {
    const haystack = `${task.title} ${task.description ?? ""}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }

  if (filters.status === "open") return !task.completed;
  if (filters.status === "complete") return task.completed;
  return true;
};

export const hasActiveTaskFilters = (filters: TaskFilters): boolean =>
  filters.q.trim() !== "" || filters.status !== "all";
