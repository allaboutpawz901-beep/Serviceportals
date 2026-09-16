import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SB_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "")?.replace(/\/$/, "");
const SB_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/auth/callback";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    req.nextUrl.origin ||
    "https://aapawz.com";

  if (error) {
    return NextResponse.redirect(
      `${appUrl}/auth/callback?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(
        errorDescription || ""
      )}`
    );
  }

  if (code && SB_URL && SB_ANON_KEY) {
    const supabase = createClient(SB_URL, SB_ANON_KEY);
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      console.warn("[/api/auth/callback] Code exchange warning:", exchangeError.message);
    }
  }

  // Redirect to client-side auth callback handler to hydrate Zustand and role
  const redirectTarget = new URL("/auth/callback", appUrl);
  searchParams.forEach((val, key) => {
    redirectTarget.searchParams.set(key, val);
  });

  return NextResponse.redirect(redirectTarget.toString());
}
