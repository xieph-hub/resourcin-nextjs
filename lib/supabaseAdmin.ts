// lib/supabaseAdmin.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin: SupabaseClient | null = null;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // Do NOT throw here, just log.
  console.error(
    "Supabase admin client not initialised. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
  );
} else {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
    },
  });
}

export { supabaseAdmin };
