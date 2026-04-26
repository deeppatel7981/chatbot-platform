-- Backend LLD v1 — core schema (identity, tenant, business, inbox, leads, knowledge)
--
-- Apply to a greenfield Supabase project OR after removing/renaming legacy tables that
-- collide on name: public.contacts, public.conversations, public.messages, public.leads
-- (this repo’s Drizzle schema uses those names with organization_id — do not merge blindly).
--
-- Includes: extensions, DDL, indexes, updated_at trigger, is_workspace_member helper,
-- RLS enable + policies, storage buckets + object policies (path: workspace/{workspace_id}/...).

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
-- gen_random_uuid(); enable pgvector for knowledge_chunks.embedding
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

-- ---------------------------------------------------------------------------
-- Helper: updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 6.1 Identity and tenant
-- ---------------------------------------------------------------------------
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_by uuid NOT NULL REFERENCES auth.users (id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'sales')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

-- ---------------------------------------------------------------------------
-- 6.2 Projects & widget
-- ---------------------------------------------------------------------------
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  name text NOT NULL,
  city text,
  website_url text,
  business_hours jsonb,
  primary_language text NOT NULL DEFAULT 'en',
  whatsapp_number text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.widget_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL UNIQUE REFERENCES public.projects (id) ON DELETE CASCADE,
  public_key text NOT NULL UNIQUE,
  welcome_message text,
  primary_color text,
  position text NOT NULL DEFAULT 'bottom-right',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 6.3 Contacts & conversations
-- ---------------------------------------------------------------------------
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  name text,
  phone text,
  email text,
  source_first text,
  tags text[] NOT NULL DEFAULT '{}',
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.contacts (id) ON DELETE SET NULL,
  channel text NOT NULL CHECK (channel IN ('website', 'whatsapp')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'human_handoff', 'resolved')),
  owner_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  intent text,
  intent_confidence numeric(5, 4),
  lead_score integer,
  summary text,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('visitor', 'bot', 'human', 'system')),
  sender_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  content text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 6.4 Leads & tasks
