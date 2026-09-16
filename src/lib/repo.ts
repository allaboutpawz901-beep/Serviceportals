// ---------------------------------------------------------------------------
// Repository — Supabase ONLY.
//   All reads/writes go to Supabase (Postgres via PostgREST API + JS Client).
// ---------------------------------------------------------------------------

export type Row = Record<string, any>;

export type CmsResource =
  | "services" | "products" | "gallery" | "packages" | "addons"
  | "faqs" | "policies" | "testimonials" | "bookings" | "consultations" | "messages"
  | "orders" | "order_items" | "customers" | "dogs" | "activity_log" | "dog_breeds"
  | "staff" | "haircut_styles"
  | "coat_types" | "coat_textures" | "coat_lengths" | "coat_conditions" | "shedding_levels"
  | "clip_lengths" | "body_styles" | "leg_styles" | "face_styles" | "head_styles"
  | "ear_styles" | "tail_styles" | "feet_styles"
  | "sanitary_options" | "nail_services" | "paw_pad_services" | "ear_services"
  | "teeth_services" | "deshedding_services" | "coat_techniques"
  | "dog_grooming_profiles" | "appointment_grooming_requests"
  | "payments" | "blocked_times" | "availability" | "service_pricing"
  | "invoices" | "invoice_items" | "email_messages" | "communications"
  | "product_reviews"
  | "pet_product_categories" | "pet_product_filters" | "pet_product_filter_values" | "pet_category_filters"
  | "serviceItems";

const TABLE: Record<CmsResource, string> = {
  services: "services",
  products: "products",
  gallery: "gallery_photos",
  packages: "pricing_packages",
  addons: "add_ons",
  faqs: "faqs",
  policies: "policies",
  testimonials: "testimonials",
  bookings: "bookings",
  consultations: "consultations",
  messages: "contact_messages",
  orders: "orders",
  order_items: "order_items",
  customers: "customers",
  dogs: "dogs",
  activity_log: "activity_log",
  dog_breeds: "dog_breeds",
  staff: "staff",
  haircut_styles: "haircut_styles",
  coat_types: "coat_types",
  coat_textures: "coat_textures",
  coat_lengths: "coat_lengths",
  coat_conditions: "coat_conditions",
  shedding_levels: "shedding_levels",
  clip_lengths: "clip_lengths",
  body_styles: "body_styles",
  leg_styles: "leg_styles",
  face_styles: "face_styles",
  head_styles: "head_styles",
  ear_styles: "ear_styles",
  tail_styles: "tail_styles",
  feet_styles: "feet_styles",
  sanitary_options: "sanitary_options",
  nail_services: "nail_services",
  paw_pad_services: "paw_pad_services",
  ear_services: "ear_services",
  teeth_services: "teeth_services",
  deshedding_services: "deshedding_services",
  coat_techniques: "coat_techniques",
  dog_grooming_profiles: "dog_grooming_profiles",
  appointment_grooming_requests: "appointment_grooming_requests",
  payments: "payments",
  blocked_times: "blocked_times",
  availability: "availability",
  service_pricing: "service_pricing",
  invoices: "invoices",
  invoice_items: "invoice_items",
  email_messages: "email_messages",
  communications: "communications",
  product_reviews: "product_reviews",
  pet_product_categories: "pet_product_categories",
  pet_product_filters: "pet_product_filters",
  pet_product_filter_values: "pet_product_filter_values",
  pet_category_filters: "pet_category_filters",
  serviceItems: "service_items",
};

const ORDERED = new Set<CmsResource>([
  "services", "products", "gallery", "packages", "addons", "faqs", "policies", "testimonials", "serviceItems",
]);

const isPlaceholder = (v: string | undefined) =>
  !v || v.startsWith("your-") || v.includes("your-project") || v.startsWith("sk_live_or_test");

const SB_URL = isPlaceholder(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_SUPABASE_URL)
  ? undefined
  : (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_SUPABASE_URL)?.replace(/\/$/, "");

