import type { Task } from "../types/Task";
import type { TaskFilters } from "../types/TaskFilters";
import client from "./client";

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export const ADMIN_TOKEN_KEY = "task-tracker-admin-token";

const unwrap = <T>(response: { data: ApiResponse<T> | T }): T => {
  const body = response.data;
  return body && typeof body === "object" && "data" in body ? (body as ApiResponse<T>).data : (body as T);
};

// Admin requests carry the admin token explicitly so they never reuse the user session token.
const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object" && "response" in error) {
    const data = (error.response as { data?: { message?: unknown } } | undefined)?.data;
    if (typeof data?.message === "string") return data.message;
    if (Array.isArray(data?.message)) return data.message.join(", ");
  }
  return fallback;
};

const adminApi = {
  login: async (username: string, password: string): Promise<string> => {
    try {
      const response = await client.post<
        ApiResponse<{ access_token?: string; token?: string }> | { access_token?: string; token?: string }
      >("/auth/admin/login", { username, password });
      const payload = unwrap(response);
      const token = payload.access_token ?? payload.token;
      if (!token) throw new Error("The login response did not include a token.");
      return token;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to sign in as admin."));
    }
  },

  getTasks: async (token: string, filters: TaskFilters, userId?: number): Promise<Task[]> => {
    const q = filters.q.trim();

    const response = await client.get<ApiResponse<Task[]>>("/admin/tasks", {
      headers: authHeaders(token),
      params: {
        userId,
        q: q || undefined,
        completed: filters.status === "all" ? undefined : filters.status === "complete",
      },
    });
    return unwrap(response);
  },

  createTask: async (
    token: string,
    task: { userId: number; title: string; description?: string },
  ): Promise<Task> => {
    try {
      const response = await client.post<ApiResponse<Task>>("/admin/tasks", task, {
        headers: authHeaders(token),
      });
      return unwrap(response);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to create the task."));
    }
  },
};

export default adminApi;
