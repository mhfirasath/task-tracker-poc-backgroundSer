import type { Task } from "../types/Task";
import type { TaskFilters } from "../types/TaskFilters";
import client from "./client";

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

const unwrap = <T>(response: { data: ApiResponse<T> }) => response.data.data;

const taskApi = {
  getTasks: async (filters?: TaskFilters): Promise<Task[]> => {
    const q = filters?.q.trim();
    const status = filters?.status ?? "all";

    const response = await client.get<ApiResponse<Task[]>>("/tasks", {
      params: {
        q: q || undefined,
        completed: status === "all" ? undefined : status === "complete",
      },
    });
    return unwrap(response);
  },

  createTask: async (task: Pick<Task, "title" | "description">): Promise<Task> => {
    const response = await client.post<ApiResponse<Task>>("/tasks", task);
    return unwrap(response);
  },

  updateTask: async (id: number, task: Partial<Task>): Promise<Task> => {
    const response = await client.patch<ApiResponse<Task>>(`/tasks/${id}`, task);
    return unwrap(response);
  },

  deleteTask: async (id: number): Promise<unknown> => {
    const response = await client.delete<ApiResponse<unknown>>(`/tasks/${id}`);
    return unwrap(response);
  },
};

export default taskApi;