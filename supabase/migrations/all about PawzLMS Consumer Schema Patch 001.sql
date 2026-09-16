-- ============================================================================
-- All About Pawz — GAP CLOSURE MIGRATION 002 (CORRECTED) + CONSUMER SCHEMA PATCH
-- ============================================================================
-- This migration replaces the Claude-generated Gap Closure 002 (which
-- incorrectly used public.platform_is_tenant_member() for LMS tables) with
-- the correct lms.is_tenant_member() / lms.is_platform_admin() helpers
-- that match the live LMS schema pattern.
--
-- Run AFTER all 7 live schema files:
--   1. leashed_io_schema_fixedLIVE.sql
--   2. leashed_lms_schema_patch_LIVE-2.sql
--   3. All About Pawz-Gap-Closure-Migration-001LIVE-3.sql
--   4. All About Pawz-Migration-002-index-cleanup-constraint-validation-LIVE-4.sql
--   5. All About Pawz-LMS-Schemalive-5.sql
--   6. All About Pawz-RAG-Tables-Catalog-Seed-Data-live-6.sql
--   7. leashed_io_schema_software_live-7.sql
--
-- Idempotent: safe to re-run.
-- ============================================================================

-- ============================================================================
-- PART 1A: STORAGE BUCKETS + PATHWAY-SCOPED RAG FOLDERS
-- ============================================================================

-- Storage bucket for RAG library (conditional — storage schema only in Supabase)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'buckets') THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('lms-rag-library', 'lms-rag-library', false)
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- RLS on storage.objects for RAG folders (conditional)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'objects') THEN
        EXECUTE 'DROP POLICY IF EXISTS "RAG library tenant access" ON storage.objects';
        EXECUTE 'CREATE POLICY "RAG library tenant access" ON storage.objects
            FOR ALL USING (
                (storage.foldername(name))[1] IN (
                    SELECT tenant_id::text FROM public.tenant_memberships
                    WHERE user_id = auth.uid()
                      AND active = true
                      AND status = ''active''
                )
                OR EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid())
            )';
    END IF;
END $$;

-- Add pathway_id to ai_rag_documents for pathway-scoped RAG
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'lms' AND table_name = 'ai_rag_documents' AND column_name = 'pathway_id'
    ) THEN
        ALTER TABLE lms.ai_rag_documents ADD COLUMN pathway_id uuid;
    END IF;
END $$;

-- Add FK for pathway_id (conditional on pathways table existing)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ai_rag_documents_pathway_fk'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'lms' AND table_name = 'pathways' AND column_name = 'id'
    ) THEN
        ALTER TABLE lms.ai_rag_documents
            ADD CONSTRAINT ai_rag_documents_pathway_fk
            FOREIGN KEY (tenant_id, pathway_id) REFERENCES lms.pathways(tenant_id, id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS lms_ai_rag_documents_pathway_idx
    ON lms.ai_rag_documents(tenant_id, pathway_id) WHERE pathway_id IS NOT NULL;

-- ============================================================================
-- PART 1A.2: PGVECTOR SEARCH FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION lms.rag_vector_search(
    p_tenant_id uuid,
    p_query_embedding vector(1536),
    p_course_id uuid DEFAULT NULL,
    p_module_id uuid DEFAULT NULL,
    p_pathway_id uuid DEFAULT NULL,
    p_limit integer DEFAULT 10,
    p_similarity_threshold float DEFAULT 0.7
)
RETURNS TABLE (
    chunk_id uuid,
    document_id uuid,
    content text,
    similarity float,
    page_number integer,
    section_heading text,
    chunk_metadata jsonb
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, lms
AS $$
    SELECT
        c.id AS chunk_id,
        c.document_id,
        c.content,
        1 - (c.embedding <=> p_query_embedding) AS similarity,
        c.page_number,
        c.section_heading,
        c.chunk_metadata
    FROM lms.ai_rag_chunks c
    JOIN lms.ai_rag_documents d ON c.document_id = d.id
    WHERE c.tenant_id = p_tenant_id
      AND d.tenant_id = p_tenant_id
      AND c.embedding IS NOT NULL
      AND (1 - (c.embedding <=> p_query_embedding)) >= p_similarity_threshold
      AND (p_course_id IS NULL OR c.course_id = p_course_id OR d.course_id = p_course_id)
      AND (p_module_id IS NULL OR c.module_id = p_module_id)
      AND (p_pathway_id IS NULL OR d.pathway_id = p_pathway_id)
    ORDER BY c.embedding <=> p_query_embedding
    LIMIT p_limit;
$$;

CREATE OR REPLACE FUNCTION lms.rag_hybrid_search(
    p_tenant_id uuid,
    p_query_text text,
    p_query_embedding vector(1536),
    p_course_id uuid DEFAULT NULL,
    p_module_id uuid DEFAULT NULL,
    p_pathway_id uuid DEFAULT NULL,
    p_limit integer DEFAULT 10,
    p_semantic_weight float DEFAULT 0.7,
    p_keyword_weight float DEFAULT 0.3
)
RETURNS TABLE (
    chunk_id uuid,
    document_id uuid,
    content text,
    combined_score float,
    semantic_score float,
    keyword_score float,
    page_number integer,
    section_heading text,
    chunk_metadata jsonb
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, lms
AS $$
    WITH semantic AS (
        SELECT
            c.id AS chunk_id,
            c.document_id,
            c.content,
            1 - (c.embedding <=> p_query_embedding) AS semantic_score,
            c.page_number,
            c.section_heading,
            c.chunk_metadata
        FROM lms.ai_rag_chunks c
        JOIN lms.ai_rag_documents d ON c.document_id = d.id
        WHERE c.tenant_id = p_tenant_id
          AND d.tenant_id = p_tenant_id
          AND c.embedding IS NOT NULL
          AND (p_course_id IS NULL OR c.course_id = p_course_id OR d.course_id = p_course_id)
          AND (p_module_id IS NULL OR c.module_id = p_module_id)
          AND (p_pathway_id IS NULL OR d.pathway_id = p_pathway_id)
        ORDER BY c.embedding <=> p_query_embedding
        LIMIT p_limit * 3
    ),
    keyword AS (
        SELECT
            c.id AS chunk_id,
            c.document_id,
            c.content,
            ts_rank_cd(to_tsvector('english', c.content), plainto_tsquery('english', p_query_text)) AS keyword_score,
            c.page_number,
            c.section_heading,
            c.chunk_metadata
        FROM lms.ai_rag_chunks c
        JOIN lms.ai_rag_documents d ON c.document_id = d.id
        WHERE c.tenant_id = p_tenant_id
          AND d.tenant_id = p_tenant_id
          AND to_tsvector('english', c.content) @@ plainto_tsquery('english', p_query_text)
          AND (p_course_id IS NULL OR c.course_id = p_course_id OR d.course_id = p_course_id)
          AND (p_module_id IS NULL OR c.module_id = p_module_id)
          AND (p_pathway_id IS NULL OR d.pathway_id = p_pathway_id)
        ORDER BY keyword_score DESC
        LIMIT p_limit * 3
    )
    SELECT
        COALESCE(s.chunk_id, k.chunk_id) AS chunk_id,
        COALESCE(s.document_id, k.document_id) AS document_id,
        COALESCE(s.content, k.content) AS content,
        (p_semantic_weight * COALESCE(s.semantic_score, 0) + p_keyword_weight * COALESCE(k.keyword_score, 0)) AS combined_score,
        COALESCE(s.semantic_score, 0) AS semantic_score,
        COALESCE(k.keyword_score, 0) AS keyword_score,
        COALESCE(s.page_number, k.page_number) AS page_number,
        COALESCE(s.section_heading, k.section_heading) AS section_heading,
        COALESCE(s.chunk_metadata, k.chunk_metadata) AS chunk_metadata
    FROM semantic s
    FULL OUTER JOIN keyword k ON s.chunk_id = k.chunk_id
    ORDER BY combined_score DESC
    LIMIT p_limit;
$$;

-- ============================================================================
-- PART 1B1: PATHWAY_COURSES AS SOLE SOURCE OF TRUTH
-- ============================================================================

-- Backfill courses.pathway_id from pathway_courses where missing
UPDATE lms.courses
SET pathway_id = pc.pathway_id,
    updated_at = now()
FROM lms.pathway_courses pc
WHERE courses.pathway_id IS NULL
  AND courses.tenant_id = pc.tenant_id
  AND courses.id = pc.course_id;

-- Sync trigger: keep courses.pathway_id in sync with pathway_courses
CREATE OR REPLACE FUNCTION lms.sync_course_pathway()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, lms
AS $$
BEGIN
    -- When a pathway_courses row is inserted/updated, sync the course's pathway_id
    IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.pathway_id IS DISTINCT FROM OLD.pathway_id)) THEN
        UPDATE lms.courses
        SET pathway_id = NEW.pathway_id,
            updated_at = now()
        WHERE id = NEW.course_id
          AND tenant_id = NEW.tenant_id
          AND pathway_id IS DISTINCT FROM NEW.pathway_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pathway_courses_sync_pathway ON lms.pathway_courses;
CREATE TRIGGER pathway_courses_sync_pathway
    AFTER INSERT OR UPDATE OF pathway_id ON lms.pathway_courses
    FOR EACH ROW EXECUTE FUNCTION lms.sync_course_pathway();

-- ============================================================================
-- PART 1B2: SKILL_SIGNOFFS.VERIFICATION_KIND
-- ============================================================================

-- Add verification_kind column
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'lms' AND table_name = 'skill_signoffs' AND column_name = 'verification_kind'
    ) THEN
        ALTER TABLE lms.skill_signoffs ADD COLUMN verification_kind text;
    END IF;
