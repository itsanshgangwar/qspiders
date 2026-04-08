const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:9001";

export const API_BASE_URL = rawBaseUrl.endsWith("/api")
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/+$/, "")}/api`;

export const API_PATHS = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
  },
  SESSION: {
    CREATE: "/sessions/create",
    GET_ALL: "/sessions/my-sessions",
    GET_ONE: "/sessions", // usage: GET_ONE/:id
  },
  AI: {
    GENERATE_QUESTIONS: "/ai/generate-questions",
    EXPLAIN: "/ai/generate-explanation",
  },
};