-- ---------------------------------------------------------------------------
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.contacts (id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.conversations (id) ON DELETE SET NULL,
  stage text NOT NULL DEFAULT 'new' CHECK (
    stage IN (
      'new',
      'qualified',
      'follow_up_due',
      'interested',
      'visit_scheduled',
      'won',
      'lost'
    )
  ),
  intent text,
  budget_range text,
  unit_preference text,
  site_visit_interest boolean NOT NULL DEFAULT false,
  callback_requested boolean NOT NULL DEFAULT false,
  urgency text,
  summary text,
  owner_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER leads_touch_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE PROCEDURE public.touch_updated_at();

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads (id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.conversations (id) ON DELETE CASCADE,
  owner_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done', 'overdue')),
  due_at timestamptz NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (lead_id IS NOT NULL OR conversation_id IS NOT NULL)
);

-- ---------------------------------------------------------------------------
-- 6.5 Knowledge
-- ---------------------------------------------------------------------------
CREATE TABLE public.faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.knowledge_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  status text NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'ready', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.knowledge_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  knowledge_file_id uuid NOT NULL REFERENCES public.knowledge_files (id) ON DELETE CASCADE,
  chunk_text text NOT NULL,
  embedding vector(1536),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 7. Indexes (LLD §7)
-- ---------------------------------------------------------------------------
CREATE INDEX idx_workspace_members_user_id ON public.workspace_members (user_id);
CREATE INDEX idx_projects_workspace_id ON public.projects (workspace_id);
CREATE INDEX idx_contacts_workspace_id ON public.contacts (workspace_id);
CREATE INDEX idx_contacts_project_id ON public.contacts (project_id);
CREATE INDEX idx_conversations_workspace_id ON public.conversations (workspace_id);
CREATE INDEX idx_conversations_project_id ON public.conversations (project_id);
CREATE INDEX idx_conversations_contact_id ON public.conversations (contact_id);
CREATE INDEX idx_conversations_last_message_at ON public.conversations (last_message_at DESC);
CREATE INDEX idx_messages_conversation_id ON public.messages (conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages (created_at DESC);
CREATE INDEX idx_leads_workspace_id ON public.leads (workspace_id);
CREATE INDEX idx_leads_project_id ON public.leads (project_id);
CREATE INDEX idx_leads_owner_user_id ON public.leads (owner_user_id);
CREATE INDEX idx_leads_stage ON public.leads (stage);
CREATE INDEX idx_tasks_workspace_id ON public.tasks (workspace_id);
CREATE INDEX idx_tasks_owner_user_id ON public.tasks (owner_user_id);
CREATE INDEX idx_tasks_due_at ON public.tasks (due_at);
CREATE INDEX idx_faq_items_project_id ON public.faq_items (project_id);
CREATE INDEX idx_knowledge_files_project_id ON public.knowledge_files (project_id);
CREATE INDEX idx_knowledge_chunks_project_id ON public.knowledge_chunks (project_id);

-- ---------------------------------------------------------------------------
-- 8. RLS helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_workspace_member(target_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM workspace_members wm
    WHERE wm.workspace_id = target_workspace_id
      AND wm.user_id = auth.uid()
      AND wm.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_owner_or_admin(target_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM workspace_members wm
    WHERE wm.workspace_id = target_workspace_id
      AND wm.user_id = auth.uid()
      AND wm.status = 'active'
      AND wm.role IN ('owner', 'admin')
  );
$$;

-- ---------------------------------------------------------------------------
-- 8.3 Enable RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- user_profiles
-- ---------------------------------------------------------------------------
CREATE POLICY "user_profiles_select_own" ON public.user_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "user_profiles_insert_own" ON public.user_profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "user_profiles_update_own" ON public.user_profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- ---------------------------------------------------------------------------
-- workspaces
-- ---------------------------------------------------------------------------
CREATE POLICY "workspaces_select" ON public.workspaces FOR SELECT
USING (created_by = auth.uid() OR public.is_workspace_member(id));

CREATE POLICY "workspaces_insert" ON public.workspaces FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "workspaces_update" ON public.workspaces FOR UPDATE
USING (public.is_workspace_owner_or_admin(id))
WITH CHECK (public.is_workspace_owner_or_admin(id));

-- ---------------------------------------------------------------------------
-- workspace_members
-- ---------------------------------------------------------------------------
CREATE POLICY "workspace_members_select" ON public.workspace_members FOR SELECT
USING (public.is_workspace_member(workspace_id) OR user_id = auth.uid());

-- Bootstrap: workspace creator may insert their own membership; then owner/admin may invite.
CREATE POLICY "workspace_members_insert" ON public.workspace_members FOR INSERT
WITH CHECK (
  public.is_workspace_owner_or_admin(workspace_id)
  OR (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_id AND w.created_by = auth.uid()
    )
    AND user_id = auth.uid()
  )
);

CREATE POLICY "workspace_members_update" ON public.workspace_members FOR UPDATE
USING (public.is_workspace_owner_or_admin(workspace_id))
WITH CHECK (public.is_workspace_owner_or_admin(workspace_id));

CREATE POLICY "workspace_members_delete" ON public.workspace_members FOR DELETE
USING (public.is_workspace_owner_or_admin(workspace_id));

-- ---------------------------------------------------------------------------
-- projects (LLD §8.4 + mutations)
-- ---------------------------------------------------------------------------
CREATE POLICY "projects_select" ON public.projects FOR SELECT
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "projects_insert" ON public.projects FOR INSERT
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "projects_update" ON public.projects FOR UPDATE
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "projects_delete" ON public.projects FOR DELETE
USING (public.is_workspace_owner_or_admin(workspace_id));

-- ---------------------------------------------------------------------------
-- widget_configs
-- ---------------------------------------------------------------------------
CREATE POLICY "widget_configs_all" ON public.widget_configs FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = widget_configs.project_id
      AND public.is_workspace_member(p.workspace_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = widget_configs.project_id
      AND public.is_workspace_member(p.workspace_id)
  )
);

-- ---------------------------------------------------------------------------
-- contacts
-- ---------------------------------------------------------------------------
CREATE POLICY "contacts_select" ON public.contacts FOR SELECT
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "contacts_insert" ON public.contacts FOR INSERT
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "contacts_update" ON public.contacts FOR UPDATE
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "contacts_delete" ON public.contacts FOR DELETE
USING (public.is_workspace_owner_or_admin(workspace_id));

-- ---------------------------------------------------------------------------
-- conversations (LLD §8.4)
-- ---------------------------------------------------------------------------
CREATE POLICY "conversations_select" ON public.conversations FOR SELECT
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "conversations_insert" ON public.conversations FOR INSERT
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "conversations_update" ON public.conversations FOR UPDATE
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "conversations_delete" ON public.conversations FOR DELETE
USING (public.is_workspace_owner_or_admin(workspace_id));

-- ---------------------------------------------------------------------------
-- messages (LLD §8.4)
-- ---------------------------------------------------------------------------
CREATE POLICY "messages_select" ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
      AND public.is_workspace_member(c.workspace_id)
  )
);

