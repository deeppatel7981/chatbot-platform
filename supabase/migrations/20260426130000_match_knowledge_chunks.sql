-- Vector similarity over knowledge_chunks (used by chat-message-send Edge function).
-- p_query_embedding: pgvector literal string, e.g. '[0.1,0.2,...]' with 1536 dimensions.
--
-- If public.knowledge_chunks does not exist (Next-only Drizzle DB, or LLD not applied yet),
-- this migration succeeds with a NOTICE and does nothing. When you later apply
-- 20260405120000_backend_lld_v1_core.sql, re-run this file from the SQL editor or add a
-- follow-up migration that creates the same function.

DO $migration$
BEGIN
  IF to_regclass('public.knowledge_chunks') IS NULL THEN
    RAISE NOTICE
      'Skipping match_knowledge_chunks: public.knowledge_chunks not found. '
      'Apply 20260405120000_backend_lld_v1_core.sql on this database when using the Supabase LLD stack, '
      'then run this migration again (or paste the CREATE FUNCTION from this file). '
      'Next-only deployments use document_chunks RAG instead.';
    RETURN;
  END IF;

  EXECUTE $createfn$
CREATE OR REPLACE FUNCTION public.match_knowledge_chunks(
  p_project_id uuid,
  p_query_embedding text,
  match_threshold double precision,
  match_count int
)
RETURNS TABLE (
  id uuid,
  chunk_text text,
  similarity double precision
)
LANGUAGE sql
STABLE
SET search_path = public
AS $funcbody$
  SELECT
    kc.id,
    kc.chunk_text,
    (1 - (kc.embedding <=> p_query_embedding::vector(1536)))::double precision AS similarity
  FROM public.knowledge_chunks kc
  WHERE kc.project_id = p_project_id
    AND kc.embedding IS NOT NULL
    AND (1 - (kc.embedding <=> p_query_embedding::vector(1536))) >= match_threshold
  ORDER BY kc.embedding <=> p_query_embedding::vector(1536)
  LIMIT LEAST(GREATEST(match_count, 1), 50);
$funcbody$;
$createfn$;

  EXECUTE 'REVOKE ALL ON FUNCTION public.match_knowledge_chunks(uuid, text, double precision, int) FROM PUBLIC';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.match_knowledge_chunks(uuid, text, double precision, int) TO service_role';
END;
$migration$;
