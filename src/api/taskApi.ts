import axios from "axios";

import type { Task } from "../types/Task";

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

const client = axios.create({
  baseURL: "http://localhost:3000",
});

const unwrap = <T>(response: { data: ApiResponse<T> }) => response.data.data;

const taskApi = {
  getTasks: async (): Promise<Task[]> => {
    const response = await client.get<ApiResponse<Task[]>>("/tasks");
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