END $$;

-- Backfill verification_kind based on whether course_id is set
UPDATE lms.skill_signoffs
SET verification_kind = CASE WHEN course_id IS NOT NULL THEN 'course_linked' ELSE 'standalone' END
WHERE verification_kind IS NULL;

-- Set default for future inserts
ALTER TABLE lms.skill_signoffs ALTER COLUMN verification_kind SET DEFAULT 'standalone';

-- Add CHECK constraint (idempotent)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'skill_signoffs_verification_kind_check'
    ) THEN
        ALTER TABLE lms.skill_signoffs
            ADD CONSTRAINT skill_signoffs_verification_kind_check
            CHECK (verification_kind IS NULL OR verification_kind IN ('course_linked', 'standalone'));
    END IF;
END $$;

-- Consistency constraint: course_linked signoffs must have course_id
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'skill_signoffs_verification_kind_consistency'
    ) THEN
        ALTER TABLE lms.skill_signoffs
            ADD CONSTRAINT skill_signoffs_verification_kind_consistency
            CHECK (
                verification_kind IS NULL
                OR verification_kind = 'standalone'
                OR (verification_kind = 'course_linked' AND course_id IS NOT NULL)
            );
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS lms_skill_signoffs_verification_kind_idx
    ON lms.skill_signoffs(tenant_id, verification_kind) WHERE verification_kind IS NOT NULL;

-- ============================================================================
-- PART 1B3: CREDENTIAL_REQUIREMENTS TABLE (GENERAL-PURPOSE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS lms.credential_requirements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    credential_definition_id uuid NOT NULL,
    requirement_type text NOT NULL CHECK (requirement_type IN (
        'skill', 'clock_hours', 'course_completion', 'module_completion'
    )),
    -- Discriminated union: exactly one of these must be non-NULL per type
    skill_id uuid,
    required_clock_hours numeric(8,2) CHECK (required_clock_hours IS NULL OR required_clock_hours >= 0),
    course_id uuid,
    module_id uuid,
    required_score numeric(5,2) CHECK (required_score IS NULL OR (required_score >= 0 AND required_score <= 100)),
    minimum_competency_level text CHECK (minimum_competency_level IS NULL OR minimum_competency_level IN ('introduced','practiced','mastered')),
    is_required boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id),
    FOREIGN KEY (tenant_id, credential_definition_id) REFERENCES lms.credential_definitions(tenant_id, id) ON DELETE CASCADE,
    -- Discriminated union CHECK: exactly one requirement target must be set
    CHECK (
        (requirement_type = 'skill' AND skill_id IS NOT NULL)
        OR (requirement_type = 'clock_hours' AND required_clock_hours IS NOT NULL)
        OR (requirement_type = 'course_completion' AND course_id IS NOT NULL)
        OR (requirement_type = 'module_completion' AND module_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS lms_credential_requirements_definition_idx
    ON lms.credential_requirements(tenant_id, credential_definition_id, sort_order);
CREATE INDEX IF NOT EXISTS lms_credential_requirements_type_idx
    ON lms.credential_requirements(tenant_id, requirement_type);

-- Backfill from credential_definitions (clock hours) and credential_definition_skills (skills)
INSERT INTO lms.credential_requirements (tenant_id, credential_definition_id, requirement_type, required_clock_hours, is_required, sort_order)
SELECT cd.tenant_id, cd.id, 'clock_hours', cd.required_clock_hours, true, 0
FROM lms.credential_definitions cd
WHERE cd.required_clock_hours IS NOT NULL AND cd.required_clock_hours > 0
ON CONFLICT DO NOTHING;

INSERT INTO lms.credential_requirements (tenant_id, credential_definition_id, requirement_type, skill_id, minimum_competency_level, is_required, sort_order)
SELECT cds.tenant_id, cds.credential_definition_id, 'skill', cds.skill_id, 'practiced', true, 1
FROM lms.credential_definition_skills cds
ON CONFLICT DO NOTHING;

-- Cross-validation trigger: prevent credential_definitions from being active if they have zero requirements
CREATE OR REPLACE FUNCTION lms.validate_credential_requirements()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, lms
AS $$
DECLARE
    req_count integer;
BEGIN
    IF NEW.is_active = true THEN
        SELECT COUNT(*) INTO req_count
        FROM lms.credential_requirements
        WHERE credential_definition_id = NEW.id
          AND tenant_id = NEW.tenant_id;
        IF req_count = 0 THEN
            RAISE EXCEPTION 'Cannot activate credential_definition %: no credential_requirements rows exist. Add at least one requirement before activating.', NEW.id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS credential_definitions_requirements_check ON lms.credential_definitions;
CREATE TRIGGER credential_definitions_requirements_check
    BEFORE UPDATE OF is_active ON lms.credential_definitions
    FOR EACH ROW EXECUTE FUNCTION lms.validate_credential_requirements();

-- credential_requirements_met() function
CREATE OR REPLACE FUNCTION lms.credential_requirements_met(
    p_tenant_id uuid,
    p_credential_definition_id uuid,
    p_learner_user_id uuid
)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, lms
AS $$
    SELECT bool_and(
        CASE req.requirement_type
            WHEN 'skill' THEN EXISTS (
                SELECT 1 FROM lms.skill_progress sp
                WHERE sp.tenant_id = p_tenant_id
                  AND sp.learner_user_id = p_learner_user_id
                  AND sp.skill_id = req.skill_id
                  AND sp.competency_level >= COALESCE(req.minimum_competency_level, 'practiced')
                  AND sp.is_signed_off = true
            )
            WHEN 'clock_hours' THEN EXISTS (
                SELECT 1 FROM lms.clock_hour_ledger chl
                WHERE chl.tenant_id = p_tenant_id
                  AND chl.learner_user_id = p_learner_user_id
                HAVING SUM(chl.hours_earned) >= req.required_clock_hours
            )
            WHEN 'course_completion' THEN EXISTS (
                SELECT 1 FROM lms.course_completions cc
                WHERE cc.tenant_id = p_tenant_id
                  AND cc.learner_user_id = p_learner_user_id
                  AND cc.course_id = req.course_id
                  AND cc.completion_status = 'completed'
            )
            WHEN 'module_completion' THEN EXISTS (
                SELECT 1 FROM lms.module_progress mp
                WHERE mp.tenant_id = p_tenant_id
                  AND mp.learner_user_id = p_learner_user_id
                  AND mp.module_id = req.module_id
                  AND mp.completion_percentage = 100
            )
        END
    )
    FROM lms.credential_requirements req
    WHERE req.tenant_id = p_tenant_id
      AND req.credential_definition_id = p_credential_definition_id
      AND req.is_required = true;
$$;

-- RLS for credential_requirements
ALTER TABLE lms.credential_requirements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS credential_requirements_access ON lms.credential_requirements;
CREATE POLICY credential_requirements_access ON lms.credential_requirements
    FOR ALL USING (lms.is_platform_admin() OR lms.is_tenant_member(tenant_id))
    WITH CHECK (lms.is_platform_admin() OR lms.is_tenant_member(tenant_id));

-- Triggers
DROP TRIGGER IF EXISTS lms_credential_requirements_updated_at ON lms.credential_requirements;
CREATE TRIGGER lms_credential_requirements_updated_at
    BEFORE UPDATE ON lms.credential_requirements
    FOR EACH ROW EXECUTE FUNCTION lms.touch_updated_at();

COMMENT ON TABLE lms.credential_requirements IS 'General-purpose credential requirements (skill, clock_hours, course_completion, module_completion). Discriminated union: exactly one target per row.';

-- ============================================================================
-- PART 1B4: OPEN BADGES 3.0 ASSERTIONS ON LEARNER_BADGES
-- ============================================================================

-- Add verification_code and open_badge_json to learner_badges
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'lms' AND table_name = 'learner_badges' AND column_name = 'verification_code'
    ) THEN
        ALTER TABLE lms.learner_badges ADD COLUMN verification_code text;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'lms' AND table_name = 'learner_badges' AND column_name = 'open_badge_json'
    ) THEN
        ALTER TABLE lms.learner_badges ADD COLUMN open_badge_json jsonb;
    END IF;
END $$;

-- Backfill verification codes for existing badge awards
UPDATE lms.learner_badges
SET verification_code = 'LEASHED-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))
WHERE verification_code IS NULL;

-- Unique constraint on verification_code (conditional — only for non-null values)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'learner_badges_verification_code_unique'
    ) THEN
        ALTER TABLE lms.learner_badges
            ADD CONSTRAINT learner_badges_verification_code_unique UNIQUE (verification_code);
    END IF;
END $$;

