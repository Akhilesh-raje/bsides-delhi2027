import { createBrowserClient } from "@supabase/ssr";

/**
 * Global singleton browser client instance
 */
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Creates or retrieves a singleton Supabase browser client.
 *
 * Utilizes `@supabase/ssr`'s `createBrowserClient` to manage browser-side
 * authentication sessions stored in cookies, matching Next.js App Router requirements.
 *
 * Environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Supabase Client] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
          "Using fallback configuration for local offline development."
      );
    }
  }

  // Safe fallback to prevent runtime crashes during initial build/static generation
  const validUrl = supabaseUrl || "https://placeholder-project.supabase.co";
  const validKey = supabaseAnonKey || "placeholder-anon-key";

  browserClient = createBrowserClient(validUrl, validKey, {
    isSingleton: true,
  });

  return browserClient;
}

/**
 * Default exported convenience client
 */
export const supabase = createClient();
