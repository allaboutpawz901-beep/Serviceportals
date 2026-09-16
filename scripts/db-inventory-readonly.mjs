// READ-ONLY inventory of the live Supabase Postgres — no DDL, no writes.
import pg from 'pg';
import fs from 'fs';

const env = fs.readFileSync('/home/z/my-project/.env', 'utf8');
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, 'm')) || [])[1]?.trim();

const candidates = ['SUPABASE_SESSION_POOLER', 'SUPABASE_DIRECT_CONNECTION', 'DATABASE_URL'].map(get).filter(Boolean);
if (!candidates.length) { console.error('NO CONNECTION STRING FOUND'); process.exit(1); }

let client = null;
for (const cs of candidates) {
  try {
    const c = new pg.Client({ connectionString: cs, ssl: { rejectUnauthorized: false } });
    await c.connect();
    console.error(`Connected via: ${cs.split('@')[1]?.split('/')[0] || 'pooler'}`);
    client = c;
    break;
  } catch (e) { console.error(`Failed via ${cs.split('@')[1]?.split('/')[0]}: ${e.message}`); }
}
if (!client) { console.error('ALL CONNECTIONS FAILED'); process.exit(1); }

const q = async (sql, label) => {
  try {
    const r = await client.query(sql);
    console.log(`\n=== ${label} ===`);
    console.table(r.rows);
    return r.rows;
  } catch (e) { console.log(`\n=== ${label} === ERROR: ${e.message}`); return []; }
};

// 1. Which schemas exist?
await q(`SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog','information_schema','pg_toast') ORDER BY 1`, 'SCHEMAS IN DB');

// 2. LMS-ish tables by schema (the 13-domain table names we care about)
await q(`
  SELECT table_schema, count(*) AS table_count,
         string_agg(table_name, ', ' ORDER BY table_name) FILTER (WHERE table_name IN
           ('courses','modules','pathways','lessons','enrollments','credential_requirements','user_ui_preferences','dashboard_layouts','notification_center','conversations','notebook_pages','reading_lists','media_playlists','file_uploads','meeting_records','audit_logs','oauth_states','clock_hour_ledger','skill_signoffs','ai_rag_documents','conversion_records','free_license_grants')) AS key_tables_present
  FROM information_schema.tables
  WHERE table_schema IN ('public','lms') AND table_type='BASE TABLE'
  GROUP BY table_schema ORDER BY 1`, 'TABLE COUNTS PER SCHEMA (public vs lms)');

// 3. Do the key tables live in public or lms?
await q(`
  SELECT table_name, table_schema FROM information_schema.tables
  WHERE table_name IN ('courses','modules','pathways','lessons','enrollments','credential_requirements','user_ui_preferences','dashboard_layouts','notification_center','conversations','notebook_pages','notebook_sections','notebook_templates','reading_progress','reading_lists','reading_list_items','media_playlists','media_playlist_items','file_folders','file_uploads','storage_usage','shared_links','meeting_records','meeting_participants','quick_actions','conversation_participants','conversation_messages','audit_logs','oauth_states')
  ORDER BY table_name, table_schema`, 'KEY TABLE LOCATION (public vs lms)');

// 4. RLS status on audit_logs + oauth_states
await q(`
  SELECT schemaname, tablename, rowsecurity FROM pg_tables
  WHERE tablename IN ('audit_logs','oauth_states')`, 'RLS STATUS: audit_logs / oauth_states');

// 5. Row counts (data preservation check)
const counts = [
  ['courses','public'],['modules','public'],['pathways','public'],['ai_rag_documents','public'],
  ['enrollments','public'],['clock_hour_ledger','public'],['skill_signoffs','public'],['conversion_records','public']
];
for (const [t, s] of counts) {
  try {
    const r = await client.query(`SELECT count(*)::int AS n FROM ${s}.${t}`);
    console.log(`${s}.${t}: ${r.rows[0].n} rows`);
  } catch (e) { console.log(`${s}.${t}: ERROR ${e.message}`); }
}

// 6. Column model check (the audit claims functions use wrong columns)
await q(`
  SELECT table_name, column_name FROM information_schema.columns
  WHERE table_schema='public' AND table_name IN ('clock_hour_ledger','course_completions','module_progress')
    AND column_name IN ('hours_earned','computed_minutes','verified_minutes','completion_status','is_passed','completed_at','completion_percentage','progress_percentage','status')
  ORDER BY table_name, column_name`, 'LIVE COLUMN MODEL (clock_hour_ledger / course_completions / module_progress)');

await client.end();
console.log('\nDONE — read-only, no changes made.');