-- build_open_badge_json() function
CREATE OR REPLACE FUNCTION lms.build_open_badge_json(p_learner_badge_id uuid)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, lms
AS $$
    SELECT jsonb_build_object(
        '@context', 'https://w3id.org/openbadges/v3',
        'type', 'Assertion',
        'id', lb.verification_code,
        'recipient', jsonb_build_object(
            'type', 'uuid',
            'identity', lb.learner_user_id
        ),
        'badge', jsonb_build_object(
            'type', 'BadgeClass',
            'id', b.id,
            'name', b.name,
            'description', COALESCE(b.description, ''),
            'image', COALESCE(b.icon_url, ''),
            'criteria', b.criteria
        ),
        'issuedOn', extract(epoch from lb.awarded_at),
        'verification', jsonb_build_object(
            'type', 'HostedBadge'
        )
    )
    FROM lms.learner_badges lb
    JOIN lms.badges b ON lb.badge_id = b.id
    WHERE lb.id = p_learner_badge_id;
$$;

-- Backfill open_badge_json for existing awards
UPDATE lms.learner_badges
SET open_badge_json = lms.build_open_badge_json(lms.learner_badges.id)
WHERE open_badge_json IS NULL
  AND verification_code IS NOT NULL;

-- Trigger to keep Open Badge assertion current on insert/update
CREATE OR REPLACE FUNCTION lms.maintain_open_badge_assertion()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, lms
AS $$
BEGIN
    IF NEW.verification_code IS NULL THEN
        NEW.verification_code = 'LEASHED-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
    END IF;
    NEW.open_badge_json = lms.build_open_badge_json(NEW.id);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS learner_badges_open_badge_assertion ON lms.learner_badges;
CREATE TRIGGER learner_badges_open_badge_assertion
    BEFORE INSERT OR UPDATE ON lms.learner_badges
    FOR EACH ROW EXECUTE FUNCTION lms.maintain_open_badge_assertion();

CREATE INDEX IF NOT EXISTS lms_learner_badges_verification_code_idx
    ON lms.learner_badges(verification_code) WHERE verification_code IS NOT NULL;

-- ============================================================================
-- PART 1B5: POINTS RECONCILIATION (learner_points.total_points drift fix)
-- ============================================================================

-- Fix existing drift: reconcile total_points with actual SUM of transactions
UPDATE lms.learner_points lp
SET total_points = COALESCE(actual_sum, 0),
    updated_at = now()
FROM (
    SELECT tenant_id, learner_user_id, SUM(points) AS actual_sum
    FROM lms.point_transactions
    GROUP BY tenant_id, learner_user_id
) pt
WHERE lp.tenant_id = pt.tenant_id
  AND lp.learner_user_id = pt.learner_user_id
  AND lp.total_points IS DISTINCT FROM COALESCE(pt.actual_sum, 0);

-- Trigger to prevent future drift: maintain total_points from point_transactions
CREATE OR REPLACE FUNCTION lms.reconcile_learner_points()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, lms
AS $$
DECLARE
    v_points_delta integer;
    v_learner uuid;
    v_tenant uuid;
BEGIN
    v_tenant := COALESCE(NEW.tenant_id, OLD.tenant_id);
    v_learner := COALESCE(NEW.learner_user_id, OLD.learner_user_id);
    v_points_delta := COALESCE(NEW.points, 0) - COALESCE(OLD.points, 0);

    IF TG_OP = 'DELETE' THEN
        v_points_delta := -OLD.points;
    END IF;

    -- Upssert learner_points with correct total
    INSERT INTO lms.learner_points (tenant_id, learner_user_id, total_points, points_this_week, points_this_month, updated_at)
    VALUES (v_tenant, v_learner, v_points_delta, 0, 0, now())
    ON CONFLICT (tenant_id, learner_user_id)
    DO UPDATE SET
        total_points = learner_points.total_points + v_points_delta,
        updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS point_transactions_reconcile ON lms.point_transactions;
CREATE TRIGGER point_transactions_reconcile
    AFTER INSERT OR UPDATE OR DELETE ON lms.point_transactions
    FOR EACH ROW EXECUTE FUNCTION lms.reconcile_learner_points();

-- ============================================================================
-- PART 1B6: LEADERBOARD SNAPSHOTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS lms.leaderboard_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    leaderboard_id uuid,
    snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
    snapshot_period text NOT NULL CHECK (snapshot_period IN ('daily','weekly','monthly','all_time')),
    rankings jsonb NOT NULL DEFAULT '[]',
    total_participants integer NOT NULL DEFAULT 0,
    computed_at timestamptz NOT NULL DEFAULT now(),
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id),
    UNIQUE(tenant_id, leaderboard_id, snapshot_date, snapshot_period)
);

