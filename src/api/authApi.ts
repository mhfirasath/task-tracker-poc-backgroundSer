import client from "./client";

export interface AuthSession {
  token: string;
  userId: number | string;
  username: string;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

interface AuthPayload {
  access_token?: string;
  token?: string;
  user?: {
    id?: number | string;
    username?: string;
  };
  id?: number | string;
  username?: string;
}

const getResponseData = (response: { data: ApiResponse<AuthPayload> | AuthPayload }) => {
  const responseData = response.data;
  return "data" in responseData ? responseData.data : responseData;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object" && "response" in error) {
    const response = error.response;
    if (response && typeof response === "object" && "data" in response) {
      const responseData = response.data;
      if (responseData && typeof responseData === "object" && "message" in responseData) {
        const message = responseData.message;
        if (typeof message === "string") return message;
        if (Array.isArray(message)) return message.join(", ");
      }
    }
  }

  return error instanceof Error ? error.message : fallback;
};

const decodeUserId = (token: string) => {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as {
      sub?: number | string;
      id?: number | string;
      username?: string;
    };

    return {
      userId: decoded.sub ?? decoded.id ?? "unknown",
      username: decoded.username ?? "User",
    };
  } catch {
    return { userId: "unknown", username: "User" };
  }
};

const createSession = (payload: AuthPayload): AuthSession => {
  const token = payload.access_token ?? payload.token;
  if (!token) throw new Error("The login response did not include a JWT token.");

  const decodedUser = decodeUserId(token);
  const userId = payload.user?.id ?? payload.id ?? decodedUser.userId;
  const username = payload.user?.username ?? payload.username ?? decodedUser.username;

  return { token, userId, username };
};

const authApi = {
  login: async (username: string, password: string): Promise<AuthSession> => {
    try {
      const response = await client.post<ApiResponse<AuthPayload> | AuthPayload>("/auth/login", {
        username,
        password,
      });
      const session = createSession(getResponseData(response));
      window.sessionStorage.setItem("task-tracker-token", session.token);
      window.sessionStorage.setItem("task-tracker-user-id", String(session.userId));
      window.sessionStorage.setItem("task-tracker-username", session.username);
      return session;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to sign in."));
    }
  },

  register: async (username: string, password: string): Promise<void> => {
    try {
      await client.post("/users", { username, password });
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to create your account."));
    }
  },
};

export default authApi;
