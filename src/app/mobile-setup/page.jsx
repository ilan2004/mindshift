"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
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
  const [copied, setCopied] = useState(false);

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

  const isIOS = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }, []);
  const isAndroid = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /Android/i.test(navigator.userAgent);
  }, []);

  async function copyUrl() {
    try {
      await navigator.clipboard?.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      setMessage("Unable to copy. Long-press the URL to copy.");
    }
  }

  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <div className="w-full max-w-4xl mx-auto px-4 py-6">
        <div 
          className="rounded-xl p-6 mb-6"
          style={{
            background: "var(--surface)",
            border: "2px solid var(--color-green-900)",
            boxShadow: "0 4px 20px rgba(3, 89, 77, 0.15)"
          }}
        >
          {/* Close Button */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="nav-pill nav-pill--cyan text-xs font-bold uppercase tracking-wider">
                Setup
              </div>
              <div className="nav-pill nav-pill--outline text-xs">
                Mobile Blocking
              </div>
            </div>
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
              style={{ color: 'var(--text-default)' }}
              aria-label="Go back"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m18 6-12 12"/>
                <path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>
          
          <h1 
            className="text-2xl md:text-3xl font-tanker mb-3 leading-tight"
            style={{ color: "var(--color-green-900)" }}
          >
            Mobile Setup (DNS Blocking)
          </h1>
          <p className="text-sm text-neutral-600">
            Enable distraction blocking on your phone using NextDNS. This works system‑wide
            (all apps and browsers). Your personal subscription URL updates automatically
            as you add or remove sites below.
          </p>
        </div>
      </div>
      
      <div className="w-full max-w-4xl mx-auto px-4 pb-8">

        {/* iOS Safari (browser-only) quick setup */}
        <section 
          className="mb-6 rounded-xl p-6"
          style={{
            background: "var(--surface)",
            border: "2px solid var(--color-green-900)",
            boxShadow: "0 2px 0 var(--color-green-900)"
          }}
        >
          <h2 
            className="font-semibold mb-4 text-lg"
            style={{ color: "var(--color-green-900)", fontFamily: "Tanker, sans-serif" }}
          >
            📱 Safari on iOS (Browser‑only, easiest)
          </h2>
          <ol className="list-decimal ml-5 space-y-2 text-sm mb-4" style={{ color: "var(--text-default)" }}>
            <li>Install a Safari content blocker: <strong>AdGuard</strong> or <strong>1Blocker</strong> from the App Store</li>
            <li>Open the app → <strong>Filters/Custom</strong> → Add filter list by URL, then paste your URL below</li>
            <li>Enable it in iOS: <strong>Settings → Safari → Extensions</strong> (Content Blockers) → toggle on</li>
          </ol>
          <div className="flex flex-wrap gap-3">
            <a className="nav-pill nav-pill--primary" href="https://apps.apple.com/app/apple-store/id1047223162" target="_blank" rel="noreferrer">Get AdGuard</a>
            <a className="nav-pill nav-pill--cyan" href="https://apps.apple.com/app/1blocker-ad-blocker-privacy/id1365531024" target="_blank" rel="noreferrer">Get 1Blocker</a>
          </div>
          {isIOS && (
            <div className="mt-4 p-3 rounded-xl" style={{ background: "var(--color-mint-200)", border: "2px solid var(--color-mint-500)" }}>
              <p className="text-xs font-medium" style={{ color: "var(--color-green-900)" }}>
                ✅ <strong>iOS Detected:</strong> The steps above are recommended for your device!
              </p>
            </div>
          )}
        </section>

        {/* Android alternatives without Firefox */}
        <section 
          className="mb-6 rounded-xl p-6"
          style={{
            background: "var(--surface)",
            border: "2px solid var(--color-green-900)",
            boxShadow: "0 2px 0 var(--color-green-900)"
          }}
        >
          <h2 
            className="font-semibold mb-4 text-lg"
            style={{ color: "var(--color-green-900)", fontFamily: "Tanker, sans-serif" }}
          >
            🤖 Android (without Firefox)
          </h2>
          <ol className="list-decimal ml-5 space-y-2 text-sm mb-4" style={{ color: "var(--text-default)" }}>
            <li><strong>AdGuard for Android:</strong> open AdGuard → Filters → Custom → Add filter by URL (paste your URL below)</li>
            <li><strong>Samsung Internet:</strong> install AdGuard Content Blocker or Adblock Plus for Samsung Internet, then add a custom list by URL</li>
          </ol>
          <div className="flex flex-wrap gap-3">
            <a className="nav-pill nav-pill--primary" href="https://adguard.com/en/adguard-android/overview.html" target="_blank" rel="noreferrer">Get AdGuard for Android</a>
            <a className="nav-pill nav-pill--cyan" href="https://play.google.com/store/apps/details?id=com.samsung.android.sbrowser.contentBlocker" target="_blank" rel="noreferrer">Samsung Content Blocker</a>
          </div>
          {isAndroid && (
            <div className="mt-4 p-3 rounded-xl" style={{ background: "var(--color-mint-200)", border: "2px solid var(--color-mint-500)" }}>
              <p className="text-xs font-medium" style={{ color: "var(--color-green-900)" }}>
                ✅ <strong>Android Detected:</strong> The steps above are recommended for your device!
              </p>
            </div>
          )}
        </section>

        <section 
          className="mb-6 rounded-xl p-6"
          style={{
            background: "var(--surface)",
            border: "2px solid var(--color-green-900)",
            boxShadow: "0 2px 0 var(--color-green-900)"
          }}
        >
          <h2 
            className="font-semibold mb-4 text-lg"
            style={{ color: "var(--color-green-900)", fontFamily: "Tanker, sans-serif" }}
          >
            🔗 1) Your subscription URL
          </h2>
          <div className="flex items-center gap-2 mb-4">
            <input
              readOnly
              value={url}
              className="flex-1 px-3 py-3 rounded-[999px] text-sm"
              style={{ 
                background: "var(--surface)", 
                border: "2px solid var(--color-green-900)", 
                boxShadow: "0 2px 0 var(--color-green-900)" 
              }}
            />
            <button
              className={`nav-pill ${ copied ? "nav-pill--cyan" : "nav-pill--primary" }`}
              onClick={copyUrl}
            >
              {copied ? "✅ Copied" : "📋 Copy"}
            </button>
          </div>
          {url && (
            <div className="flex flex-col md:flex-row items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: 'rgba(249, 248, 244, 0.8)' }}>
              <a href={url} target="_blank" rel="noreferrer" title="Open subscription URL" className="shrink-0">
                <QRCode value={url} size={128} bgColor="#ffffff" fgColor="#111111" className="rounded-lg" />
              </a>
              <div className="text-center md:text-left">
                <p className="text-sm font-medium mb-2" style={{ color: "var(--color-green-900)" }}>Scan or tap to open on your phone</p>
                <p className="text-xs text-neutral-500">
                  Add this URL to your NextDNS profile as a custom filter list, or paste its
                  contents into your Denylist.
                </p>
              </div>
            </div>
          )}
        </section>

        <section 
          className="mb-6 rounded-xl p-6"
          style={{
            background: "var(--surface)",
            border: "2px solid var(--color-green-900)",
            boxShadow: "0 2px 0 var(--color-green-900)"
          }}
        >
          <h2 
            className="font-semibold mb-4 text-lg"
            style={{ color: "var(--color-green-900)", fontFamily: "Tanker, sans-serif" }}
          >
            ➕ 2) Add domains to block
          </h2>
          <textarea
            rows={4}
            placeholder="e.g. twitter.com instagram.com tiktok.com