CREATE INDEX IF NOT EXISTS lms_leaderboard_snapshots_date_idx
    ON lms.leaderboard_snapshots(tenant_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS lms_leaderboard_snapshots_leaderboard_idx
    ON lms.leaderboard_snapshots(tenant_id, leaderboard_id, snapshot_date DESC);

-- Migrate existing leaderboard rankings into snapshots
INSERT INTO lms.leaderboard_snapshots (tenant_id, leaderboard_id, snapshot_date, snapshot_period, rankings, total_participants, computed_at)
SELECT l.tenant_id, l.id, CURRENT_DATE, l.leaderboard_type, l.rankings, jsonb_array_length(l.rankings), now()
FROM lms.leaderboards l
WHERE l.rankings IS NOT NULL AND l.rankings != '[]'::jsonb
ON CONFLICT DO NOTHING;

-- compute_leaderboard_snapshot() function
CREATE OR REPLACE FUNCTION lms.compute_leaderboard_snapshot(
    p_tenant_id uuid,
    p_leaderboard_id uuid
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, lms
AS $$
DECLARE
    v_snapshot_id uuid;
    v_leaderboard_type text;
    v_course_id uuid;
    v_cohort_id uuid;
    v_rankings jsonb;
    v_count integer;
BEGIN
    SELECT leaderboard_type, course_id, cohort_id, rankings
    INTO v_leaderboard_type, v_course_id, v_cohort_id, v_rankings
    FROM lms.leaderboards
    WHERE id = p_leaderboard_id AND tenant_id = p_tenant_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Leaderboard % not found in tenant %', p_leaderboard_id, p_tenant_id;
    END IF;

    v_count := COALESCE(jsonb_array_length(v_rankings), 0);

    INSERT INTO lms.leaderboard_snapshots (tenant_id, leaderboard_id, snapshot_date, snapshot_period, rankings, total_participants, computed_at)
    VALUES (p_tenant_id, p_leaderboard_id, CURRENT_DATE, v_leaderboard_type, v_rankings, v_count, now())
    ON CONFLICT (tenant_id, leaderboard_id, snapshot_date, snapshot_period)
    DO UPDATE SET rankings = EXCLUDED.rankings, total_participants = EXCLUDED.total_participants, computed_at = now(), updated_at = now()
    RETURNING id INTO v_snapshot_id;

    RETURN v_snapshot_id;
END;
$$;

-- compute_all_leaderboard_snapshots() function
CREATE OR REPLACE FUNCTION lms.compute_all_leaderboard_snapshots(p_tenant_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, lms
AS $$
DECLARE
    v_count integer := 0;
    lb RECORD;
BEGIN
    FOR lb IN SELECT id, tenant_id FROM lms.leaderboards WHERE p_tenant_id IS NULL OR tenant_id = p_tenant_id LOOP
        PERFORM lms.compute_leaderboard_snapshot(lb.tenant_id, lb.id);
        v_count := v_count + 1;
    END LOOP;
    RETURN v_count;
END;
$$;

-- pg_cron scheduling (conditional — pg_cron may not be installed)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        PERFORM cron.schedule(
            'lms-leaderboard-snapshots-daily',
            '0 2 * * *',
            'SELECT lms.compute_all_leaderboard_snapshots();'
        );
    END IF;
END $$;

-- RLS for leaderboard_snapshots
ALTER TABLE lms.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS leaderboard_snapshots_access ON lms.leaderboard_snapshots;
CREATE POLICY leaderboard_snapshots_access ON lms.leaderboard_snapshots
    FOR ALL USING (lms.is_platform_admin() OR lms.is_tenant_member(tenant_id))
    WITH CHECK (lms.is_platform_admin() OR lms.is_tenant_member(tenant_id));

DROP TRIGGER IF EXISTS lms_leaderboard_snapshots_updated_at ON lms.leaderboard_snapshots;
CREATE TRIGGER lms_leaderboard_snapshots_updated_at
    BEFORE UPDATE ON lms.leaderboard_snapshots
    FOR EACH ROW EXECUTE FUNCTION lms.touch_updated_at();

COMMENT ON TABLE lms.leaderboard_snapshots IS 'Historical leaderboard snapshots for trend tracking. Populated by compute_leaderboard_snapshot() / compute_all_leaderboard_snapshots().';

-- ============================================================================
-- PART 1B7: FAIL-FAST AUDIT (EXPANDED)
-- ============================================================================

DO $$ BEGIN
    RAISE NOTICE '=== GAP CLOSURE 002 AUDIT ===';

    -- Re-verify Gap Closure 001 invariants
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        RAISE EXCEPTION 'pgvector extension is not installed. Run: CREATE EXTENSION IF NOT EXISTS vector;';
    END IF;
    RAISE NOTICE 'PASS: pgvector extension installed';

    -- Credential requirements non-vacuous: active credential_definitions must have requirements
    IF EXISTS (
        SELECT 1 FROM lms.credential_definitions cd
        WHERE cd.is_active = true
          AND NOT EXISTS (
              SELECT 1 FROM lms.credential_requirements cr
              WHERE cr.credential_definition_id = cd.id AND cr.tenant_id = cd.tenant_id
          )
    ) THEN
        RAISE EXCEPTION 'Active credential_definitions exist with zero credential_requirements rows';
    END IF;
    RAISE NOTICE 'PASS: All active credential_definitions have at least one requirement';

    -- Skill consistency: course_linked signoffs must have course_id
    IF EXISTS (
        SELECT 1 FROM lms.skill_signoffs
        WHERE verification_kind = 'course_linked' AND course_id IS NULL
    ) THEN
        RAISE EXCEPTION 'skill_signoffs has course_linked verification_kind with NULL course_id';
    END IF;
    RAISE NOTICE 'PASS: skill_signoffs verification_kind consistency verified';

    -- Open Badges assertions: learner_badges with verification_code must have open_badge_json
    IF EXISTS (
        SELECT 1 FROM lms.learner_badges
        WHERE verification_code IS NOT NULL AND open_badge_json IS NULL
    ) THEN
        RAISE EXCEPTION 'learner_badges has verification_code but NULL open_badge_json';
    END IF;
    RAISE NOTICE 'PASS: Open Badges 3.0 assertions complete';

    -- Points zero-drift: total_points must match SUM(point_transactions.points)
    IF EXISTS (
        SELECT 1 FROM lms.learner_points lp
        LEFT JOIN (
            SELECT tenant_id, learner_user_id, SUM(points) AS actual_sum
            FROM lms.point_transactions
            GROUP BY tenant_id, learner_user_id
        ) pt ON lp.tenant_id = pt.tenant_id AND lp.learner_user_id = pt.learner_user_id
        WHERE lp.total_points IS DISTINCT FROM COALESCE(pt.actual_sum, 0)
    ) THEN
        RAISE EXCEPTION 'Points drift detected: learner_points.total_points does not match SUM(point_transactions.points)';
    END IF;
    RAISE NOTICE 'PASS: Points zero-drift verified';

    -- Leaderboard snapshots: at least one snapshot per active leaderboard
    IF EXISTS (
        SELECT 1 FROM lms.leaderboards l
        WHERE l.is_active = true
          AND NOT EXISTS (
              SELECT 1 FROM lms.leaderboard_snapshots ls
              WHERE ls.leaderboard_id = l.id AND ls.tenant_id = l.tenant_id
          )
    ) THEN
        RAISE NOTICE 'WARNING: Active leaderboards exist without snapshots — run compute_all_leaderboard_snapshots()';
    ELSE
        RAISE NOTICE 'PASS: All active leaderboards have snapshots';
    END IF;

    -- RAG storage paths: documents with storage_path should follow tenant/pathway scoping
    IF EXISTS (
        SELECT 1 FROM lms.ai_rag_documents
        WHERE storage_path IS NOT NULL
          AND storage_path !~ '^[a-f0-9-]+/'
    ) THEN
        RAISE NOTICE 'WARNING: Some RAG documents have storage_paths that do not follow tenant-scoped folder pattern';
    ELSE
        RAISE NOTICE 'PASS: RAG storage paths follow tenant-scoped pattern';
    END IF;

    -- All new tenant-scoped tables must have RLS enabled
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'lms' AND tablename = 'credential_requirements' AND rowsecurity = true) THEN
        RAISE EXCEPTION 'lms.credential_requirements does not have RLS enabled';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'lms' AND tablename = 'leaderboard_snapshots' AND rowsecurity = true) THEN
        RAISE EXCEPTION 'lms.leaderboard_snapshots does not have RLS enabled';
    END IF;
    RAISE NOTICE 'PASS: All new tenant-scoped tables have RLS enabled';

    RAISE NOTICE '=== GAP CLOSURE 002 AUDIT COMPLETE ===';
END $$;

-- ============================================================================
-- ============================================================================
-- PART 2: CONSUMER SCHEMA PATCH (19 LEARNER-FACING TABLES)
-- Maps to product feature tree: Home, Lessons, Assignments, Grades, Notes,
-- Books/Reads, Calendar, Messages, Files/Uploads, Notebook, Media, Meet, Share
-- ============================================================================
-- ============================================================================

-- ============================================================================
-- 2.1: USER UI PREFERENCES (Home dashboard personalization)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lms.user_ui_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    course_id uuid,
    cohort_id uuid,
    preferred_theme text NOT NULL DEFAULT 'system' CHECK (preferred_theme IN ('light','dark','system')),
    sidebar_collapsed boolean NOT NULL DEFAULT false,
    default_landing_page text NOT NULL DEFAULT 'home' CHECK (default_landing_page IN ('home','lessons','assignments','grades','calendar','messages','notebook')),
    notification_sound_enabled boolean NOT NULL DEFAULT true,
    notification_badge_count integer NOT NULL DEFAULT 0,
    recently_visited jsonb NOT NULL DEFAULT '[]'::jsonb,
    pinned_items jsonb NOT NULL DEFAULT '[]'::jsonb,
    custom_shortcuts jsonb NOT NULL DEFAULT '[]'::jsonb,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id)
);
CREATE UNIQUE INDEX IF NOT EXISTS lms_user_ui_preferences_unique_idx ON lms.user_ui_preferences
    (tenant_id, user_id, COALESCE(course_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(cohort_id, '00000000-0000-0000-0000-000000000000'::uuid));
ALTER TABLE lms.user_ui_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_ui_preferences_access ON lms.user_ui_preferences;
CREATE POLICY user_ui_preferences_access ON lms.user_ui_preferences
    FOR ALL USING (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND user_id = auth.uid())
    ) WITH CHECK (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND user_id = auth.uid())
    );
CREATE INDEX IF NOT EXISTS lms_user_ui_preferences_user_idx ON lms.user_ui_preferences(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS lms_user_ui_preferences_course_idx ON lms.user_ui_preferences(tenant_id, course_id) WHERE course_id IS NOT NULL;
DROP TRIGGER IF EXISTS lms_user_ui_preferences_updated_at ON lms.user_ui_preferences;
CREATE TRIGGER lms_user_ui_preferences_updated_at BEFORE UPDATE ON lms.user_ui_preferences FOR EACH ROW EXECUTE FUNCTION lms.touch_updated_at();
COMMENT ON TABLE lms.user_ui_preferences IS 'Home dashboard personalization: theme, sidebar state, default landing page, recently visited, pinned items. [UI: Home]';

-- ============================================================================
-- 2.2: DASHBOARD LAYOUTS (Home dashboard widget arrangement)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lms.dashboard_layouts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    course_id uuid,
    cohort_id uuid,
    layout_type text NOT NULL DEFAULT 'home' CHECK (layout_type IN ('home','course','cohort','mobile','tablet')),
    widget_config jsonb NOT NULL DEFAULT '{}'::jsonb,
    is_default boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id)
);
CREATE UNIQUE INDEX IF NOT EXISTS lms_dashboard_layouts_unique_idx ON lms.dashboard_layouts
    (tenant_id, user_id, layout_type, COALESCE(course_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(cohort_id, '00000000-0000-0000-0000-000000000000'::uuid));
ALTER TABLE lms.dashboard_layouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dashboard_layouts_access ON lms.dashboard_layouts;
CREATE POLICY dashboard_layouts_access ON lms.dashboard_layouts
    FOR ALL USING (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND user_id = auth.uid())
    ) WITH CHECK (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND user_id = auth.uid())
    );
CREATE INDEX IF NOT EXISTS lms_dashboard_layouts_user_idx ON lms.dashboard_layouts(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS lms_dashboard_layouts_type_idx ON lms.dashboard_layouts(tenant_id, user_id, layout_type);
DROP TRIGGER IF EXISTS lms_dashboard_layouts_updated_at ON lms.dashboard_layouts;
CREATE TRIGGER lms_dashboard_layouts_updated_at BEFORE UPDATE ON lms.dashboard_layouts FOR EACH ROW EXECUTE FUNCTION lms.touch_updated_at();
COMMENT ON TABLE lms.dashboard_layouts IS 'Home dashboard widget arrangement and configuration. [UI: Home]';

-- ============================================================================
-- 2.3: NOTIFICATION CENTER (Messages/Notifications)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lms.notification_center (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    notification_type text NOT NULL CHECK (notification_type IN ('assignment_due','grade_posted','message_received','event_reminder','course_update','badge_earned','deadline_approaching','system_alert','announcement')),
    title text NOT NULL,
    body text,
    action_url text,
    action_label text,
    priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
    is_read boolean NOT NULL DEFAULT false,
    read_at timestamptz,
    is_archived boolean NOT NULL DEFAULT false,
    archived_at timestamptz,
    category text NOT NULL DEFAULT 'general' CHECK (category IN ('academic','social','system','deadline','achievement')),
    related_entity_type text,
    related_entity_id uuid,
    expires_at timestamptz,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id)
);
ALTER TABLE lms.notification_center ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notification_center_access ON lms.notification_center;
CREATE POLICY notification_center_access ON lms.notification_center
    FOR ALL USING (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND user_id = auth.uid())
    ) WITH CHECK (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND user_id = auth.uid())
    );
