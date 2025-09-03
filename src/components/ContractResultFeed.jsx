"use client";

import { useEffect, useMemo, useState } from "react";
import { getStakes } from "@/lib/api";

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const STATUS_BADGE = {
  active: "bg-amber-100 text-amber-800 border-amber-200",
  succeeded: "bg-emerald-100 text-emerald-800 border-emerald-200",
  failed: "bg-rose-100 text-rose-800 border-rose-200",
  cancelled: "bg-neutral-100 text-neutral-700 border-neutral-200",
};

export default function ContractResultFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await getStakes();
        if (mounted) setItems(list);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    const onStorage = (e) => {
      if (e?.key === "mindshift_stakes") {
        try {
          const next = JSON.parse(e.newValue || "[]");
          setItems(next || []);
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const sorted = useMemo(
    () => [...items].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 10),
    [items]
  );

  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white/70 backdrop-blur-sm p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold">Contract Results</h2>
        <span className="text-xs text-neutral-600">{sorted.length} recent</span>
      </div>
      {loading ? (
        <div className="text-sm text-neutral-500">Loading…</div>
      ) : sorted.length === 0 ? (
        <div className="text-sm text-neutral-600">No contracts yet. Create one from the Stake page.</div>
      ) : (
        <ul className="grid gap-3">
          {sorted.map((s) => (
            <li key={s.id} className="flex items-center gap-3 p-2 rounded-lg border border-neutral-200 bg-white/60">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{s.goal || s.note || "Focus Contract"}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_BADGE[s.status] || STATUS_BADGE.active}`}>{s.status}</span>
                </div>
                <div className="text-[11px] text-neutral-600">
                  {s.points ? `${s.points} pts` : s.amount ? `$${s.amount}` : ""} · {timeAgo(s.createdAt)}
                </div>
              </div>
              {s.peer ? (
                <div className="text-xs text-neutral-600">with <span className="font-medium">{s.peer}</span></div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
