import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Creates an authenticated Supabase server client for Next.js 15+ App Router
 * (Server Components, Route Handlers, and Server Actions).
 *
 * Automatically manages session tokens in HTTP cookies.
 * Note: In Next.js 15+, `cookies()` returns a Promise that must be awaited.
 */
export async function createClient<Database = any>(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // In Next.js App Router, cookies can only be modified in Route Handlers
          // or Server Actions. This catch block safely ignores the warning.
        }
      },
    },
  });
}

/**
 * Creates a privileged Supabase administrative client using the Service Role Key.
 *
 * CRITICAL SECURITY NOTE:
 * - This client bypasses Row Level Security (RLS).
 * - Must ONLY be called within secure server-side contexts:
 *   - Razorpay payment verification webhooks
 *   - Automated ticket generation and issuance
 *   - Signal ARG verification and leaderboard updates
 *   - Registration desk badge check-in
 * - NEVER expose SUPABASE_SERVICE_ROLE_KEY to the client bundle.
 */
export function createAdminClient<Database = any>(): SupabaseClient<Database> {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "placeholder-service-key";

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NODE_ENV === "production") {
    console.error(
      "[Supabase Admin] CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not defined in production environment."
    );
  }

  return createSupabaseAdminClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