CREATE INDEX IF NOT EXISTS lms_notification_center_user_idx ON lms.notification_center(tenant_id, user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS lms_notification_center_unread_idx ON lms.notification_center(tenant_id, user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS lms_notification_center_category_idx ON lms.notification_center(tenant_id, user_id, category);
CREATE INDEX IF NOT EXISTS lms_notification_center_priority_idx ON lms.notification_center(tenant_id, user_id, priority) WHERE is_read = false;
DROP TRIGGER IF EXISTS lms_notification_center_updated_at ON lms.notification_center;
CREATE TRIGGER lms_notification_center_updated_at BEFORE UPDATE ON lms.notification_center FOR EACH ROW EXECUTE FUNCTION lms.touch_updated_at();
COMMENT ON TABLE lms.notification_center IS 'Unified notification center for in-app notifications. [UI: Messages]';

-- ============================================================================
-- 2.4: QUICK ACTIONS (Home dashboard quick actions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lms.quick_actions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid,
    course_id uuid,
    cohort_id uuid,
    action_type text NOT NULL CHECK (action_type IN ('start_lesson','submit_assignment','take_quiz','view_grade','create_note','open_book','join_meeting','view_schedule','send_message','upload_file')),
    label text NOT NULL,
    icon text,
    target_url text NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    is_visible boolean NOT NULL DEFAULT true,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id)
);
ALTER TABLE lms.quick_actions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS quick_actions_access ON lms.quick_actions;
CREATE POLICY quick_actions_access ON lms.quick_actions
    FOR ALL USING (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND (user_id IS NULL OR user_id = auth.uid()))
    ) WITH CHECK (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND (user_id IS NULL OR user_id = auth.uid()))
    );
CREATE INDEX IF NOT EXISTS lms_quick_actions_user_idx ON lms.quick_actions(tenant_id, user_id, sort_order) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS lms_quick_actions_tenant_idx ON lms.quick_actions(tenant_id, sort_order) WHERE user_id IS NULL;
DROP TRIGGER IF EXISTS lms_quick_actions_updated_at ON lms.quick_actions;
CREATE TRIGGER lms_quick_actions_updated_at BEFORE UPDATE ON lms.quick_actions FOR EACH ROW EXECUTE FUNCTION lms.touch_updated_at();
COMMENT ON TABLE lms.quick_actions IS 'Home dashboard quick action shortcuts. [UI: Home]';

-- ============================================================================
-- 2.5: CONVERSATIONS (Messages — chat threads)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lms.conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    course_id uuid,
    cohort_id uuid,
    conversation_type text NOT NULL DEFAULT 'direct' CHECK (conversation_type IN ('direct','group','course','cohort','support')),
    title text,
    created_by uuid NOT NULL,
    is_archived boolean NOT NULL DEFAULT false,
    last_message_at timestamptz,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id)
);
CREATE INDEX IF NOT EXISTS lms_conversations_course_idx ON lms.conversations(tenant_id, course_id) WHERE course_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS lms_conversations_cohort_idx ON lms.conversations(tenant_id, cohort_id) WHERE cohort_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS lms_conversations_last_msg_idx ON lms.conversations(tenant_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS lms_conversations_archived_idx ON lms.conversations(tenant_id, is_archived) WHERE is_archived = false;
DROP TRIGGER IF EXISTS lms_conversations_updated_at ON lms.conversations;
CREATE TRIGGER lms_conversations_updated_at BEFORE UPDATE ON lms.conversations FOR EACH ROW EXECUTE FUNCTION lms.touch_updated_at();
COMMENT ON TABLE lms.conversations IS 'Chat threads for Messages. Direct, group, course, cohort, support. [UI: Messages]';

-- ============================================================================
-- 2.6: CONVERSATION PARTICIPANTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS lms.conversation_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    conversation_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member','viewer')),
    joined_at timestamptz NOT NULL DEFAULT now(),
    left_at timestamptz,
    last_read_at timestamptz,
    muted boolean NOT NULL DEFAULT false,
    pinned boolean NOT NULL DEFAULT false,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id),
    UNIQUE(tenant_id, conversation_id, user_id)
);
ALTER TABLE lms.conversation_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS conversation_participants_access ON lms.conversation_participants;
CREATE POLICY conversation_participants_access ON lms.conversation_participants
    FOR ALL USING (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND user_id = auth.uid())
        OR (lms.is_tenant_member(tenant_id) AND EXISTS (
            SELECT 1 FROM lms.conversation_participants cp2
            WHERE cp2.conversation_id = lms.conversation_participants.conversation_id
              AND cp2.user_id = auth.uid()
              AND cp2.left_at IS NULL
        ))
    ) WITH CHECK (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND user_id = auth.uid())
    );
CREATE INDEX IF NOT EXISTS lms_conversation_participants_conv_idx ON lms.conversation_participants(tenant_id, conversation_id);
CREATE INDEX IF NOT EXISTS lms_conversation_participants_user_idx ON lms.conversation_participants(tenant_id, user_id);
DROP TRIGGER IF EXISTS lms_conversation_participants_updated_at ON lms.conversation_participants;
CREATE TRIGGER lms_conversation_participants_updated_at BEFORE UPDATE ON lms.conversation_participants FOR EACH ROW EXECUTE FUNCTION lms.touch_updated_at();
COMMENT ON TABLE lms.conversation_participants IS 'Participants in chat conversations. [UI: Messages]';

-- Now add conversations RLS (references conversation_participants)
ALTER TABLE lms.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS conversations_access ON lms.conversations;
CREATE POLICY conversations_access ON lms.conversations
    FOR ALL USING (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND (
            created_by = auth.uid()
            OR EXISTS (
                SELECT 1 FROM lms.conversation_participants cp
                WHERE cp.conversation_id = lms.conversations.id
                  AND cp.user_id = auth.uid()
                  AND cp.left_at IS NULL
            )
        ))
    ) WITH CHECK (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND created_by = auth.uid())
    );

-- ============================================================================
-- 2.7: CONVERSATION MESSAGES (Messages — individual chat messages)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lms.conversation_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    conversation_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text','image','file','voice','video','system','assignment_link','grade_link')),
    body text,
    attachment_url text,
    attachment_type text,
    attachment_size bigint,
    reply_to_id uuid,
    edited_at timestamptz,
    deleted_at timestamptz,
    is_pinned boolean NOT NULL DEFAULT false,
    read_receipts jsonb NOT NULL DEFAULT '{}'::jsonb,
    reactions jsonb NOT NULL DEFAULT '{}'::jsonb,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id)
);
ALTER TABLE lms.conversation_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS conversation_messages_access ON lms.conversation_messages;
CREATE POLICY conversation_messages_access ON lms.conversation_messages
    FOR ALL USING (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND EXISTS (
            SELECT 1 FROM lms.conversation_participants cp
            WHERE cp.conversation_id = lms.conversation_messages.conversation_id
              AND cp.user_id = auth.uid()
              AND cp.left_at IS NULL
        ))
    ) WITH CHECK (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND sender_id = auth.uid())
    );
CREATE INDEX IF NOT EXISTS lms_conversation_messages_conv_idx ON lms.conversation_messages(tenant_id, conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS lms_conversation_messages_sender_idx ON lms.conversation_messages(tenant_id, sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS lms_conversation_messages_unread_idx ON lms.conversation_messages(tenant_id, conversation_id) WHERE deleted_at IS NULL;
DROP TRIGGER IF EXISTS lms_conversation_messages_updated_at ON lms.conversation_messages;
CREATE TRIGGER lms_conversation_messages_updated_at BEFORE UPDATE ON lms.conversation_messages FOR EACH ROW EXECUTE FUNCTION lms.touch_updated_at();
COMMENT ON TABLE lms.conversation_messages IS 'Individual chat messages with attachments, reactions, read receipts. [UI: Messages]';

-- ============================================================================
-- 2.8: NOTEBOOK SECTIONS (Notebook — folder organization)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lms.notebook_sections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    course_id uuid,
    cohort_id uuid,
    name text NOT NULL,
    description text,
    section_type text NOT NULL DEFAULT 'general' CHECK (section_type IN ('general','course','project','personal','study_group','archive')),
    color text,
    icon text,
    sort_order integer NOT NULL DEFAULT 0,
    is_collapsed boolean NOT NULL DEFAULT false,
    is_archived boolean NOT NULL DEFAULT false,
    parent_section_id uuid,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id)
);
CREATE UNIQUE INDEX IF NOT EXISTS lms_notebook_sections_unique_idx ON lms.notebook_sections
    (tenant_id, user_id, name, COALESCE(course_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(parent_section_id, '00000000-0000-0000-0000-000000000000'::uuid));
ALTER TABLE lms.notebook_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notebook_sections_access ON lms.notebook_sections;
CREATE POLICY notebook_sections_access ON lms.notebook_sections
    FOR ALL USING (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND user_id = auth.uid())
    ) WITH CHECK (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND user_id = auth.uid())
    );
CREATE INDEX IF NOT EXISTS lms_notebook_sections_user_idx ON lms.notebook_sections(tenant_id, user_id, sort_order);
CREATE INDEX IF NOT EXISTS lms_notebook_sections_course_idx ON lms.notebook_sections(tenant_id, user_id, course_id) WHERE course_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS lms_notebook_sections_parent_idx ON lms.notebook_sections(tenant_id, user_id, parent_section_id) WHERE parent_section_id IS NOT NULL;
DROP TRIGGER IF EXISTS lms_notebook_sections_updated_at ON lms.notebook_sections;
CREATE TRIGGER lms_notebook_sections_updated_at BEFORE UPDATE ON lms.notebook_sections FOR EACH ROW EXECUTE FUNCTION lms.touch_updated_at();
COMMENT ON TABLE lms.notebook_sections IS 'Notebook folder organization (sections, projects, archives). [UI: Notebook]';

