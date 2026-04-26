CREATE TABLE IF NOT EXISTS "client_portal_access" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"user_id" uuid,
	"auth_user_id" uuid,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT "client_portal_access_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "client_portal_access_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "client_portal_access_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "client_portal_access_auth_user_id_profiles_id_fk" FOREIGN KEY ("auth_user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "cpa_user_or_auth_chk" CHECK (
		("user_id" IS NOT NULL AND "auth_user_id" IS NULL)
		OR ("user_id" IS NULL AND "auth_user_id" IS NOT NULL)
	)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cpa_org_idx" ON "client_portal_access" USING btree ("organization_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cpa_client_idx" ON "client_portal_access" USING btree ("client_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cpa_user_idx" ON "client_portal_access" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cpa_auth_idx" ON "client_portal_access" USING btree ("auth_user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "cpa_user_client_unique" ON "client_portal_access" ("user_id", "client_id") WHERE "user_id" IS NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "cpa_auth_client_unique" ON "client_portal_access" ("auth_user_id", "client_id") WHERE "auth_user_id" IS NOT NULL;

-- Grant portal users by inserting rows, e.g. (NextAuth credentials user):
-- INSERT INTO client_portal_access (organization_id, client_id, user_id)
-- SELECT c.organization_id, c.id, u.id FROM clients c CROSS JOIN users u
-- WHERE c.widget_public_id = '...' AND u.email = 'merchant@example.com';
