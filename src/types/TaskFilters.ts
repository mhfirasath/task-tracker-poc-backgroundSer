export type TaskStatusFilter = "all" | "open" | "complete";

export interface TaskFilters {
  q: string;
  status: TaskStatusFilter;
}

export const defaultTaskFilters: TaskFilters = {
  q: "",
  status: "all",
};
