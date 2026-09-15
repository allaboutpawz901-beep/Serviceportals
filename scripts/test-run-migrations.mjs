import fs from 'fs';
import path from 'path';
import pg from 'pg';
const { Client } = pg;

const migrationsDir = path.resolve('supabase/migrations');

const connectionString = 
  process.env.SUPABSE_SESSION_POOLER || 
  process.env.SUPABASE_SESSION_POOLER || 
  process.env.SUPABSE_DIRECT_CONNECTION || 
  process.env.SUPABASE_DIRECT_CONNECTION || 
  process.env.DATABASE_URL;

async function testMigrations() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected to Supabase PostgreSQL.');

  const migrationFiles = [
    'ALL ABOUT PAWZ_schema_fixed.sql',
    'ALL ABOUT PAWZ RAG Tables + Catalog Seed Data .sql',
    'ALL ABOUT PAWZ LMS Schemalive.sql',
    'ALL ABOUT PAWZ— Gap Closure Migration 001LIVE.sql',
    'All About Pawz_schema_patch_LIVE.sql',
    'ALL ABOUT PAWZ — Migration 002 (index cleanup + constraint validation)LIVE.sql'
  ];

  for (const filename of migrationFiles) {
    const filePath = path.join(migrationsDir, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`[SKIP] File not found: ${filename}`);
      continue;
    }

    console.log(`\n========================================`);
    console.log(`Testing Execution: ${filename}`);
    console.log(`========================================`);

    const sql = fs.readFileSync(filePath, 'utf8');

    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log(`[SUCCESS] ${filename} applied without error!`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`[ERROR in ${filename}]:`, err.message);
      if (err.detail) console.error('Detail:', err.detail);
      if (err.hint) console.error('Hint:', err.hint);
      if (err.position) {
        const pos = parseInt(err.position, 10);
        const snippet = sql.substring(Math.max(0, pos - 150), Math.min(sql.length, pos + 150));
        console.error(`Around position ${pos}:\n...${snippet}...`);
      }
    }
  }

  await client.end();
}

testMigrations();
