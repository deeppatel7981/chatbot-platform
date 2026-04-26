import { drizzle } from "drizzle-orm/node-postgres";
import { poolConfigFromDatabaseUrl } from "../apps/web/src/lib/db/pg-config";
import { getDatabaseUrlOrThrow } from "./load-env";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import * as schema from "../apps/web/src/lib/db/schema";
import { organizations, users, organizationMembers, clients } from "../apps/web/src/lib/db/schema";

async function main() {
  const url = getDatabaseUrlOrThrow();
  const pool = new Pool({ ...poolConfigFromDatabaseUrl(url), max: 5 });
  const db = drizzle(pool, { schema });

  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin";
  const orgName = process.env.SEED_ORG_NAME ?? "Demo Org";
  const slug = process.env.SEED_ORG_SLUG ?? "demo-org";

  const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser) {
    console.log("Seed skipped: user already exists", email);
    await pool.end();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let [org] = await db.select().from(organizations).where(eq(organizations.slug, slug)).limit(1);
  if (!org) {
    [org] = await db.insert(organizations).values({ name: orgName, slug }).returning();
  }

  const [user] = await db
    .insert(users)
    .values({ email, passwordHash, name: "Admin" })
    .returning();

  await db.insert(organizationMembers).values({
    organizationId: org.id,
    userId: user.id,
    role: "owner",
  });

  await db.insert(clients).values({
    organizationId: org.id,
    name: process.env.SEED_CLIENT_NAME ?? "IndusCart",
  });

  console.log("Seed complete:", { email, organizationId: org.id });
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
