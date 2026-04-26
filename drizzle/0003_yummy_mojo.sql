CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_members" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_members" ADD COLUMN "auth_user_id" uuid;--> statement-breakpoint
CREATE INDEX "profiles_email_idx" ON "profiles" USING btree ("email");--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_auth_user_id_profiles_id_fk" FOREIGN KEY ("auth_user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "org_members_auth_org_unique" ON "organization_members" USING btree ("auth_user_id","organization_id");
--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_or_auth_check" CHECK ("user_id" IS NOT NULL OR "auth_user_id" IS NOT NULL);