CREATE POLICY "messages_insert" ON public.messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
      AND public.is_workspace_member(c.workspace_id)
  )
);

CREATE POLICY "messages_update" ON public.messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
      AND public.is_workspace_member(c.workspace_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
      AND public.is_workspace_member(c.workspace_id)
  )
);

CREATE POLICY "messages_delete" ON public.messages FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
      AND public.is_workspace_owner_or_admin(c.workspace_id)
  )
);

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------
CREATE POLICY "leads_select" ON public.leads FOR SELECT
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "leads_insert" ON public.leads FOR INSERT
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "leads_update" ON public.leads FOR UPDATE
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "leads_delete" ON public.leads FOR DELETE
USING (public.is_workspace_owner_or_admin(workspace_id));

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
CREATE POLICY "tasks_select" ON public.tasks FOR SELECT
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE
USING (public.is_workspace_owner_or_admin(workspace_id));

-- ---------------------------------------------------------------------------
-- faq_items, knowledge_files, knowledge_chunks
-- ---------------------------------------------------------------------------
CREATE POLICY "faq_items_all" ON public.faq_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = faq_items.project_id
      AND public.is_workspace_member(p.workspace_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = faq_items.project_id
      AND public.is_workspace_member(p.workspace_id)
  )
);

CREATE POLICY "knowledge_files_select" ON public.knowledge_files FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = knowledge_files.project_id
      AND public.is_workspace_member(p.workspace_id)
  )
);

CREATE POLICY "knowledge_files_mutate" ON public.knowledge_files FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = knowledge_files.project_id
      AND public.is_workspace_member(p.workspace_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = knowledge_files.project_id
      AND public.is_workspace_member(p.workspace_id)
  )
);

CREATE POLICY "knowledge_chunks_select" ON public.knowledge_chunks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = knowledge_chunks.project_id
      AND public.is_workspace_member(p.workspace_id)
  )
);

CREATE POLICY "knowledge_chunks_mutate" ON public.knowledge_chunks FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = knowledge_chunks.project_id
      AND public.is_workspace_member(p.workspace_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = knowledge_chunks.project_id
      AND public.is_workspace_member(p.workspace_id)
  )
);

-- ---------------------------------------------------------------------------
-- 9. Storage buckets (private)
-- Path convention: workspace/{workspace_id}/project/{project_id}/{uuid}-{filename}
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-documents', 'project-documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('project-assets', 'project-assets', false)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.storage_workspace_id_from_path(path text)
RETURNS uuid
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(split_part(path, '/', 2), '')::uuid;
$$;

CREATE POLICY "project_documents_select"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'project-documents'
  AND public.is_workspace_member(public.storage_workspace_id_from_path(name))
);

CREATE POLICY "project_documents_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'project-documents'
  AND public.is_workspace_member(public.storage_workspace_id_from_path(name))
);

CREATE POLICY "project_documents_update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'project-documents'
  AND public.is_workspace_member(public.storage_workspace_id_from_path(name))
)
WITH CHECK (
  bucket_id = 'project-documents'
  AND public.is_workspace_member(public.storage_workspace_id_from_path(name))
);

CREATE POLICY "project_documents_delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'project-documents'
  AND public.is_workspace_owner_or_admin(public.storage_workspace_id_from_path(name))
);

CREATE POLICY "project_assets_select"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'project-assets'
  AND public.is_workspace_member(public.storage_workspace_id_from_path(name))
);

CREATE POLICY "project_assets_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'project-assets'
  AND public.is_workspace_member(public.storage_workspace_id_from_path(name))
);

CREATE POLICY "project_assets_update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'project-assets'
  AND public.is_workspace_member(public.storage_workspace_id_from_path(name))
)
WITH CHECK (
  bucket_id = 'project-assets'
  AND public.is_workspace_member(public.storage_workspace_id_from_path(name))
);

CREATE POLICY "project_assets_delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'project-assets'
  AND public.is_workspace_owner_or_admin(public.storage_workspace_id_from_path(name))
);
