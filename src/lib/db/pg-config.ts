import type { PoolConfig } from "pg";

/**
 * Build pg Pool config from DATABASE_URL. For Amazon RDS hosts, TLS is enabled with
 * rejectUnauthorized: false so Node accepts the RDS CA chain without bundling AWS PEM files
 * (fine for dev; in VPC/production consider verify-full + RDS CA bundle).
 */
export function poolConfigFromDatabaseUrl(connectionString: string): PoolConfig {
  const u = new URL(
    connectionString.replace(/^postgresql:/i, "http:").replace(/^postgres:/i, "http:")
  );
  const database = u.pathname.replace(/^\//, "").split("?")[0] || undefined;
  const config: PoolConfig = {
    host: u.hostname,
    port: u.port ? Number(u.port) : 5432,
    user: u.username ? decodeURIComponent(u.username) : undefined,
    password: u.password ? decodeURIComponent(u.password) : undefined,
    database,
  };
  if (u.hostname.includes(".rds.amazonaws.com")) {
    config.ssl = { rejectUnauthorized: false };
  }
  return config;
}