const SB_KEY = isPlaceholder(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_SUPABASE_ANON_KEY)
  ? undefined
  : (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_SUPABASE_ANON_KEY);

export const supabaseReady = !!(SB_URL && SB_KEY);
export const supabaseConfig = { url: SB_URL, key: SB_KEY };

// ---- Supabase REST helper ----
async function sb<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  if (!SB_URL || !SB_KEY) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => res.statusText);
    throw new Error(`Supabase ${res.status}: ${t}`);
  }
  if (res.status === 204) return null as T;
  const txt = await res.text();
  return (txt ? JSON.parse(txt) : null) as T;
}

export type Repo = {
  list(resource: CmsResource): Promise<Row[]>;
  get(resource: CmsResource, id: string): Promise<Row | null>;
  create(resource: CmsResource, data: Row): Promise<Row>;
  update(resource: CmsResource, id: string, data: Row): Promise<Row>;
  remove(resource: CmsResource, id: string): Promise<{ ok: boolean }>;
  stats(): Promise<any>;
  getSettings(): Promise<Record<string, string>>;
  saveSettings(obj: Record<string, string>): Promise<void>;
};

export const repo: Repo = {
  async list(r) {
    if (!supabaseReady) return [];
    const t = TABLE[r] || r;
    const order = ORDERED.has(r) ? "order.asc" : "createdAt.desc";
    try {
      const rows = await sb<Row[]>(`${t}?order=${order}`);
      return rows || [];
    } catch {
      // Fallback without order if table doesn't have createdAt / order
      try {
        const rows = await sb<Row[]>(`${t}`);
        return rows || [];
      } catch {
        return [];
      }
    }
  },
  async get(r, id) {
    if (!supabaseReady) return null;
    const t = TABLE[r] || r;
    try {
      const rows = await sb<Row[]>(`${t}?id=eq.${encodeURIComponent(id)}&limit=1`);
      return (rows && rows[0]) || null;
    } catch {
      return null;
    }
  },
  async create(r, data) {
    const t = TABLE[r] || r;
    const rows = await sb<Row[]>(t, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(stripNulls(data)),
    });
    return (rows && rows[0]) || data;
  },
  async update(r, id, data) {
    const t = TABLE[r] || r;
    const rows = await sb<Row[]>(`${t}?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(stripNulls(data)),
    });
    return (rows && rows[0]) || data;
  },
  async remove(r, id) {
    const t = TABLE[r] || r;
    await sb(`${t}?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
    return { ok: true };
  },
  async stats() {
    if (!supabaseReady) return { counts: {}, pendingBookings: 0, recentBookings: [] };
    try {
      const [bookings, customers, dogs, payments] = await Promise.all([
        sb<Row[]>("bookings?select=*&order=createdAt.desc&limit=50").catch(() => []),
        sb<Row[]>("customers?select=id").catch(() => []),
        sb<Row[]>("dogs?select=id").catch(() => []),
        sb<Row[]>("payments?select=*").catch(() => []),
      ]);
      const bList = bookings || [];
      return {
        counts: {
          bookings: bList.length,
          customers: (customers || []).length,
          dogs: (dogs || []).length,
          payments: (payments || []).length,
        },
        pendingBookings: bList.filter((x) => x.status === "PAYMENT_PENDING" || x.status === "PENDING").length,
        recentBookings: bList.slice(0, 10),
      };
    } catch {
      return { counts: {}, pendingBookings: 0, recentBookings: [] };
    }
  },
  async getSettings() {
    if (!supabaseReady) return {};
    try {
      const rows = await sb<Row[]>("site_settings?select=key,value");
      const obj: Record<string, string> = {};
      for (const r of rows || []) obj[r.key] = r.value;
      return obj;
    } catch {
      return {};
    }
  },
  async saveSettings(obj) {
    for (const [key, value] of Object.entries(obj)) {
      await sb("site_settings", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({ key, value: String(value) }),
      });
    }
  },
};

function stripNulls(data: Row): Row {
  const out: Row = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) out[k] = v === null ? undefined : v;
  }
  return out;
}