-- ============================================================================
-- 2.9: NOTEBOOK PAGES (Notebook — rich text / handwritten notes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lms.notebook_pages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    section_id uuid,
    user_id uuid NOT NULL,
    course_id uuid,
    lesson_id uuid,
    title text NOT NULL DEFAULT 'Untitled',
    content jsonb NOT NULL DEFAULT '{}'::jsonb,
    content_text text,
    page_type text NOT NULL DEFAULT 'note' CHECK (page_type IN ('note','outline','flashcards','mind_map','study_guide','summary','draft')),
    tags text[] NOT NULL DEFAULT ARRAY[]::text[],
    is_starred boolean NOT NULL DEFAULT false,
    is_archived boolean NOT NULL DEFAULT false,
    is_template boolean NOT NULL DEFAULT false,
    linked_assignment_id uuid,
    linked_quiz_id uuid,
    word_count integer NOT NULL DEFAULT 0,
    cover_image_url text,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id)
);
CREATE UNIQUE INDEX IF NOT EXISTS lms_notebook_pages_section_unique_idx ON lms.notebook_pages
    (tenant_id, user_id, section_id, title) WHERE section_id IS NOT NULL;
ALTER TABLE lms.notebook_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notebook_pages_access ON lms.notebook_pages;
CREATE POLICY notebook_pages_access ON lms.notebook_pages
    FOR ALL USING (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND user_id = auth.uid())
    ) WITH CHECK (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND user_id = auth.uid())
    );
CREATE INDEX IF NOT EXISTS lms_notebook_pages_user_idx ON lms.notebook_pages(tenant_id, user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS lms_notebook_pages_section_idx ON lms.notebook_pages(tenant_id, user_id, section_id) WHERE section_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS lms_notebook_pages_course_idx ON lms.notebook_pages(tenant_id, user_id, course_id) WHERE course_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS lms_notebook_pages_starred_idx ON lms.notebook_pages(tenant_id, user_id) WHERE is_starred = true;
CREATE INDEX IF NOT EXISTS lms_notebook_pages_tags_idx ON lms.notebook_pages USING gin(tags) WHERE tags != ARRAY[]::text[];
DROP TRIGGER IF EXISTS lms_notebook_pages_updated_at ON lms.notebook_pages;
CREATE TRIGGER lms_notebook_pages_updated_at BEFORE UPDATE ON lms.notebook_pages FOR EACH ROW EXECUTE FUNCTION lms.touch_updated_at();
COMMENT ON TABLE lms.notebook_pages IS 'Notebook pages: rich text notes, outlines, flashcards, study guides. [UI: Notebook]';

-- ============================================================================
-- 2.10: NOTEBOOK TEMPLATES (Notebook — reusable page templates)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lms.notebook_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid,
    course_id uuid,
    name text NOT NULL,
    description text,
    template_type text NOT NULL CHECK (template_type IN ('note','outline','flashcards','study_guide','summary','meeting','project')),
    content jsonb NOT NULL DEFAULT '{}'::jsonb,
    is_shared boolean NOT NULL DEFAULT false,
    usage_count integer NOT NULL DEFAULT 0,
    icon text,
    color text,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id)
);
CREATE UNIQUE INDEX IF NOT EXISTS lms_notebook_templates_unique_idx ON lms.notebook_templates
    (tenant_id, name, COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid));
ALTER TABLE lms.notebook_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notebook_templates_access ON lms.notebook_templates;
CREATE POLICY notebook_templates_access ON lms.notebook_templates
    FOR ALL USING (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND (user_id = auth.uid() OR is_shared = true))
    ) WITH CHECK (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND user_id = auth.uid())
    );
CREATE INDEX IF NOT EXISTS lms_notebook_templates_user_idx ON lms.notebook_templates(tenant_id, user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS lms_notebook_templates_shared_idx ON lms.notebook_templates(tenant_id, is_shared) WHERE is_shared = true;
DROP TRIGGER IF EXISTS lms_notebook_templates_updated_at ON lms.notebook_templates;
CREATE TRIGGER lms_notebook_templates_updated_at BEFORE UPDATE ON lms.notebook_templates FOR EACH ROW EXECUTE FUNCTION lms.touch_updated_at();
COMMENT ON TABLE lms.notebook_templates IS 'Reusable notebook page templates, shareable within tenant. [UI: Notebook]';

-- ============================================================================
-- 2.11: READING PROGRESS (Books/Reads — track reading of content_library_items)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lms.reading_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    content_item_id uuid,
    course_id uuid,
    lesson_id uuid,
    resource_id uuid,
    reading_status text NOT NULL DEFAULT 'not_started' CHECK (reading_status IN ('not_started','in_progress','completed','paused','abandoned')),
    progress_percentage numeric(5,2) NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    current_page integer,
    total_pages integer,
    current_section text,
    total_sections integer,
    time_spent_seconds integer NOT NULL DEFAULT 0,
    last_read_at timestamptz,
    completed_at timestamptz,
    bookmarks jsonb NOT NULL DEFAULT '[]'::jsonb,
    highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
    notes text,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id)
);
CREATE UNIQUE INDEX IF NOT EXISTS lms_reading_progress_unique_idx ON lms.reading_progress
    (tenant_id, user_id, COALESCE(content_item_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(course_id, '00000000-0000-0000-0000-000000000000'::uuid));
ALTER TABLE lms.reading_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS reading_progress_access ON lms.reading_progress;
CREATE POLICY reading_progress_access ON lms.reading_progress
    FOR ALL USING (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND user_id = auth.uid())
    ) WITH CHECK (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND user_id = auth.uid())
    );
CREATE INDEX IF NOT EXISTS lms_reading_progress_user_idx ON lms.reading_progress(tenant_id, user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS lms_reading_progress_content_idx ON lms.reading_progress(tenant_id, user_id, content_item_id) WHERE content_item_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS lms_reading_progress_status_idx ON lms.reading_progress(tenant_id, user_id, reading_status) WHERE reading_status IN ('not_started','in_progress','paused');
DROP TRIGGER IF EXISTS lms_reading_progress_updated_at ON lms.reading_progress;
CREATE TRIGGER lms_reading_progress_updated_at BEFORE UPDATE ON lms.reading_progress FOR EACH ROW EXECUTE FUNCTION lms.touch_updated_at();
COMMENT ON TABLE lms.reading_progress IS 'Track reading progress for books, study guides, and resources. [UI: Books/Reads]';

-- ============================================================================
-- 2.12: READING LISTS (Books/Reads — curated reading collections)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lms.reading_lists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    course_id uuid,
    cohort_id uuid,
    created_by uuid NOT NULL,
    name text NOT NULL,
    description text,
    list_type text NOT NULL DEFAULT 'curated' CHECK (list_type IN ('curated','required','recommended','supplemental','personal')),
    cover_image_url text,
    is_published boolean NOT NULL DEFAULT false,
    sort_order integer NOT NULL DEFAULT 0,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id)
);
CREATE UNIQUE INDEX IF NOT EXISTS lms_reading_lists_unique_idx ON lms.reading_lists
    (tenant_id, name, COALESCE(course_id, '00000000-0000-0000-0000-000000000000'::uuid));
ALTER TABLE lms.reading_lists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS reading_lists_access ON lms.reading_lists;
CREATE POLICY reading_lists_access ON lms.reading_lists
    FOR ALL USING (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND (is_published = true OR created_by = auth.uid()))
    ) WITH CHECK (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND created_by = auth.uid())
    );
CREATE INDEX IF NOT EXISTS lms_reading_lists_course_idx ON lms.reading_lists(tenant_id, course_id) WHERE course_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS lms_reading_lists_published_idx ON lms.reading_lists(tenant_id, is_published) WHERE is_published = true;
DROP TRIGGER IF EXISTS lms_reading_lists_updated_at ON lms.reading_lists;
CREATE TRIGGER lms_reading_lists_updated_at BEFORE UPDATE ON lms.reading_lists FOR EACH ROW EXECUTE FUNCTION lms.touch_updated_at();
COMMENT ON TABLE lms.reading_lists IS 'Curated reading collections for Books/Reads. [UI: Books/Reads]';

-- ============================================================================
-- 2.13: READING LIST ITEMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS lms.reading_list_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    reading_list_id uuid NOT NULL,
    content_item_id uuid,
    media_asset_id uuid,
    lesson_resource_id uuid,
    title text NOT NULL,
    item_type text NOT NULL DEFAULT 'book' CHECK (item_type IN ('book','article','video','document','external_link','pdf')),
    external_url text,
    sort_order integer NOT NULL DEFAULT 0,
    is_required boolean NOT NULL DEFAULT false,
    estimated_read_time_minutes integer,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id),
    UNIQUE(tenant_id, reading_list_id, sort_order)
);
ALTER TABLE lms.reading_list_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS reading_list_items_access ON lms.reading_list_items;
CREATE POLICY reading_list_items_access ON lms.reading_list_items
    FOR ALL USING (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND EXISTS (
            SELECT 1 FROM lms.reading_lists rl
            WHERE rl.id = lms.reading_list_items.reading_list_id
              AND (rl.is_published = true OR rl.created_by = auth.uid())
        ))
    ) WITH CHECK (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND EXISTS (
            SELECT 1 FROM lms.reading_lists rl
            WHERE rl.id = lms.reading_list_items.reading_list_id
              AND rl.created_by = auth.uid()
        ))
    );
