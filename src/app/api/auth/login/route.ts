import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SB_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "")?.replace(/\/$/, "");
const SB_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
const SB_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SB_ANON_KEY;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!SB_URL || !SB_ANON_KEY) {
      return NextResponse.json({ error: "Supabase credentials not configured" }, { status: 500 });
    }

    // Authenticate with Supabase password
    const client = createClient(SB_URL, SB_ANON_KEY);
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email,
      password: password || "password",
    });

    const adminClient = createClient(SB_URL, SB_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Detect user role from database
    let detectedRole: "admin" | "groomer" | "customer" = "customer";
    let userName = email.split("@")[0];
    let userId = authData?.user?.id;

    if (!userId) {
      // Find by email in admin list if password wasn't set yet (demo/preview grace)
      const { data: userList } = await adminClient.auth.admin.listUsers();
      const match = userList?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (match) {
        userId = match.id;
        if (match.user_metadata?.role) {
          detectedRole = match.user_metadata.role;
        }
        if (match.user_metadata?.full_name || match.user_metadata?.name) {
          userName = match.user_metadata.full_name || match.user_metadata.name;
        }
      }
    }

    if (userId) {
      // Check tenant memberships for admin/employee roles
      const { data: memberships } = await adminClient
        .from("tenant_memberships")
        .select("role")
        .eq("user_id", userId);

      if (memberships && memberships.length > 0) {
        const topRole = memberships[0].role?.toLowerCase();
        if (["owner", "admin", "manager"].includes(topRole)) {
          detectedRole = "admin";
        } else if (["groomer", "stylist", "staff"].includes(topRole)) {
          detectedRole = "groomer";
        }
      }

      // Check staff table name
      const { data: staffData } = await adminClient
        .from("staff")
        .select("name, role")
        .or(`userId.eq.${userId},email.eq.${email}`);

      if (staffData && staffData.length > 0) {
        userName = staffData[0].name || userName;
        const staffRole = staffData[0].role?.toLowerCase() || "";
        if (staffRole.includes("admin") || staffRole.includes("owner")) {
          detectedRole = "admin";
        } else {
          detectedRole = "groomer";
        }
      }

      // Check customer table
      const { data: custData } = await adminClient
        .from("customers")
        .select("firstName, lastName")
        .eq("email", email);

      if (custData && custData.length > 0) {
        const first = custData[0].firstName || "";
        const last = custData[0].lastName || "";
        if (first || last) {
          userName = `${first} ${last}`.trim();
        }
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId || `usr-${Date.now()}`,
        email,
        name: userName,
        role: detectedRole,
      },
      session: authData?.session || null,
      authError: authError ? authError.message : null,
    });
  } catch (err: any) {
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
