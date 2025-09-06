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
      className="rounded-xl p-3 md:p-4 w-full max-w-md mx-auto"
      style={{
        background: "var(--token-4c81cc5a-0ef3-499f-8b97-80de09631c0a, #ffff94)",
        border: "2px solid var(--color-green-900)",
        boxShadow: "0 4px 0 var(--color-green-900), 0 8px 24px var(--color-green-900-20)",
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 md:mb-4">
        <h2 className="text-sm md:text-base font-semibold text-neutral-800" style={{ fontFamily: "Tanker, sans-serif" }}>
          Peer Status
        </h2>
        <span className="text-xs md:text-sm text-neutral-600 font-medium">
          {activeCount}/{peers.length} active
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 md:py-8">
          <div className="animate-pulse text-sm md:text-base text-neutral-600">Loading peers…</div>
        </div>
      ) : (
        <div className="space-y-2 md:space-y-3">
          {peers.map((p) => (
            <div 
              key={p.id} 
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl transition-colors"
              style={{ 
                background: "var(--surface)", 
                border: "2px solid var(--color-green-900)",
                boxShadow: "0 2px 0 var(--color-green-900)"
              }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-semibold flex-shrink-0" style={{ background: "var(--color-green-900)", color: "white" }}>
                  {p.avatar || p.name.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm md:text-base font-medium text-neutral-800 truncate">
                      {p.name}
                    </span>
                    <div 
                      className={`h-2 w-2 md:h-2.5 md:w-2.5 rounded-full ${p.presence.color} flex-shrink-0`}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="text-xs md:text-sm text-neutral-600">
                    {p.presence.label}
                    {p.presence.label === "Focusing" ? ` • ${p.etaMin}m left` : ""}
                  </div>
                </div>
              </div>
              
              <button className="nav-pill nav-pill--cyan text-xs px-3 py-1.5 font-medium w-full sm:w-auto flex-shrink-0">
                Nudge
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}