Add one domain per line or separate with spaces"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm mb-4"
            style={{ 
              background: "var(--surface)", 
              border: "2px solid var(--color-green-900)", 
              boxShadow: "0 2px 0 var(--color-green-900)" 
            }}
          />
          <div className="flex flex-wrap gap-3 mb-4">
            <button className="nav-pill nav-pill--primary" onClick={onAdd}>
              ➕ Add Domains
            </button>
            <button className="nav-pill nav-pill--outline" onClick={() => setInput("")}>
              Clear
            </button>
            <button className="nav-pill nav-pill--cyan" onClick={() => refresh()}>
              🔄 Refresh
            </button>
          </div>
          {message && (
            <div className="p-3 rounded-xl" style={{ background: "var(--color-mint-200)", border: "2px solid var(--color-mint-500)" }}>
              <p className="text-sm font-medium" style={{ color: "var(--color-green-900)" }}>
                {message}
              </p>
            </div>
          )}
        </section>

        <section 
          className="mb-6 rounded-xl p-6"
          style={{
            background: "var(--surface)",
            border: "2px solid var(--color-green-900)",
            boxShadow: "0 2px 0 var(--color-green-900)"
          }}
        >
          <h2 
            className="font-semibold mb-4 text-lg"
            style={{ color: "var(--color-green-900)", fontFamily: "Tanker, sans-serif" }}
          >
            📋 3) Your current custom list
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-neutral-500 animate-pulse">Loading custom domains…</div>
            </div>
          ) : data.custom.length === 0 ? (
            <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'rgba(249, 248, 244, 0.8)' }}>
              <p className="text-sm text-neutral-500 mb-2">🛡️ No custom domains yet.</p>
              <p className="text-xs text-neutral-400">Add some domains above to start blocking distractions!</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {data.custom.map((d) => (
                <li 
                  key={d} 
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ 
                    background: "rgba(249, 248, 244, 0.8)", 
                    border: "2px solid var(--color-green-900-20)" 
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                    <span className="text-sm font-mono break-all">{d}</span>
                  </div>
                  <button 
                    className="nav-pill nav-pill--outline text-xs ml-3 shrink-0" 
                    onClick={() => onRemove(d)}
                    style={{ color: "var(--color-red-600)" }}
                  >
                    🗑️ Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section 
          className="mb-8 rounded-xl p-6"
          style={{
            background: "var(--surface)",
            border: "2px solid var(--color-green-900)",
            boxShadow: "0 2px 0 var(--color-green-900)"
          }}
        >
          <h2 
            className="font-semibold mb-6 text-lg"
            style={{ color: "var(--color-green-900)", fontFamily: "Tanker, sans-serif" }}
          >
            ⚙️ 4) Enable on your device
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(249, 248, 244, 0.8)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">🍎</div>
                <div className="font-semibold" style={{ color: "var(--color-green-900)" }}>iOS</div>
              </div>
              <ol className="list-decimal ml-5 space-y-2 text-sm">
                <li>Go to <strong>NextDNS → Setup → iOS</strong>, install the configuration profile and enable it</li>
                <li>In the NextDNS dashboard for your profile, add your subscription URL (above) to a filter list or paste the domains into Denylist</li>
              </ol>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(249, 248, 244, 0.8)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">🤖</div>
                <div className="font-semibold" style={{ color: "var(--color-green-900)" }}>Android</div>
              </div>
              <ol className="list-decimal ml-5 space-y-2 text-sm">
                <li>Install the <strong>NextDNS app</strong> (or set Private DNS to your NextDNS hostname)</li>
                <li>Add your subscription URL to your profile's filter list or paste domains in Denylist</li>
              </ol>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(249, 248, 244, 0.8)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">🖥️</div>
                <div className="font-semibold" style={{ color: "var(--color-green-900)" }}>Windows <span className="text-xs opacity-75">(optional)</span></div>
              </div>
              <ol className="list-decimal ml-5 space-y-2 text-sm">
                <li>Install <strong>NextDNS for Windows</strong> (or configure DoH to your NextDNS endpoint)</li>
                <li>Add your subscription URL or paste domains into the Denylist</li>
              </ol>
            </div>
          </div>
        </section>

        <section 
          className="rounded-xl p-6"
          style={{
            background: "var(--surface)",
            border: "2px solid var(--color-green-900)",
            boxShadow: "0 2px 0 var(--color-green-900)"
          }}
        >
          <h2 
            className="font-semibold mb-4 text-lg"
            style={{ color: "var(--color-green-900)", fontFamily: "Tanker, sans-serif" }}
          >
            📝 Important Notes
          </h2>
          <div className="p-4 rounded-xl" style={{ background: "var(--color-amber-200)", border: "2px solid var(--color-amber-500)" }}>
            <ul className="list-disc ml-5 text-sm space-y-2" style={{ color: "var(--color-green-900)" }}>
              <li><strong>MVP Limitation:</strong> This stores your custom domains in memory on the server. They'll reset after a deploy/restart</li>
              <li><strong>Future Enhancement:</strong> We can persist to Supabase so your list survives deploys and syncs across devices</li>
              <li><strong>CORS Handling:</strong> If your origin changes (preview domains on Vercel), CORS is handled by ALLOWED_ORIGIN_REGEX in the backend</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
