import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://qcfaprwqixadakopnxfp.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_RLZSeuYBtIcpRdNj2-61FA_iDCXEAix";

export const supabase = createClient(supabaseUrl, supabaseKey);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
