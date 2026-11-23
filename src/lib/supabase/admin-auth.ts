import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "./server";
import { isAuthorizedAdminEmail, isSupabaseConfigured } from "./config";

export type AdminAuthResult =
  | {
      authorized: true;
      supabase: SupabaseClient;
      user: User;
    }
  | {
      authorized: false;
      response: NextResponse;
    };

export async function requireAdmin(): Promise<AdminAuthResult> {
  if (!isSupabaseConfigured()) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          error:
            "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to use Admin CRUD.",
        },
        { status: 503 }
      ),
    };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Supabase client unavailable" }, { status: 503 }),
    };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!isAuthorizedAdminEmail(user.email)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Forbidden: account does not match ADMIN_EMAIL" },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    supabase,
    user,
  };
}
