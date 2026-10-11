export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_API_MOCK === "true";
}
