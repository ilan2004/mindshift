import { getSupabaseClient } from "./supabase";

const KEY_LOCAL_USER = "mindshift_user_id";

export function getLocalUserId() {
  if (typeof window === "undefined") return null;
  let id = localStorage.getItem(KEY_LOCAL_USER);
  if (!id) {
    id = crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(KEY_LOCAL_USER, id);
  }
  return id;
}

export async function fetchBlocklist() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const userId = getLocalUserId();
  const { data, error } = await supabase
    .from("blocked_domains")
    .select("domain")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) {
    console.warn("fetchBlocklist error", error);
    return [];
  }
  return (data || []).map((r) => r.domain);
}

export async function saveBlocklist(domains = []) {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const userId = getLocalUserId();
  // Upsert: delete existing and insert new set (simplest MVP)
  const { error: delErr } = await supabase.from("blocked_domains").delete().eq("user_id", userId);
  if (delErr) console.warn("delete blocklist error", delErr);
  if (domains.length === 0) return true;
  const rows = domains.map((d) => ({ user_id: userId, domain: d }));
  const { error } = await supabase.from("blocked_domains").insert(rows);
  if (error) {
    console.warn("insert blocklist error", error);
    return false;
  }
  return true;
}

export async function startSession({ mode = "focus", durationMinutes = 25 }) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const userId = getLocalUserId();
  const endsAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("focus_sessions")
    .insert({ user_id: userId, mode, status: "active", duration_minutes: durationMinutes, started_at: new Date().toISOString(), ends_at: endsAt })
    .select()
    .single();
  if (error) {
    console.warn("startSession error", error);
    return null;
  }
  return data;
}

export async function updateSessionStatus({ id, status, remainingMs = 0 }) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const patch = { status };
  if (status === "paused") patch.remaining_ms = remainingMs; // NOTE: column is remaining_ms in DB
  if (status === "ended") patch.ends_at = new Date().toISOString();
  const { data, error } = await supabase.from("focus_sessions").update(patch).eq("id", id).select().single();
  if (error) {
    console.warn("updateSessionStatus error", error);
    return null;
  }
  return data;
}

export async function getActiveSession() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const userId = getLocalUserId();
  const { data, error } = await supabase
    .from("focus_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn("getActiveSession error", error);
    return null;
  }
  return data;
}
