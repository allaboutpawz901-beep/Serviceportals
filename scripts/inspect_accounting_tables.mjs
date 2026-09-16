import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://qdgfkxbkqcnuhckhvhzd.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function inspectAccountingTables() {
  const url = `${supabaseUrl}/rest/v1/?apikey=${serviceKey}`;
  const res = await fetch(url, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`
    }
  });
  
  const schema = await res.json();
  const definitions = schema.definitions || {};
  
  const targetKeywords = [
    "account", "journal", "ledger", "transaction", "sale", "invoice", "payment",
    "deposit", "refund", "dispute", "gift", "credit", "register", "purchase",
    "bill", "supplier", "vendor", "bank", "payout", "reconcil", "payroll",
    "tax", "trial_balance", "profit", "balance_sheet", "stripe", "estimate",
    "statement", "receipt", "order", "cash", "coupon", "discount"
  ];
  
  const matchingTables = Object.keys(definitions).filter(tableName => 
    targetKeywords.some(kw => tableName.toLowerCase().includes(kw))
  );
  
  console.log(`Found ${matchingTables.length} matching accounting/financial tables:`);
  
  const tableDetails = {};
  for (const t of matchingTables.sort()) {
    const props = definitions[t].properties || {};
    const cols = Object.keys(props);
    
    // Check row count from live DB
    let rowCount = 0;
    let queryError = null;
    try {
      const { count, error } = await supabase.from(t).select("*", { count: "exact", head: true });
      if (error) queryError = error.message;
      else rowCount = count || 0;
    } catch (e) {
      queryError = e.message;
    }
    
    tableDetails[t] = {
      columns: cols,
      rowCount,
      error: queryError
    };
  }
  
  console.log(JSON.stringify(tableDetails, null, 2));
}

inspectAccountingTables().catch(console.error);
