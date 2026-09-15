import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const supabaseUrl = process.env.SUPABASE_URL || "https://qdgfkxbkqcnuhckhvhzd.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function runAudit() {
  const url = `${supabaseUrl}/rest/v1/?apikey=${serviceKey}`;
  const res = await fetch(url, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`
    }
  });
  
  const schema = await res.json();
  const definitions = schema.definitions || {};
  const paths = schema.paths || {};

  const allTables = Object.keys(definitions);
  console.log(`Total live tables in Supabase: ${allTables.length}`);

  // Fetch row counts in concurrency batches of 15
  const results = {};
  const batchSize = 15;
  for (let i = 0; i < allTables.length; i += batchSize) {
    const batch = allTables.slice(i, i + batchSize);
    await Promise.all(batch.map(async (tableName) => {
      const props = definitions[tableName]?.properties || {};
      const required = definitions[tableName]?.required || [];
      const columns = Object.keys(props).map(col => ({
        name: col,
        type: props[col].type,
        format: props[col].format,
        description: props[col].description
      }));

      try {
        const { count, error } = await supabase.from(tableName).select("*", { count: "exact", head: true });
        results[tableName] = {
          existsOnRemote: true,
          columns,
          required,
          rowCount: error ? 0 : (count ?? 0),
          error: error ? error.message : null
        };
      } catch (err) {
        results[tableName] = {
          existsOnRemote: true,
          columns,
          required,
          rowCount: 0,
          error: err.message
        };
      }
    }));
  }

  const rpcs = Object.keys(paths).filter(p => p.startsWith("/rpc/")).map(p => p.replace("/rpc/", ""));

  const auditReport = {
    supabaseUrl,
    totalTables: allTables.length,
    rpcs,
    tables: results
  };

  fs.writeFileSync("docs/live_supabase_schema.json", JSON.stringify(auditReport, null, 2));
  console.log("Wrote docs/live_supabase_schema.json successfully.");
}

runAudit().catch(console.error);
