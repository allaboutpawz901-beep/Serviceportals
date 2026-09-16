import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SB_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "")?.replace(/\/$/, "");
const SB_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

function getSupabaseAdmin() {
  if (!SB_URL || !SB_SERVICE_KEY) return null;
  return createClient(SB_URL, SB_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role = "customer", phone } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase connection is not configured on the server" },
        { status: 500 }
      );
    }

    // 1. Create or retrieve user in Supabase Auth
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    let authUser = userList?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!authUser) {
      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: name || email.split("@")[0],
            name: name || email.split("@")[0],
            role,
          },
        });

      if (createError) {
        return NextResponse.json(
          { error: createError.message },
          { status: 400 }
        );
      }
      authUser = newUser.user;
    }

    const tenantId = "00000000-0000-0000-0000-000000000001";

    // 2. Link to customer or staff tables
    if (role === "customer") {
      const parts = (name || "Customer").split(" ");
      await supabaseAdmin.from("customers").upsert(
        {
          firstName: parts[0],
          lastName: parts.slice(1).join(" ") || "",
          email,
          phone: phone || null,
          customerStatus: "ACTIVE",
          userId: authUser.id,
          tenant_id: tenantId,
        },
        { onConflict: "email" }
      );
    } else {
      // Groomer or Admin
      const validRole = role === "admin" ? "admin" : "groomer";
      await supabaseAdmin.from("tenant_memberships").upsert(
        {
          tenant_id: tenantId,
          user_id: authUser.id,
          role: validRole,
          active: true,
          status: "active",
        },
        { onConflict: "tenant_id,user_id" }
      );

      await supabaseAdmin.from("staff").upsert(
        {
          name: name || email.split("@")[0],
          email,
          phone: phone || null,
          role: role === "admin" ? "Administrator" : "Master Groomer",
          active: true,
          userId: authUser.id,
          tenant_id: tenantId,
        },
        { onConflict: "email" }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authUser.id,
        email: authUser.email,
        name: name || email.split("@")[0],
        role,
      },
      message: "User successfully registered in Supabase",
    });
  } catch (err: any) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
