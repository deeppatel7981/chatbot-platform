-- Legacy RLS for Drizzle `organization_*` / `clients` model.
-- Greenfield Backend LLD v1 (workspaces, projects, widget_configs, …) lives in:
--   supabase/migrations/20260405120000_backend_lld_v1_core.sql
-- Do not apply both packs to the same public tables without a merge plan.
--
-- Run in Supabase SQL editor after `npm run db:migrate` (tables must exist).
-- Optional FK from public.profiles(id) → auth.users(id):
--   ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retention_settings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_member_of_org(org uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = org
      AND m.auth_user_id = auth.uid()
  );
$$;

-- Profiles: user reads/updates own row
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Organizations
CREATE POLICY "orgs_select_member" ON public.organizations FOR SELECT USING (public.is_member_of_org(id));
CREATE POLICY "orgs_update_owner" ON public.organizations FOR UPDATE USING (public.is_member_of_org(id));

-- Organization members (read membership in own orgs)
CREATE POLICY "org_members_select" ON public.organization_members FOR SELECT USING (public.is_member_of_org(organization_id));

-- Generic org-scoped tables
CREATE POLICY "clients_org" ON public.clients FOR ALL USING (public.is_member_of_org(organization_id)) WITH CHECK (public.is_member_of_org(organization_id));
CREATE POLICY "contacts_org" ON public.contacts FOR ALL USING (public.is_member_of_org(organization_id)) WITH CHECK (public.is_member_of_org(organization_id));
CREATE POLICY "leads_org" ON public.leads FOR ALL USING (public.is_member_of_org(organization_id)) WITH CHECK (public.is_member_of_org(organization_id));
CREATE POLICY "conversations_org" ON public.conversations FOR ALL USING (public.is_member_of_org(organization_id)) WITH CHECK (public.is_member_of_org(organization_id));
CREATE POLICY "messages_org" ON public.messages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND public.is_member_of_org(c.organization_id))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND public.is_member_of_org(c.organization_id))
);
CREATE POLICY "lead_events_org" ON public.lead_events FOR ALL USING (public.is_member_of_org(organization_id)) WITH CHECK (public.is_member_of_org(organization_id));
CREATE POLICY "automations_org" ON public.automations FOR ALL USING (public.is_member_of_org(organization_id)) WITH CHECK (public.is_member_of_org(organization_id));
CREATE POLICY "audit_logs_org" ON public.audit_logs FOR ALL USING (organization_id IS NULL OR public.is_member_of_org(organization_id)) WITH CHECK (organization_id IS NULL OR public.is_member_of_org(organization_id));
CREATE POLICY "consent_org" ON public.consent_records FOR ALL USING (public.is_member_of_org(organization_id)) WITH CHECK (public.is_member_of_org(organization_id));
CREATE POLICY "retention_org" ON public.retention_settings FOR ALL USING (public.is_member_of_org(organization_id)) WITH CHECK (public.is_member_of_org(organization_id));

-- document_chunks via client → org
CREATE POLICY "document_chunks_org" ON public.document_chunks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.clients cl WHERE cl.id = client_id AND public.is_member_of_org(cl.organization_id))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.clients cl WHERE cl.id = client_id AND public.is_member_of_org(cl.organization_id))
);
