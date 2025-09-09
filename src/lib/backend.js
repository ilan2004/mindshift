// src/lib/backend.js

import { getSupabaseClient } from './supabase';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE) {
  console.warn("NEXT_PUBLIC_API_BASE_URL is not set. Set it in .env.local, e.g. http://127.0.0.1:8000");
}

// Generate or read persistent anon user id
export function getUserId() {
  if (typeof window === "undefined") return "anonymous";
  const KEY = "ms_user_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

// Get auth headers for authenticated requests
async function getAuthHeaders() {
  const supabase = getSupabaseClient();
  if (!supabase) return {};
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  
  return {
    "Authorization": `Bearer ${session.access_token}`
  };
}

async function request(path, { method = "GET", body } = {}) {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 
      "Content-Type": "application/json",
      ...authHeaders
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Backend ${method} ${path} failed ${res.status}: ${text}`);
  }
  return res.json();
}

// POST /history/
export function postHistory({ user_id, history }) {
  return request("/history/", { method: "POST", body: { user_id, history } });
}

// GET /questions/
export async function getQuestions(user_id) {
  // Public endpoint: do not send Authorization header to avoid CORS preflight
  const url = new URL("/questions/", API_BASE);
  url.searchParams.set("user_id", user_id);
  return fetch(url.toString()).then(async (res) => {
    if (!res.ok) throw new Error(`Backend GET /questions failed ${res.status}`);
    return res.json();
  });
}

// GET /questions/ with CSV themes
export async function getQuestionsWithThemes(user_id, themesCSV) {
  // Public endpoint: do not send Authorization header to avoid CORS preflight
  const url = new URL("/questions/", API_BASE);
  url.searchParams.set("user_id", user_id);
  if (themesCSV) url.searchParams.set("themes", themesCSV);
  return fetch(url.toString()).then(async (res) => {
    if (!res.ok) throw new Error(`Backend GET /questions failed ${res.status}`);
    return res.json();
  });
}

// GET /questions/ (simplified API): returns [{question, options}] -> normalize to {questions: string[]}
export async function getGeneralQuestions(user_id) {
  // Public endpoint: do not send Authorization header to avoid CORS preflight
  const url = new URL("/questions/", API_BASE);
  if (user_id) url.searchParams.set("user_id", user_id);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Backend GET /questions failed ${res.status}`);
  const data = await res.json(); // expected: Array<{question: string, options: string[]}> or Array<string>
  const list = Array.isArray(data)
    ? data
        .map((it) => (it && typeof it === "object" ? String(it.question || "") : String(it || "")))
        .filter(Boolean)
    : [];
  return { questions: list };
}

// POST /questions/
export function postQuestions({ user_id, themes, mbti_hint }) {
  return request("/questions/", { method: "POST", body: { user_id, themes, mbti_hint } });
}

// POST /answers/
export function postAnswers({ user_id, answers }) {
  return request("/answers/", { method: "POST", body: { user_id, answers } });
}

// POST /events/
export function postEvent({ user_id, event_type, details }) {
  // details should be a string map per backend schema; coerce non-strings
  const safeDetails = details
    ? Object.fromEntries(
        Object.entries(details).map(([k, v]) => [k, typeof v === "string" ? v : String(v)])
      )
    : undefined;
  return request("/events/", { method: "POST", body: { user_id, event_type, details: safeDetails } });
}
