// READ-ONLY inventory of the live Supabase database.
// Zero writes. Zero DDL. Zero drops. Only SELECT against information_schema / pg_catalog.
import { Client } from 'pg';
import { lookup } from 'node:dns';

// Force IPv4 resolution to dodge the IPv6 ECONNREFUSED we hit on direct connection.
(lookup as unknown as { defaults?: any }).defaults = { family: 4, hints: 0 };
const origLookup = lookup;
const v4lookup = (hostname: any, opts: any, cb: any) => {
  if (typeof opts === 'function') { cb = opts; opts = {}; }
  return origLookup(hostname, { ...opts, family: 4 }, cb);
};

// Prefer session pooler (IPv4); fall back to direct connection string.
const connStr = process.env.SUPABASE_SESSION_POOLER || process.env.SUPABASE_DIRECT_CONNECTION;
console.log('Using connection:', connStr ? connStr.replace(/:[^:@]+@/, ':***@') : '(none)');
const client = new Client({ connectionString: connStr, lookup: v4lookup as any });

try {
  await client.connect();
  console.log('=== CONNECTED to live Supabase Postgres ===\n');

  // 1. Does the `lms` schema even exist?
  const schemas = await client.query(
    `SELECT schema_name FROM information_schema.schemata WHERE schema_name IN ('public','lms') ORDER BY schema_name;`
  );
  console.log('1. SCHEMAS present:');
  for (const r of schemas.rows) console.log('   -', r.schema_name);

  // 2. Count of tables in public vs lms
  const counts = await client.query(
    `SELECT table_schema, COUNT(*)::int AS n FROM information_schema.tables
     WHERE table_schema IN ('public','lms') AND table_type='BASE TABLE'
     GROUP BY table_schema ORDER BY table_schema;`
  );
  console.log('\n2. TABLE COUNTS by schema:');
  for (const r of counts.rows) console.log(`   ${r.table_schema}: ${r.n} tables`);

  // 3. Check specific tables the user's inventory claims are MISSING
  const wanted = [
    'credential_requirements','user_ui_preferences','dashboard_layouts','quick_actions',
    'notification_center','conversations','conversation_participants','conversation_messages',
    'notebook_sections','notebook_pages','notebook_templates',
    'reading_progress','reading_lists','reading_list_items',
    'media_playlists','media_playlist_items',
    'file_folders','file_uploads','storage_usage','shared_links',
    'meeting_records','meeting_participants'
  ];
  const found = await client.query(
    `SELECT table_schema, table_name FROM information_schema.tables
     WHERE table_name = ANY($1::text[]) ORDER BY table_name;`,
    [wanted]
  );
  console.log('\n3. CONSUMER-PATCH + credential_requirements table presence:');
  for (const w of wanted) {
    const row = found.rows.find(r => r.table_name === w);
    console.log(`   ${row ? '[OK]' : '[MISSING]'}  ${w}${row ? '  (schema: ' + row.table_schema + ')' : ''}`);
  }

  // 4. RLS status on audit_logs, oauth_states, and a few key LMS tables
  const rls = await client.query(
    `SELECT c.relname, c.relrowsecurity AS rls_on,
            (SELECT COUNT(*) FROM pg_policies p
              WHERE p.schemaname = c.relnamespace::regnamespace::text
                AND p.tablename = c.relname) AS policy_count
     FROM pg_class c
     WHERE c.relkind='r' AND c.relname IN
       ('audit_logs','oauth_states','ai_rag_documents','modules','courses','pathways','enrollments','credential_definitions')
     ORDER BY c.relname;`
  );
  console.log('\n4. RLS status on key tables:');
  for (const r of rls.rows) {
    console.log(`   ${r.rls_on ? '[RLS ON ]' : '[RLS OFF]'}  ${r.relname}  (policies: ${r.policy_count})`);
  }

  // 5. Row counts in the data tables the user mentioned (44 RAG docs / 85 modules / 15 courses / 9 pathways)
  const rowCounts = await client.query(
    `SELECT relname, n_live_tup::int AS live_rows FROM pg_stat_user_tables
     WHERE relname IN ('ai_rag_documents','modules','courses','pathways','enrollments','lessons','content_blocks')
     ORDER BY relname;`
  );
  console.log('\n5. ROW COUNTS (live data) in core LMS tables:');
  for (const r of rowCounts.rows) console.log(`   ${r.relname}: ${r.live_rows} rows`);

  // 6. What LMS tables currently live in public (that the design says should be in lms)
  const misplaced = await client.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema='public' AND table_type='BASE TABLE'
       AND table_name IN (
       'pathways','programs','courses','modules','lessons','content_blocks','prerequisites',
       'enrollments','cohorts','cohort_members','delivery_modes','pacing_schedules','live_sessions',
       'ai_teaching_sessions','ai_interaction_logs','ai_personalization_state','ai_escalations',
       'lesson_progress','module_progress','course_completions','clock_hour_ledger',
       'quizzes','question_bank','rubrics','submissions','retake_policies','ai_competency_assessments',
       'skill_domains','skills','course_skill_targets','skill_signoffs','skill_progress',
       'credentials','credential_definitions','credential_definition_skills','verification_codes',
       'support_referrals','safety_incidents','workforce_outcomes','benefits_cliff_coaching','navigator_caseload',
       'announcements','notification_preferences','notification_delivery_log','live_session_reminders',
       'audit_logs','oauth_states','platform_audit_log','minor_consent_guardrails',
       'conversion_records','free_license_grants','commerce_branches_links',
       'ai_rag_documents','ai_rag_chunks','leaderboards','program_tracks'
     ) ORDER BY table_name;`
  );
  console.log(`\n6. LMS-domain tables currently in PUBLIC (should be in lms.): ${misplaced.rows.length} found`);
  for (const r of misplaced.rows) console.log(`   public.${r.table_name}`);

  await client.end();
  console.log('\n=== DISCONNECTED. Inventory complete. ===');
} catch (e) {
  console.error('INVENTORY FAILED:', e.message);
  process.exit(1);
}
