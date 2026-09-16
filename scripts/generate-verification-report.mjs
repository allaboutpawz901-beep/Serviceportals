import pg from 'pg';
const { Client } = pg;

async function audit() {
  const connectionString = 
    process.env.SUPABSE_SESSION_POOLER || 
    process.env.SUPABASE_SESSION_POOLER || 
    process.env.SUPABSE_DIRECT_CONNECTION || 
    process.env.SUPABASE_DIRECT_CONNECTION || 
    process.env.DATABASE_URL;

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  // 1. Table Counts by schema & type
  const countsRes = await client.query(`
    SELECT table_schema, table_type, count(*) as count
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
    GROUP BY table_schema, table_type
    ORDER BY table_schema, table_type;
  `);

  console.log('=== TABLE & VIEW COUNTS BY SCHEMA ===');
  console.table(countsRes.rows);

  const totalBaseTables = await client.query(`
    SELECT count(*) as total_base_tables
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      AND table_type = 'BASE TABLE';
  `);
  console.log(`TOTAL BASE TABLES: ${totalBaseTables.rows[0].total_base_tables}`);

  const totalViews = await client.query(`
    SELECT count(*) as total_views
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      AND table_type = 'VIEW';
  `);
  console.log(`TOTAL VIEWS: ${totalViews.rows[0].total_views}`);

  // 2. Foreign Keys
  const fkRes = await client.query(`
    SELECT count(*) as total_fks
    FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
      AND table_schema IN ('public', 'lms');
  `);
  console.log(`TOTAL FOREIGN KEY CONSTRAINTS (public + lms): ${fkRes.rows[0].total_fks}`);

  // 3. RLS Security Status
  const rlsRes = await client.query(`
    SELECT schemaname, 
           count(*) as total_tables,
           count(*) FILTER (WHERE rowsecurity = true) as rls_enabled,
           count(*) FILTER (WHERE rowsecurity = false) as rls_disabled
    FROM pg_tables
    WHERE schemaname IN ('public', 'lms')
    GROUP BY schemaname;
  `);
  console.log('\n=== ROW LEVEL SECURITY (RLS) AUDIT ===');
  console.table(rlsRes.rows);

  // 4. Domains summary in public
  const domainPrefixes = [
    { domain: 'CRM (Customer & Pet Relationship)', prefix: 'crm_' },
    { domain: 'ERP (Inventory & Fulfillment)', prefix: 'erp_' },
    { domain: 'Accounting & Financials', prefix: 'acct_' },
    { domain: 'Commerce, POS & Subscriptions', prefix: 'commerce_' },
    { domain: 'CMS & Website', prefix: 'cms_' },
    { domain: 'Platform & Tenancy Core', prefix: 'platform_' },
    { domain: 'LMS (Learning Management System)', schema: 'lms' }
  ];

  console.log('\n=== DOMAIN BREAKDOWN ===');
  for (const d of domainPrefixes) {
    if (d.schema) {
      const res = await client.query(`
        SELECT count(*) as count FROM information_schema.tables WHERE table_schema = $1 AND table_type = 'BASE TABLE'
      `, [d.schema]);
      console.log(`- ${d.domain}: ${res.rows[0].count} tables in [${d.schema}] schema`);
    } else {
      const res = await client.query(`
        SELECT count(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE $1 AND table_type = 'BASE TABLE'
      `, [`${d.prefix}%`]);
      console.log(`- ${d.domain}: ${res.rows[0].count} tables in [public] schema`);
    }
  }

  await client.end();
}

audit();
