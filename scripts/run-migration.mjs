import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

async function run() {
  const connectionString = 
    process.env.SUPABSE_SESSION_POOLER || 
    process.env.SUPABASE_SESSION_POOLER || 
    process.env.SUPABSE_DIRECT_CONNECTION || 
    process.env.SUPABASE_DIRECT_CONNECTION || 
    process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('Error: No Supabase connection string found in environment variables.');
    console.error('Please ensure SUPABASE_SESSION_POOLER or SUPABSE_DIRECT_CONNECTION is set.');
    process.exit(1);
  }

  const migrationsDir = path.resolve(__dirname, '../supabase/migrations');
  
  const migrationFiles = [
    'ALL ABOUT PAWZ_schema_fixed.sql',
    'ALL ABOUT PAWZ RAG Tables + Catalog Seed Data .sql',
    'ALL ABOUT PAWZ LMS Schemalive.sql',
    'ALL ABOUT PAWZ— Gap Closure Migration 001LIVE.sql',
    'All About Pawz_schema_patch_LIVE.sql',
    'ALL ABOUT PAWZ — Migration 002 (index cleanup + constraint validation)LIVE.sql'
  ];

  console.log('Connecting to Supabase PostgreSQL database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to remote Supabase instance successfully.');

    for (const file of migrationFiles) {
      const fullPath = path.join(migrationsDir, file);
      if (!fs.existsSync(fullPath)) {
        console.warn(`[WARNING] Migration file not found: ${file}`);
        continue;
      }
      console.log(`\n--> Applying: ${file}...`);
      const sql = fs.readFileSync(fullPath, 'utf8');
      await client.query(sql);
      console.log(`[PASSED] ${file}`);
    }

    console.log('\n========================================');
    console.log('ALL MIGRATIONS APPLIED SUCCESSFULLY!');
    console.log('========================================');

    // Run verification
    const resPublic = await client.query(`
      SELECT count(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);
    const resLMS = await client.query(`
      SELECT count(*) as count FROM information_schema.tables 
      WHERE table_schema = 'lms' AND table_type = 'BASE TABLE';
    `);
    const resFK = await client.query(`
      SELECT count(*) as count FROM information_schema.table_constraints 
      WHERE constraint_type = 'FOREIGN KEY' AND table_schema IN ('public', 'lms');
    `);

    console.log(`\nDatabase Verification Summary:`);
    console.log(`- Public Base Tables: ${resPublic.rows[0].count}`);
    console.log(`- LMS Base Tables: ${resLMS.rows[0].count}`);
    console.log(`- Verified Foreign Keys: ${resFK.rows[0].count}`);

  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
