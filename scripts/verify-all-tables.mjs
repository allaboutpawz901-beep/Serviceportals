import pg from 'pg';
const { Client } = pg;

async function verify() {
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

  try {
    await client.connect();

    // 1. Schemas overview
    const schemaRes = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schema_name;
    `);
    console.log('=== SCHEMAS FOUND ===');
    console.log(schemaRes.rows.map(r => r.schema_name).join(', '));

    // 2. All tables per schema
    const tablesRes = await client.query(`
      SELECT table_schema, table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY table_schema, table_name;
    `);

    console.log(`\n=== TOTAL TABLES/VIEWS IN DATABASE: ${tablesRes.rows.length} ===`);
    
    const bySchema = {};
    for (const row of tablesRes.rows) {
      if (!bySchema[row.table_schema]) bySchema[row.table_schema] = [];
      bySchema[row.table_schema].push(row.table_name);
    }

    for (const [schema, tbls] of Object.entries(bySchema)) {
      console.log(`\nSchema [${schema}] -> ${tbls.length} tables/views:`);
      console.log(tbls.join(', '));
    }

    // 3. Foreign key constraints count
    const fkRes = await client.query(`
      SELECT count(*) as total_fks
      FROM information_schema.table_constraints
      WHERE constraint_type = 'FOREIGN KEY'
      AND table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast');
    `);
    console.log(`\n=== TOTAL FOREIGN KEYS: ${fkRes.rows[0].total_fks} ===`);

    // 4. RLS status check
    const rlsRes = await client.query(`
      SELECT schemaname, tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schemaname, tablename;
    `);
    const rlsEnabled = rlsRes.rows.filter(r => r.rowsecurity).length;
    const rlsDisabled = rlsRes.rows.filter(r => !r.rowsecurity).length;
    console.log(`\n=== RLS STATUS: ${rlsEnabled} enabled, ${rlsDisabled} disabled across ${rlsRes.rows.length} base tables ===`);

  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    await client.end();
  }
}

verify();
