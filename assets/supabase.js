// assets/supabase.js
// 1) Create Supabase project
// 2) Copy Project URL + Anon Key here
const SUPABASE_URL = "https://itxddqhlyuywxowkmsls.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_1uXpIcCfZKf8BRgT37lk4w_dl5GdPJM";

// Supabase JS CDN client (loaded in HTML)
let supabaseClient = null;

function getSupabase() {
  if (supabaseClient) return supabaseClient;
  if (!window.supabase) throw new Error("Supabase library not loaded.");
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}
