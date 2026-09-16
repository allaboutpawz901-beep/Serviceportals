import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";

const SB_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "")?.replace(/\/$/, "");
const SB_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

function getSupabaseAdmin() {
  if (!SB_URL || !SB_SERVICE_KEY) return null;
  return createClient(SB_URL, SB_SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function getPgClient() {
  const cs = process.env.SUPABASE_SESSION_POOLER || process.env.SUPABASE_DIRECT_CONNECTION;
  if (!cs) return null;
  const client = new pg.Client({ connectionString: cs, ssl: { rejectUnauthorized: false } });
  await client.connect();
  return client;
}

export async function GET(req: NextRequest) {
  try {
    const pgClient = await getPgClient();
    if (!pgClient) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const membersRes = await pgClient.query(`
      SELECT tm.id, tm.tenant_id, tm.user_id, tm.role, tm.active, tm.status, tm.created_at, tm.last_active_at, tm.mfa_enabled,
             u.email,
             s.name as staff_name, s.avatar as staff_avatar,
             cs.display_name as crm_name
      FROM public.tenant_memberships tm
      LEFT JOIN auth.users u ON tm.user_id::text = u.id::text
      LEFT JOIN public.staff s ON tm.user_id::text = s."userId"::text
      LEFT JOIN public.crm_staff cs ON tm.user_id::text = cs.user_id::text
      ORDER BY tm.created_at DESC;
    `);

    const portalRes = await pgClient.query(`
      SELECT pca.id, pca.tenant_id, pca.customer_id, pca.auth_user_id, pca.status, pca.created_at, pca.last_login_at,
             c."firstName", c."lastName", c.email, c.phone
      FROM public.portal_customer_accounts pca
      LEFT JOIN public.customers c ON pca.customer_id::text = c.id::text
      ORDER BY pca.created_at DESC;
    `);

    let rolesRes = { rows: [] };
    try {
      rolesRes = await pgClient.query(`SELECT * FROM public.role_definitions ORDER BY created_at ASC;`);
    } catch { /* table may not exist yet */ }

    await pgClient.end();

    const adminsAndStaff = membersRes.rows.map((r: any) => {
      const name = r.crm_name || r.staff_name || (r.email ? r.email.split("@")[0] : "User");
      const initials = name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
      return {
        id: r.id, userId: r.user_id, email: r.email || "No email", name, role: r.role,
        twoFactorEnabled: !!r.mfa_enabled,
        status: r.status === "active" ? "Active" : r.status === "invited" ? "Invited" : "Suspended",
        lastActive: r.last_active_at ? new Date(r.last_active_at).toLocaleString() : "Recently",
        avatarInitials: initials,
        scope: ["owner", "admin", "manager"].includes(r.role) ? "admin" : "employee",
      };
    });

    const customers = portalRes.rows.map((r: any) => {
      const name = `${r.firstName || ""} ${r.lastName || ""}`.trim() || r.email || "Customer";
      const initials = name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
      return {
        id: r.id, userId: r.auth_user_id, customerId: r.customer_id, email: r.email || "No email",
        name, phone: r.phone || "", role: "customer", twoFactorEnabled: false,
        status: r.status === "active" ? "Active" : "Invited",
        lastActive: r.last_login_at ? new Date(r.last_login_at).toLocaleString() : "Never",
        avatarInitials: initials, scope: "customer",
      };
    });

    return NextResponse.json({
      admins: adminsAndStaff.filter((u: any) => u.scope === "admin"),
      staff: adminsAndStaff.filter((u: any) => u.scope === "employee"),
      customers, roles: rolesRes.rows,
    });
  } catch (err: any) {
    console.error("[GET /api/admin/users]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role, scope, phone, tenantId, enforce2FA } = body;
    if (!email || !role) return NextResponse.json({ error: "Email and Role required" }, { status: 400 });

    const targetTenant = tenantId || "00000000-0000-0000-0000-000000000001";
    const supabaseAdmin = getSupabaseAdmin();
    const pgClient = await getPgClient();
    if (!pgClient) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    let authUserId: string | null = null;
    if (supabaseAdmin) {
      const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
      const found = existing?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (found) authUserId = found.id;
      else {
        const userPassword = password || `PawzTemp#${Math.random().toString(36).substring(2, 8)}!`;
        const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
          email, password: userPassword, email_confirm: true, user_metadata: { full_name: name, role, scope },
        });
        if (!error && newUser?.user) authUserId = newUser.user.id;
      }
    }
    if (!authUserId) {
      const dbUser = await pgClient.query("SELECT id::text FROM auth.users WHERE email = $1 LIMIT 1", [email]);
      if (dbUser.rows.length > 0) authUserId = dbUser.rows[0].id;
      else authUserId = (await pgClient.query("SELECT gen_random_uuid()::text as id")).rows[0].id;
    }

    const targetScope = scope || (["owner", "admin", "manager"].includes(role) ? "admin" : role === "customer" ? "customer" : "employee");

    if (targetScope === "admin" || targetScope === "employee") {
      const validRole = ["owner", "admin", "manager", "staff", "viewer", "groomer", "front_desk"].includes(role) ? role : "staff";
      await pgClient.query(`INSERT INTO public.tenant_memberships (id, tenant_id, user_id, role, active, status, mfa_enabled, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, true, 'active', $4, NOW(), NOW()) ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = EXCLUDED.role, status = 'active', mfa_enabled = EXCLUDED.mfa_enabled, updated_at = NOW();`, [targetTenant, authUserId, validRole, !!enforce2FA]);
      await pgClient.query(`INSERT INTO public.staff (id, name, email, phone, role, active, "userId", tenant_id) VALUES (gen_random_uuid(), $1, $2, $3, $4, true, $5, $6) ON CONFLICT DO NOTHING;`, [name || email.split("@")[0], email, phone || null, validRole, authUserId, targetTenant]);
    }

    if (targetScope === "customer") {
      const custRes = await pgClient.query("SELECT id FROM public.customers WHERE email = $1 LIMIT 1", [email]);
      let customerId = custRes.rows[0]?.id;
      if (!customerId) {
        const parts = (name || "Customer").split(" ");
        const newCust = await pgClient.query(`INSERT INTO public.customers (id, "firstName", "lastName", email, phone, "customerStatus", "userId", tenant_id, "createdAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, 'ACTIVE', $5, $6, NOW()) RETURNING id;`, [parts[0], parts.slice(1).join(" ") || "", email, phone || null, authUserId, targetTenant]);
        customerId = newCust.rows[0].id;
      }
    }

    await pgClient.end();
    return NextResponse.json({ success: true, authUserId, email, role, scope: targetScope, message: `Provisioned ${email} with ${role} access.` });
  } catch (err: any) {
    console.error("[POST /api/admin/users]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, userId, role, status, mfa_enabled } = body;
    const pgClient = await getPgClient();
    if (!pgClient) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });
    if (role) {
      await pgClient.query("UPDATE public.tenant_memberships SET role = $1, updated_at = NOW() WHERE id::text = $2 OR user_id::text = $3", [role, id, userId]);
      await pgClient.query("UPDATE public.staff SET role = $1 WHERE \"userId\"::text = $2", [role, userId]);
    }
    if (status) await pgClient.query("UPDATE public.tenant_memberships SET status = $1, updated_at = NOW() WHERE id::text = $2 OR user_id::text = $3", [status.toLowerCase(), id, userId]);
    if (mfa_enabled !== undefined) await pgClient.query("UPDATE public.tenant_memberships SET mfa_enabled = $1, updated_at = NOW() WHERE id::text = $2 OR user_id::text = $3", [!!mfa_enabled, id, userId]);
    await pgClient.end();
    return NextResponse.json({ success: true, message: "User updated." });
  } catch (err: any) {
    console.error("[PATCH /api/admin/users]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");
    if (!id && !userId) return NextResponse.json({ error: "id or userId required" }, { status: 400 });
    const pgClient = await getPgClient();
    if (!pgClient) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });
    if (id) await pgClient.query("DELETE FROM public.tenant_memberships WHERE id::text = $1", [id]);
    if (userId) { await pgClient.query("DELETE FROM public.tenant_memberships WHERE user_id::text = $1", [userId]); await pgClient.query("DELETE FROM public.staff WHERE \"userId\"::text = $1", [userId]); }
    await pgClient.end();
    return NextResponse.json({ success: true, message: "Access revoked." });
  } catch (err: any) {
    console.error("[DELETE /api/admin/users]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
