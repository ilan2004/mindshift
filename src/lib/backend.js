// src/lib/backend.js

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE) {
  // eslint-disable-next-line no-console
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

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
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
export function getQuestions(user_id) {
  const url = new URL("/questions/", API_BASE);
  url.searchParams.set("user_id", user_id);
  return fetch(url.toString()).then(async (res) => {
    if (!res.ok) throw new Error(`Backend GET /questions failed ${res.status}`);
    return res.json();
  });
}

// GET /questions/ with CSV themes
export function getQuestionsWithThemes(user_id, themesCSV) {
  const url = new URL("/questions/", API_BASE);
  url.searchParams.set("user_id", user_id);
  if (themesCSV) url.searchParams.set("themes", themesCSV);
  return fetch(url.toString()).then(async (res) => {
    if (!res.ok) throw new Error(`Backend GET /questions failed ${res.status}`);
    return res.json();
  });
}

// POST /questions/
export function postQuestions({ user_id, themes, mbti_hint }) {
  return request("/questions/", { method: "POST", body: { user_id, themes, mbti_hint } });
}

// GET /questions/general
export function getGeneralQuestions(user_id) {
  const url = new URL("/questions/general", API_BASE);
  if (user_id) url.searchParams.set("user_id", user_id);
  return fetch(url.toString()).then(async (res) => {
    if (!res.ok) throw new Error(`Backend GET /questions/general failed ${res.status}`);
    return res.json();
  });
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
