// lib/storage.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
const anon = process.env.SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE!;

export const supabaseServer = createClient(url, service); // server-side (private bucket access)
export const supabasePublic = createClient(url, anon);    // client-side (if ever needed)
