/**
 * When MOCK_DATA=true, APIs return in-memory fixtures and auth accepts a demo login.
 * No DATABASE_URL or Postgres required. Do not enable in production.
 */
export function isMockData(): boolean {
  return process.env.MOCK_DATA === "true";
}
