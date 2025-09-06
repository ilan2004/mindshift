// src/lib/blocklist.js

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

function assertApiBase() {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
}

export function getOrCreateToken() {
  if (typeof window === "undefined") return "anonymous";
  const KEY = "ms_blocklist_token";
  let t = localStorage.getItem(KEY);
  if (!t) {
    t = crypto.randomUUID();
    localStorage.setItem(KEY, t);
  }
  return t;
}

export async function fetchBlocklistJSON(token) {
  assertApiBase();
  const res = await fetch(`${API_BASE}/blocklist/${token}.json`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET blocklist json failed ${res.status}`);
  return res.json();
}

export async function addDomains(token, domains) {
  assertApiBase();
  const body = Array.isArray(domains) ? { domains } : { domain: String(domains) };
  const res = await fetch(`${API_BASE}/blocklist/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST blocklist failed ${res.status}`);
  return res.json();
}

export async function removeDomain(token, domain) {
  assertApiBase();
  const res = await fetch(`${API_BASE}/blocklist/${token}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain }),
  });
  if (!res.ok) throw new Error(`DELETE blocklist failed ${res.status}`);
  return res.json();
}

export function subscriptionUrl(token) {
  assertApiBase();
  return `${API_BASE}/blocklist/${token}.txt`;
}