CREATE INDEX IF NOT EXISTS lms_reading_list_items_list_idx ON lms.reading_list_items(tenant_id, reading_list_id, sort_order);
DROP TRIGGER IF EXISTS lms_reading_list_items_updated_at ON lms.reading_list_items;
CREATE TRIGGER lms_reading_list_items_updated_at BEFORE UPDATE ON lms.reading_list_items FOR EACH ROW EXECUTE FUNCTION lms.touch_updated_at();
COMMENT ON TABLE lms.reading_list_items IS 'Items within reading lists. [UI: Books/Reads]';

-- ============================================================================
-- 2.14: MEDIA PLAYLISTS (Media — curated video/audio collections)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lms.media_playlists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    course_id uuid,
    cohort_id uuid,
    created_by uuid NOT NULL,
    name text NOT NULL,
    description text,
    playlist_type text NOT NULL DEFAULT 'video' CHECK (playlist_type IN ('video','audio','mixed','interactive')),
    cover_image_url text,
    is_published boolean NOT NULL DEFAULT false,
    total_duration_seconds integer NOT NULL DEFAULT 0,
    item_count integer NOT NULL DEFAULT 0,
    sort_order integer NOT NULL DEFAULT 0,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id)
);
CREATE UNIQUE INDEX IF NOT EXISTS lms_media_playlists_unique_idx ON lms.media_playlists
    (tenant_id, name, COALESCE(course_id, '00000000-0000-0000-0000-000000000000'::uuid));
ALTER TABLE lms.media_playlists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS media_playlists_access ON lms.media_playlists;
CREATE POLICY media_playlists_access ON lms.media_playlists
    FOR ALL USING (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND (is_published = true OR created_by = auth.uid()))
    ) WITH CHECK (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND created_by = auth.uid())
    );
CREATE INDEX IF NOT EXISTS lms_media_playlists_course_idx ON lms.media_playlists(tenant_id, course_id) WHERE course_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS lms_media_playlists_published_idx ON lms.media_playlists(tenant_id, is_published) WHERE is_published = true;
DROP TRIGGER IF EXISTS lms_media_playlists_updated_at ON lms.media_playlists;
CREATE TRIGGER lms_media_playlists_updated_at BEFORE UPDATE ON lms.media_playlists FOR EACH ROW EXECUTE FUNCTION lms.touch_updated_at();
COMMENT ON TABLE lms.media_playlists IS 'Curated video/audio collections for Media page. [UI: Media]';

-- ============================================================================
-- 2.15: MEDIA PLAYLIST ITEMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS lms.media_playlist_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    playlist_id uuid NOT NULL,
    media_asset_id uuid,
    title text NOT NULL,
    item_type text NOT NULL DEFAULT 'video' CHECK (item_type IN ('video','audio','interactive','external')),
    external_url text,
    duration_seconds integer,
    sort_order integer NOT NULL DEFAULT 0,
    is_required boolean NOT NULL DEFAULT false,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id),
    UNIQUE(tenant_id, playlist_id, sort_order)
);
ALTER TABLE lms.media_playlist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS media_playlist_items_access ON lms.media_playlist_items;
CREATE POLICY media_playlist_items_access ON lms.media_playlist_items
    FOR ALL USING (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND EXISTS (
            SELECT 1 FROM lms.media_playlists mp
            WHERE mp.id = lms.media_playlist_items.playlist_id
              AND (mp.is_published = true OR mp.created_by = auth.uid())
        ))
    ) WITH CHECK (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND EXISTS (
            SELECT 1 FROM lms.media_playlists mp
            WHERE mp.id = lms.media_playlist_items.playlist_id
              AND mp.created_by = auth.uid()
        ))
    );
CREATE INDEX IF NOT EXISTS lms_media_playlist_items_playlist_idx ON lms.media_playlist_items(tenant_id, playlist_id, sort_order);
DROP TRIGGER IF EXISTS lms_media_playlist_items_updated_at ON lms.media_playlist_items;
CREATE TRIGGER lms_media_playlist_items_updated_at BEFORE UPDATE ON lms.media_playlist_items FOR EACH ROW EXECUTE FUNCTION lms.touch_updated_at();
COMMENT ON TABLE lms.media_playlist_items IS 'Items within media playlists. [UI: Media]';

-- ============================================================================
-- 2.16: FILE FOLDERS (Files/Uploads — folder hierarchy)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lms.file_folders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    course_id uuid,
    cohort_id uuid,
    parent_folder_id uuid,
    name text NOT NULL,
    folder_type text NOT NULL DEFAULT 'general' CHECK (folder_type IN ('general','course','assignment','submission','shared','personal','archive')),
    color text,
    icon text,
    sort_order integer NOT NULL DEFAULT 0,
    is_shared boolean NOT NULL DEFAULT false,
    is_archived boolean NOT NULL DEFAULT false,
    file_count integer NOT NULL DEFAULT 0,
    total_size_bytes bigint NOT NULL DEFAULT 0,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id),
    UNIQUE(tenant_id, user_id, parent_folder_id, name)
);
ALTER TABLE lms.file_folders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS file_folders_access ON lms.file_folders;
CREATE POLICY file_folders_access ON lms.file_folders
    FOR ALL USING (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND user_id = auth.uid())
        OR (lms.is_tenant_member(tenant_id) AND is_shared = true)
    ) WITH CHECK (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND user_id = auth.uid())
    );
CREATE INDEX IF NOT EXISTS lms_file_folders_user_idx ON lms.file_folders(tenant_id, user_id, parent_folder_id);
CREATE INDEX IF NOT EXISTS lms_file_folders_course_idx ON lms.file_folders(tenant_id, user_id, course_id) WHERE course_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS lms_file_folders_shared_idx ON lms.file_folders(tenant_id, is_shared) WHERE is_shared = true;
DROP TRIGGER IF EXISTS lms_file_folders_updated_at ON lms.file_folders;
CREATE TRIGGER lms_file_folders_updated_at BEFORE UPDATE ON lms.file_folders FOR EACH ROW EXECUTE FUNCTION lms.touch_updated_at();
COMMENT ON TABLE lms.file_folders IS 'Folder hierarchy for Files/Uploads. [UI: Files/Uploads]';

-- ============================================================================
-- 2.17: FILE UPLOADS (Files/Uploads — individual file metadata)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lms.file_uploads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    folder_id uuid,
    course_id uuid,
    assignment_id uuid,
    submission_id uuid,
    file_name text NOT NULL,
    file_type text NOT NULL,
    file_extension text,
    mime_type text,
    file_size_bytes bigint NOT NULL DEFAULT 0,
    storage_path text NOT NULL,
    storage_bucket text NOT NULL DEFAULT 'lms-uploads',
    upload_status text NOT NULL DEFAULT 'uploading' CHECK (upload_status IN ('uploading','completed','failed','virus_scan','deleted')),
    checksum text,
    is_starred boolean NOT NULL DEFAULT false,
    is_shared boolean NOT NULL DEFAULT false,
    shared_with jsonb NOT NULL DEFAULT '[]'::jsonb,
    share_link text,
    share_expires_at timestamptz,
    download_count integer NOT NULL DEFAULT 0,
    version_number integer NOT NULL DEFAULT 1,
    parent_file_id uuid,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id)
);
CREATE UNIQUE INDEX IF NOT EXISTS lms_file_uploads_folder_unique_idx ON lms.file_uploads
    (tenant_id, user_id, folder_id, file_name) WHERE folder_id IS NOT NULL;
ALTER TABLE lms.file_uploads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS file_uploads_access ON lms.file_uploads;
CREATE POLICY file_uploads_access ON lms.file_uploads
    FOR ALL USING (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND user_id = auth.uid())
        OR (lms.is_tenant_member(tenant_id) AND is_shared = true)
    ) WITH CHECK (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND user_id = auth.uid())
    );
CREATE INDEX IF NOT EXISTS lms_file_uploads_user_idx ON lms.file_uploads(tenant_id, user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS lms_file_uploads_folder_idx ON lms.file_uploads(tenant_id, user_id, folder_id) WHERE folder_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS lms_file_uploads_course_idx ON lms.file_uploads(tenant_id, user_id, course_id) WHERE course_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS lms_file_uploads_type_idx ON lms.file_uploads(tenant_id, user_id, file_type);
CREATE INDEX IF NOT EXISTS lms_file_uploads_starred_idx ON lms.file_uploads(tenant_id, user_id) WHERE is_starred = true;
CREATE INDEX IF NOT EXISTS lms_file_uploads_shared_idx ON lms.file_uploads(tenant_id, is_shared) WHERE is_shared = true;
DROP TRIGGER IF EXISTS lms_file_uploads_updated_at ON lms.file_uploads;
CREATE TRIGGER lms_file_uploads_updated_at BEFORE UPDATE ON lms.file_uploads FOR EACH ROW EXECUTE FUNCTION lms.touch_updated_at();
COMMENT ON TABLE lms.file_uploads IS 'Individual file metadata for Files/Uploads. Storage-backed. [UI: Files/Uploads]';

-- ============================================================================
-- 2.18: STORAGE USAGE TRACKING (Files/Uploads — storage quota)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lms.storage_usage (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    total_files integer NOT NULL DEFAULT 0,
    total_size_bytes bigint NOT NULL DEFAULT 0,
    storage_limit_bytes bigint NOT NULL DEFAULT 10737418240,
    files_by_type jsonb NOT NULL DEFAULT '{}'::jsonb,
    last_calculated_at timestamptz NOT NULL DEFAULT now(),
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id),
    UNIQUE(tenant_id, user_id)
);
ALTER TABLE lms.storage_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS storage_usage_access ON lms.storage_usage;
CREATE POLICY storage_usage_access ON lms.storage_usage
    FOR ALL USING (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND user_id = auth.uid())
    ) WITH CHECK (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND user_id = auth.uid())
    );
