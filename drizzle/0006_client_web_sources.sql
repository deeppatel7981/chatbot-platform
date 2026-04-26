CREATE TABLE IF NOT EXISTS "client_web_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"url" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"refresh_on_new_conversation" boolean DEFAULT true NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT "client_web_sources_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cws_client_idx" ON "client_web_sources" USING btree ("client_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "cws_client_url_unique" ON "client_web_sources" ("client_id", "url");
