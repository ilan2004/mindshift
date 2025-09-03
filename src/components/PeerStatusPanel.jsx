"use client";

import { useEffect, useMemo, useState } from "react";
import { getLeaderboard, getFriends, getUsersByIds } from "@/lib/api";

// Lightweight mock of presence/focus status
function randomStatus() {
  const modes = [
    { label: "Focusing", color: "bg-emerald-500" },
    { label: "On Break", color: "bg-amber-500" },
    { label: "Idle", color: "bg-neutral-400" },
    { label: "Offline", color: "bg-neutral-300" },
  ];
  return modes[Math.floor(Math.random() * modes.length)];
}

export default function PeerStatusPanel({ userId = 1 }) {
  const [peers, setPeers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    (async () => {
      try {
        // Use leaderboard users as a pool; getFriends could drive selection later
        const all = await getLeaderboard("points");
        const sample = all.slice(0, 6).map((u) => ({
          ...u,
          presence: randomStatus(),
          etaMin: Math.floor(Math.random() * 25) + 1,
        }));
        if (mounted) setPeers(sample);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // Periodically update presence to feel live
    const t = setInterval(() => {
      setPeers((prev) => 
        prev.map((p) => ({ ...p, presence: randomStatus() }))
      );
    }, 8000);

    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  const activeCount = useMemo(
    () => peers.filter((p) => p.presence.label !== "Offline").length,
    [peers]
  );

  return (
    <div
      className="rounded-xl border border-neutral-200/80 bg-white/70 backdrop-blur-sm p-6 shadow-sm"
      style={{ 
        backgroundColor: "var(--token-4c81cc5a-0ef3-499f-8b97-80de09631c0a, #ffff94)" 
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-neutral-800">Peer Status</h2>
        <span className="text-sm text-neutral-600 font-medium">
          {activeCount}/{peers.length} active
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <span className="text-base text-neutral-600">Loading peers…</span>
        </div>
      ) : (
        <div className="space-y-3">
          {peers.map((p) => (
            <div 
              key={p.id} 
              className="flex items-center gap-4 p-4 rounded-lg border border-neutral-200/80 bg-white/60 hover:bg-white/80 transition-colors"
            >
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-neutral-100 text-base font-medium shrink-0">
                <span aria-hidden="true">{p.avatar || "👤"}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base font-medium text-neutral-800 truncate">
                    {p.name}
                  </span>
                  <div 
                    className={`h-2.5 w-2.5 rounded-full ${p.presence.color} shrink-0`}
                    aria-hidden="true"
                  />
                </div>
                <div className="text-sm text-neutral-600">
                  {p.presence.label}
                  {p.presence.label === "Focusing" ? ` • ${p.etaMin}m left` : ""}
                </div>
              </div>
              
              <button className="nav-pill nav-pill--cyan text-xs px-3 py-1.5 font-medium whitespace-nowrap hover:opacity-80 transition-opacity shrink-0">
                Nudge
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}