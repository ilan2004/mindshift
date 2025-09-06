"use client";

import { useEffect, useState } from "react";
import {
  getOrCreateToken,
  fetchBlocklistJSON,
  addDomains,
  removeDomain,
  subscriptionUrl,
} from "@/lib/blocklist";

export default function MobileSetupPage() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ base: [], custom: [], count: 0 });
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const t = getOrCreateToken();
    setToken(t);
    refresh(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh(t = token) {
    try {
      setLoading(true);
      const json = await fetchBlocklistJSON(t);
      setData(json);
    } catch (e) {
      setMessage(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function onAdd() {
    const domains = input
      .split(/[\n,\s]+/)
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);
    if (domains.length === 0) return;
    try {
      setMessage("");
      await addDomains(token, domains);
      setInput("");
      await refresh();
      setMessage(`Added ${domains.length} domain(s).`);
    } catch (e) {
      setMessage(String(e.message || e));
    }
  }

  async function onRemove(d) {
    try {
      setMessage("");
      await removeDomain(token, d);
      await refresh();
      setMessage(`Removed ${d}`);
    } catch (e) {
      setMessage(String(e.message || e));
    }
  }

  const url = token ? subscriptionUrl(token) : "";

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-3">Mobile Setup (DNS Blocking)</h1>
      <p className="text-sm text-neutral-600 mb-4">
        Enable distraction blocking on your phone using NextDNS. This works system‑wide
        (all apps and browsers). Your personal subscription URL updates automatically
        as you add or remove sites below.
      </p>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">1) Your subscription URL</h2>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={url}
            className="w-full border rounded px-3 py-2 text-sm"
          />
          <button
            className="px-3 py-2 bg-emerald-600 text-white rounded"
            onClick={() => navigator.clipboard?.writeText(url)}
          >
            Copy
          </button>
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          Add this URL to your NextDNS profile as a custom filter list, or paste its
          contents into your Denylist.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">2) Add domains to block</h2>
        <textarea
          rows={3}
          placeholder="e.g. twitter.com instagram.com"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        />
        <div className="mt-2 flex gap-2">
          <button className="px-3 py-2 bg-emerald-600 text-white rounded" onClick={onAdd}>
            Add
          </button>
          <button className="px-3 py-2 border rounded" onClick={() => setInput("")}>
            Clear
          </button>
          <button className="px-3 py-2 border rounded" onClick={() => refresh()}>
            Refresh
          </button>
        </div>
        {message && <div className="mt-2 text-sm text-emerald-700">{message}</div>}
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">3) Your current custom list</h2>
        {loading ? (
          <div className="text-sm text-neutral-500">Loading…</div>
        ) : data.custom.length === 0 ? (
          <div className="text-sm text-neutral-500">No custom domains yet.</div>
        ) : (
          <ul className="space-y-2">
            {data.custom.map((d) => (
              <li key={d} className="flex items-center justify-between border rounded px-3 py-2">
                <span className="text-sm break-all">{d}</span>
                <button className="text-red-600 text-sm" onClick={() => onRemove(d)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-8">
        <h2 className="font-semibold mb-2">4) Enable on your device</h2>
        <div className="space-y-3 text-sm">
          <div>
            <div className="font-medium">iOS</div>
            <ol className="list-decimal ml-5 space-y-1">
              <li>Go to NextDNS → Setup → iOS, install the configuration profile and enable it.</li>
              <li>In the NextDNS dashboard for your profile, add your subscription URL (above) to a filter list or paste the domains into Denylist.</li>
            </ol>
          </div>
          <div>
            <div className="font-medium">Android</div>
            <ol className="list-decimal ml-5 space-y-1">
              <li>Install the NextDNS app (or set Private DNS to your NextDNS hostname).</li>
              <li>Add your subscription URL to your profile’s filter list or paste domains in Denylist.</li>
            </ol>
          </div>
          <div>
            <div className="font-medium">Windows (optional)</div>
            <ol className="list-decimal ml-5 space-y-1">
              <li>Install NextDNS for Windows (or configure DoH to your NextDNS endpoint).</li>
              <li>Add your subscription URL or paste domains into the Denylist.</li>
            </ol>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Notes</h2>
        <ul className="list-disc ml-5 text-sm text-neutral-600 space-y-1">
          <li>This MVP stores your custom domains in memory on the server. They’ll reset after a deploy/restart.</li>
          <li>We can persist to Supabase so your list survives deploys and syncs across devices.</li>
          <li>If your origin changes (preview domains on Vercel), CORS is handled by ALLOWED_ORIGIN_REGEX in the backend.</li>
        </ul>
      </section>
    </div>
  );
}
