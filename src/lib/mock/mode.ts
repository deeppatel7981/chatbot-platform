/**
 * When MOCK_DATA=true, APIs return in-memory fixtures and auth accepts a demo login
 * (any email + password `admin`). No DATABASE_URL required for demos.
 *
 * When MOCK_DATA=false (or unset), list/detail APIs use Postgres via DATABASE_URL; pages show
 * whatever rows exist for the signed-in org (empty until you seed, sign up, or create data).
 * Restart the server after changing this variable.
 */
export function isMockData(): boolean {
  return process.env.MOCK_DATA === "true";
}
