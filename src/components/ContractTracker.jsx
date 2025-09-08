"use client";

import { useEffect, useMemo, useState } from "react";
import { getStakes, updateStakeStatus, deleteStake, updateStake } from "@/lib/api";

function statusClass(status) {
  switch (status) {
    case "active":
      return "nav-pill nav-pill--cyan";
    case "succeeded":
      return "nav-pill nav-pill--green";
    case "failed":
      return "nav-pill nav-pill--red";
    case "cancelled":
      return "nav-pill";
    default:
      return "nav-pill";
  }
}

export default function ContractTracker({ onSelect }) {
  const [stakes, setStakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] = useState(new Set(["active"]));
  const [typeFilters, setTypeFilters] = useState(new Set(["money", "peer", "message", "streak"]));

  const load = async () => {
    setLoading(true);
    try {
      const items = await getStakes();
      setStakes(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const applyFiltersFromUrl = () => {
      try {
        const sp = new URLSearchParams(window.location.search);
        const qsStatus = sp.get("status");
        const qsType = sp.get("type");
        if (qsStatus !== null) setStatusFilters(new Set(qsStatus ? qsStatus.split(",") : []));
        if (qsType !== null) setTypeFilters(new Set(qsType ? qsType.split(",") : []));
      } catch {}
    };
    // initial
    applyFiltersFromUrl();
    // updates
    const onUpdate = () => load();
    const onPop = () => applyFiltersFromUrl();
    const onFilterSet = (e) => {
      const d = (e && e.detail) || {};
      if (d.status !== undefined) setStatusFilters(new Set(d.status ? d.status.split(",") : []));
      if (d.type !== undefined) setTypeFilters(new Set(d.type ? d.type.split(",") : []));
    };
    window.addEventListener("mindshift:stakes:update", onUpdate);
    window.addEventListener("popstate", onPop);
    window.addEventListener("mindshift:filters:set", onFilterSet);
    return () => {
      window.removeEventListener("mindshift:stakes:update", onUpdate);
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("mindshift:filters:set", onFilterSet);
    };
  }, []);

  const setStatus = async (id, status) => {
    await updateStakeStatus(id, status);
    window.dispatchEvent(new Event("mindshift:stakes:update"));
  };

  const remove = async (id) => {
    await deleteStake(id);
    window.dispatchEvent(new Event("mindshift:stakes:update"));
  };

  const togglePin = async (id, next) => {
    await updateStake(id, { pinned: next });
    window.dispatchEvent(new Event("mindshift:stakes:update"));
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stakes.filter((s) => {
      if (!typeFilters.has(s.type)) return false;
      if (!statusFilters.has(s.status)) return false;
      if (!q) return true;
      const hay = `${s.goal || ""} ${s.note || ""} ${s.peer || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [stakes, search, statusFilters, typeFilters]);

  const grouped = useMemo(() => {
    const order = ["money", "peer", "message", "streak"];
    const byType = Object.fromEntries(order.map((t) => [t, []]));
    for (const s of filtered) {
      (byType[s.type] || (byType[s.type] = [])).push(s);
    }
    const sortFn = (a, b) => {
      // Pinned first, active before others, dueAt asc, createdAt desc
      if (!!b.pinned - !!a.pinned !== 0) return (!!b.pinned) - (!!a.pinned);
      if ((a.status === "active") !== (b.status === "active")) return a.status === "active" ? -1 : 1;
      const da = a.dueAt || Infinity;
      const db = b.dueAt || Infinity;
      if (da !== db) return da - db;
      return (b.createdAt || 0) - (a.createdAt || 0);
    };
    for (const t of Object.keys(byType)) byType[t].sort(sortFn);
    return byType;
  }, [filtered]);

  const chip = (label, active) => `nav-pill ${active ? "nav-pill--cyan" : ""}`;

  const StatusSeal = ({ status }) => {
    const txt = (status || "").toUpperCase();
    const color = status === "active" ? "var(--color-green-900)" : status === "succeeded" ? "#0a7d35" : status === "failed" ? "#b91c1c" : "#6b7280";
    return (
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          rotate: "-12deg",
          border: `2px solid ${color}`,
          color,
          padding: "2px 8px",
          borderRadius: 6,
          fontWeight: 800,
          fontSize: 10,
          letterSpacing: 1,
          boxShadow: `0 0 0 2px ${color} inset, 0 1px 0 rgba(0,0,0,0.05)`,
          opacity: 0.9,
          background: "transparent",
        }}
      >
        {txt}
      </span>
    );
  };

  // Reflect filters to URL (without navigation)
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      sp.set("status", Array.from(statusFilters).join(","));
      sp.set("type", Array.from(typeFilters).join(","));
      const nextUrl = `${window.location.pathname}?${sp.toString()}`;
      window.history.replaceState(null, "", nextUrl);
    } catch {}
  }, [statusFilters, typeFilters]);

  // live countdown ticker
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60 * 1000); // each minute
    return () => clearInterval(id);
  }, []);

  const riskBadge = (s) => {
    if (s.status !== "active") return null;
    const due = s.dueAt || null;
    if (!due) return null;
    const msLeft = due - now;
    const dayMs = 24 * 60 * 60 * 1000;
    if (msLeft < 0) return <span className="nav-pill nav-pill--red">Overdue</span>;
    if (msLeft <= 2 * dayMs) return <span className="nav-pill nav-pill--cyan">At risk</span>;
    return null;
  };

  const formatLeft = (due) => {
    const diff = (due || 0) - now;
    const abs = Math.abs(diff);
    const mins = Math.floor(abs / 60000) % 60;
    const hours = Math.floor(abs / 3600000) % 24;
    const days = Math.floor(abs / 86400000);
    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours || days) parts.push(`${hours}h`);
    parts.push(`${mins}m`);
    return diff >= 0 ? `${parts.join(" ")} left` : `${parts.join(" ")} overdue`;
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <h2 className="text-lg font-semibold">Stakes</h2>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            placeholder="Search stakes..."
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className="text-xs text-neutral-600">Status:</span>
        {["active","succeeded","failed","cancelled"].map(st=> (
          <button key={st} className={chip(st, statusFilters.has(st))}
            onClick={()=>{
              const next = new Set(statusFilters);
              next.has(st) ? next.delete(st) : next.add(st);
              setStatusFilters(next);
            }}>{st}</button>
        ))}
        <span className="mx-2" />
        <span className="text-xs text-neutral-600">Type:</span>
        {["money","peer","message","streak"].map(tp=> (
          <button key={tp} className={chip(tp, typeFilters.has(tp))}
            onClick={()=>{
              const next = new Set(typeFilters);
              next.has(tp) ? next.delete(tp) : next.add(tp);
              setTypeFilters(next);
            }}>{tp}</button>
        ))}
      </div>
      {loading ? (
        <div className="text-sm text-neutral-600">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-neutral-600">No stakes yet. Create one above.</div>
      ) : (
        <div className="space-y-6">
          {["money","peer","message","streak"].map((tp) => (
            grouped[tp] && grouped[tp].length > 0 ? (
              <div key={tp}>
                <div className="text-sm font-semibold text-neutral-700 mb-2 capitalize">{tp}</div>
                <div className="space-y-3">
                  {grouped[tp].map((s) => (
                    <div key={s.id} className="rounded-xl p-3 flex items-start justify-between gap-3 cursor-pointer relative"
                      style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 2px 0 var(--color-green-900)" }}
                      onClick={()=> onSelect && onSelect(s)}>
                      <StatusSeal status={s.status} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={statusClass(s.status)}>{s.status}</span>
                          <span className="nav-pill">{s.type || "stake"}</span>
                          {s.pinned ? <span className="nav-pill nav-pill--green">Pinned</span> : null}
                          {s.amount ? <span className="nav-pill">₹{s.amount}</span> : null}
                          {s.points ? <span className="nav-pill">{s.points} pts</span> : null}
                          {s.peer ? <span className="nav-pill">{s.peer}</span> : null}
                          {s.phone ? <span className="nav-pill">{s.channel || "sms"}</span> : null}
                          {s.dueAt ? <span className="nav-pill">Due {new Date(s.dueAt).toLocaleDateString()}</span> : null}
                          {s.dueAt ? <span className="nav-pill">{formatLeft(s.dueAt)}</span> : null}
                          {riskBadge(s)}
                        </div>
                        <div className="mt-1 text-sm text-neutral-800 truncate">
                          {s.goal || s.note || "No goal specified"}
                        </div>
                        <div className="text-xs text-neutral-500 mt-1">
                          Created {new Date(s.createdAt).toLocaleString()}
                        </div>
                      </div>
                      {/* Row actions moved to the Detail Drawer for a cleaner list */}
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          ))}
        </div>
      )}
    </div>
  );
}