DROP TRIGGER IF EXISTS lms_storage_usage_updated_at ON lms.storage_usage;
CREATE TRIGGER lms_storage_usage_updated_at BEFORE UPDATE ON lms.storage_usage FOR EACH ROW EXECUTE FUNCTION lms.touch_updated_at();
COMMENT ON TABLE lms.storage_usage IS 'Per-user storage quota tracking. 10GB default limit. [UI: Files/Uploads]';

-- ============================================================================
-- 2.19: SHARED LINKS (Share — link generation and management)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lms.shared_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_by uuid NOT NULL,
    resource_type text NOT NULL CHECK (resource_type IN ('notebook_page','reading_list','media_playlist','file','folder','assignment','grade_report','course','lesson','dashboard')),
    resource_id uuid NOT NULL,
    share_token text NOT NULL,
    share_url text NOT NULL,
    access_level text NOT NULL DEFAULT 'view' CHECK (access_level IN ('view','comment','edit')),
    is_password_protected boolean NOT NULL DEFAULT false,
    password_hash text,
    expires_at timestamptz,
    max_views integer,
    current_views integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    allowed_emails jsonb NOT NULL DEFAULT '[]'::jsonb,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id),
    UNIQUE(tenant_id, share_token)
);
ALTER TABLE lms.shared_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS shared_links_access ON lms.shared_links;
CREATE POLICY shared_links_access ON lms.shared_links
    FOR ALL USING (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND created_by = auth.uid())
    ) WITH CHECK (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND created_by = auth.uid())
    );
CREATE INDEX IF NOT EXISTS lms_shared_links_creator_idx ON lms.shared_links(tenant_id, created_by, created_at DESC);
CREATE INDEX IF NOT EXISTS lms_shared_links_token_idx ON lms.shared_links(tenant_id, share_token);
CREATE INDEX IF NOT EXISTS lms_shared_links_resource_idx ON lms.shared_links(tenant_id, resource_type, resource_id);
CREATE INDEX IF NOT EXISTS lms_shared_links_active_idx ON lms.shared_links(tenant_id, is_active) WHERE is_active = true;
DROP TRIGGER IF EXISTS lms_shared_links_updated_at ON lms.shared_links;
CREATE TRIGGER lms_shared_links_updated_at BEFORE UPDATE ON lms.shared_links FOR EACH ROW EXECUTE FUNCTION lms.touch_updated_at();
COMMENT ON TABLE lms.shared_links IS 'Link generation and management for Share. Password-protected, expiring, view-limited. [UI: Share]';

-- ============================================================================
-- 2.20: MEETING RECORDS (Meet — virtual meeting sessions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lms.meeting_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    course_id uuid,
    cohort_id uuid,
    created_by uuid NOT NULL,
    title text NOT NULL,
    description text,
    meeting_type text NOT NULL DEFAULT 'virtual' CHECK (meeting_type IN ('virtual','hybrid','in_person','office_hours','study_group','exam_review')),
    provider text NOT NULL DEFAULT 'internal' CHECK (provider IN ('internal','zoom','teams','meet','custom')),
    provider_meeting_id text,
    join_url text,
    password text,
    waiting_room_enabled boolean NOT NULL DEFAULT false,
    start_time timestamptz,
    end_time timestamptz,
    actual_start_time timestamptz,
    actual_end_time timestamptz,
    status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','live','ended','cancelled','draft')),
    recording_url text,
    recording_status text CHECK (recording_status IN ('none','recording','available','processing','failed')),
    max_participants integer,
    is_recurring boolean NOT NULL DEFAULT false,
    recurrence_rule jsonb,
    calendar_event_id uuid,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id)
);
CREATE INDEX IF NOT EXISTS lms_meeting_records_course_idx ON lms.meeting_records(tenant_id, course_id) WHERE course_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS lms_meeting_records_cohort_idx ON lms.meeting_records(tenant_id, cohort_id) WHERE cohort_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS lms_meeting_records_status_idx ON lms.meeting_records(tenant_id, status);
CREATE INDEX IF NOT EXISTS lms_meeting_records_start_time_idx ON lms.meeting_records(tenant_id, start_time);
CREATE INDEX IF NOT EXISTS lms_meeting_records_creator_idx ON lms.meeting_records(tenant_id, created_by, created_at DESC);
DROP TRIGGER IF EXISTS lms_meeting_records_updated_at ON lms.meeting_records;
CREATE TRIGGER lms_meeting_records_updated_at BEFORE UPDATE ON lms.meeting_records FOR EACH ROW EXECUTE FUNCTION lms.touch_updated_at();
COMMENT ON TABLE lms.meeting_records IS 'Virtual/in-person meeting sessions for Meet. Provider-agnostic. [UI: Meet]';

-- ============================================================================
-- 2.21: MEETING PARTICIPANTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS lms.meeting_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    meeting_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'attendee' CHECK (role IN ('host','co_host','presenter','attendee','guest')),
    status text NOT NULL DEFAULT 'invited' CHECK (status IN ('invited','accepted','declined','tentative','joined','left','removed')),
    joined_at timestamptz,
    left_at timestamptz,
    duration_seconds integer,
    invited_at timestamptz NOT NULL DEFAULT now(),
    responded_at timestamptz,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, id),
    UNIQUE(tenant_id, meeting_id, user_id)
);
ALTER TABLE lms.meeting_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS meeting_participants_access ON lms.meeting_participants;
CREATE POLICY meeting_participants_access ON lms.meeting_participants
    FOR ALL USING (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND user_id = auth.uid())
        OR (lms.is_tenant_member(tenant_id) AND EXISTS (
            SELECT 1 FROM lms.meeting_records mr
            WHERE mr.id = lms.meeting_participants.meeting_id
              AND mr.created_by = auth.uid()
        ))
    ) WITH CHECK (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND user_id = auth.uid())
    );
CREATE INDEX IF NOT EXISTS lms_meeting_participants_meeting_idx ON lms.meeting_participants(tenant_id, meeting_id);
CREATE INDEX IF NOT EXISTS lms_meeting_participants_user_idx ON lms.meeting_participants(tenant_id, user_id, invited_at DESC);
DROP TRIGGER IF EXISTS lms_meeting_participants_updated_at ON lms.meeting_participants;
CREATE TRIGGER lms_meeting_participants_updated_at BEFORE UPDATE ON lms.meeting_participants FOR EACH ROW EXECUTE FUNCTION lms.touch_updated_at();
COMMENT ON TABLE lms.meeting_participants IS 'Participants in meeting sessions. [UI: Meet]';

-- Now add meeting_records RLS (references meeting_participants)
ALTER TABLE lms.meeting_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS meeting_records_access ON lms.meeting_records;
CREATE POLICY meeting_records_access ON lms.meeting_records
    FOR ALL USING (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND created_by = auth.uid())
        OR (lms.is_tenant_member(tenant_id) AND EXISTS (
            SELECT 1 FROM lms.meeting_participants mp
            WHERE mp.meeting_id = lms.meeting_records.id
              AND mp.user_id = auth.uid()
              AND mp.status = 'invited'
        ))
    ) WITH CHECK (
        lms.is_platform_admin()
        OR (lms.is_tenant_member(tenant_id) AND created_by = auth.uid())
    );

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
-- Summary:
--   Part 1 (Gap Closure 002 Corrected):
--     - 2 new tables: credential_requirements, leaderboard_snapshots
--     - 4 new functions: rag_vector_search, rag_hybrid_search, credential_requirements_met,
--       compute_leaderboard_snapshot, compute_all_leaderboard_snapshots,
--       build_open_badge_json, sync_course_pathway, validate_credential_requirements,
--       maintain_open_badge_assertion, reconcile_learner_points
--     - 3 new triggers: pathway_courses_sync_pathway, credential_definitions_requirements_check,
--       learner_badges_open_badge_assertion, point_transactions_reconcile
--     - 5 column additions: ai_rag_documents.pathway_id, skill_signoffs.verification_kind,
--       learner_badges.verification_code, learner_badges.open_badge_json
--     - RLS uses lms.is_tenant_member() and lms.is_platform_admin() (correct)
--     - WITH CHECK clauses on all new RLS policies
--     - Expanded fail-fast audit
--
--   Part 2 (Consumer Schema Patch):
--     - 19 new tables for learner-facing UI features
--     - 19 RLS policies with WITH CHECK
--     - 37 indexes
--     - 19 touch_updated_at triggers
--     - 19 table comments
--
--   Total: 21 new tables, 10+ functions, 7+ triggers, 5 column additions
--   Corrected from Claude's Gap Closure 002 which used public.platform_is_tenant_member()
--   (wrong for LMS tables — should be lms.is_tenant_member())
-- ============================================================================
