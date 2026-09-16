import https from "node:https";

const supabaseUrl = process.env.SUPABASE_URL || "https://qdgfkxbkqcnuhckhvhzd.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;

console.log("Auditing Remote Supabase instance:", supabaseUrl);

async function fetchOpenApi() {
  const url = `${supabaseUrl}/rest/v1/?apikey=${serviceKey}`;
  const res = await fetch(url, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`
    }
  });
  
  if (!res.ok) {
    console.error("Failed to fetch OpenAPI spec:", res.status, res.statusText);
    const text = await res.text();
    console.error(text);
    return;
  }
  
  const schema = await res.json();
  console.log("=== SUPABASE REMOTE LIVE SCHEMA AUDIT ===");
  console.log("OpenAPI Title:", schema.info?.title, "Version:", schema.info?.version);
  
  const definitions = schema.definitions || schema.components?.schemas || {};
  const paths = schema.paths || {};
  
  const tables = Object.keys(definitions);
  console.log(`\nFound ${tables.length} live remote tables/views in Supabase schema:`);
  tables.sort().forEach((t, i) => {
    const fields = Object.keys(definitions[t].properties || {}).length;
    console.log(`  ${(i + 1).toString().padStart(2, ' ')}. ${t} (${fields} columns)`);
  });
  
  // List RPC functions
  const rpcs = Object.keys(paths).filter(p => p.startsWith("/rpc/"));
  console.log(`\nFound ${rpcs.length} remote RPC functions:`);
  rpcs.forEach(r => console.log(`  - ${r}`));

  return { tables, definitions, paths, rpcs };
}

fetchOpenApi().catch(console.error);
