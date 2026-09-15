import pg from 'pg';
const { Client } = pg;

async function inspect() {
  const client = new Client({
    connectionString: process.env.SUPABSE_SESSION_POOLER || process.env.SUPABSE_DIRECT_CONNECTION,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Existing tables:', tables.rows.map(r => r.table_name));

    for (const row of tables.rows) {
      const cols = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
      `, [row.table_name]);
      console.log(`Columns for ${row.table_name}:`, cols.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

inspect();
