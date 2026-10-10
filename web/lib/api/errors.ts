import axios from "axios";

export class ApiNotFoundError extends Error {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "ApiNotFoundError";
  }
}

export function isNotFound(error: unknown): boolean {
  return (
    error instanceof ApiNotFoundError ||
    (axios.isAxiosError(error) && error.response?.status === 404)
  );
}
