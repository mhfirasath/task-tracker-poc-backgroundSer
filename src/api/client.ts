import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  //baseURL: import.meta.env.VITE_API_BASE_URL ?? "https://backend-407249609828.asia-south1.run.app",
});

client.interceptors.request.use((config) => {
  const token = window.sessionStorage.getItem("task-tracker-token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default client;
