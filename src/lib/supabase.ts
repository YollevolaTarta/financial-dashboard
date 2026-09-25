import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://yseuxchiumkwbcovkowu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_TvhNT43XHLTBUnOseurgDw_x3etAPRy";

let client: SupabaseClient | null = null;

/** Cliente solo de navegador. Devuelve null durante el render en servidor. */
export function getSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, storage: window.localStorage },
    });
  }
  return client;
}
