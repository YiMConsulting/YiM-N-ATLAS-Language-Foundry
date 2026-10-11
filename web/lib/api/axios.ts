import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1",
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
