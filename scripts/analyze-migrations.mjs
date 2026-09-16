import fs from 'fs';
import path from 'path';
import pg from 'pg';
const { Client } = pg;

const migrationsDir = path.resolve('supabase/migrations');
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

console.log(`Found ${files.length} SQL migration files in ${migrationsDir}:`);

const tableRegex = /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+([a-zA-Z0-9_."]+)/gi;

const allExtracted = new Map();

for (const file of files) {
  const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  let match;
  const tablesInFile = new Set();
  while ((match = tableRegex.exec(content)) !== null) {
    let raw = match[1].replace(/"/g, '');
    let schema = 'public';
    let table = raw;
    if (raw.includes('.')) {
      const parts = raw.split('.');
      schema = parts[0];
      table = parts[1];
    }
    const full = `${schema}.${table}`;
    tablesInFile.add(full);
    if (!allExtracted.has(full)) {
      allExtracted.set(full, []);
    }
    allExtracted.get(full).push(file);
  }
  console.log(`\n- ${file}: ${tablesInFile.size} table declarations`);
}

console.log(`\n========================================`);
console.log(`TOTAL UNIQUE TABLES DEFINED IN SQL FILES: ${allExtracted.size}`);
console.log(`========================================`);

// Let's connect to database and compare
async function checkAgainstRemote() {
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
    const res = await client.query(`
      SELECT table_schema || '.' || table_name as full_name
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast');
    `);
    const remoteTables = new Set(res.rows.map(r => r.full_name));

    console.log(`\nRemote database has ${remoteTables.size} tables/views.`);

    const missingOnRemote = [];
    const presentOnRemote = [];

    for (const [full, sourceFiles] of allExtracted.entries()) {
      if (remoteTables.has(full)) {
        presentOnRemote.push(full);
      } else {
        missingOnRemote.push({ table: full, sourceFiles });
      }
    }

    console.log(`\nSummary:`);
    console.log(`- Tables present on Remote DB: ${presentOnRemote.length}`);
    console.log(`- Tables defined in migrations but not yet on Remote DB: ${missingOnRemote.length}`);

    if (missingOnRemote.length > 0) {
      console.log(`\nMissing tables count by schema:`);
      const missingBySchema = {};
      for (const item of missingOnRemote) {
        const schema = item.table.split('.')[0];
        missingBySchema[schema] = (missingBySchema[schema] || 0) + 1;
      }
      console.table(missingBySchema);
      console.log(`\nFirst 20 missing tables:`, missingOnRemote.slice(0, 20).map(m => m.table));
    }
  } catch (err) {
    console.error('Remote check error:', err);
  } finally {
    await client.end();
  }
}

checkAgainstRemote();
