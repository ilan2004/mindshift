"use client";

import { useEffect, useMemo, useState } from "react";
import { createStake, getStakes, updateStake, updateStakeStatus, deleteStake } from "@/lib/api";
import ContractTracker from "@/components/ContractTracker";

export default function StakePage() {
  const [moneyAmount, setMoneyAmount] = useState(10);
  const [moneyGoal, setMoneyGoal] = useState("");
  const [peerUser, setPeerUser] = useState("");
  const [peerPoints, setPeerPoints] = useState(20);
  const [streakMin, setStreakMin] = useState(50);
  const [streakDays, setStreakDays] = useState(5);
  const [startAt, setStartAt] = useState(""); // yyyy-mm-dd
  const [dueAt, setDueAt] = useState(""); // yyyy-mm-dd
  const [pinned, setPinned] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("money"); // money | peer | streak
  const [selected, setSelected] = useState(null);
  // Drawer editable fields
  const [editGoal, setEditGoal] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editDue, setEditDue] = useState("");
  const [editPinned, setEditPinned] = useState(false);

  // KPI data
  const [allStakes, setAllStakes] = useState([]);

  const loadStakes = async () => {
    try {
      const items = await getStakes();
      setAllStakes(items);
      // If a selection exists, refresh it
      if (selected) {
        const nextSel = items.find((s) => s.id === selected.id);
        if (nextSel) setSelected(nextSel);
      }
    } catch {}
  };

  useEffect(() => {
    loadStakes();
    const onUpd = () => loadStakes();
    window.addEventListener("mindshift:stakes:update", onUpd);
    return () => window.removeEventListener("mindshift:stakes:update", onUpd);
  }, []);

  useEffect(() => {
    if (!selected) return;
    setEditGoal(selected.goal || "");
    setEditNote(selected.note || "");
    setEditPinned(!!selected.pinned);
    setEditStart(selected.startAt ? new Date(selected.startAt).toISOString().slice(0,10) : "");
    setEditDue(selected.dueAt ? new Date(selected.dueAt).toISOString().slice(0,10) : "");
  }, [selected]);

  const onCreate = async (payload) => {
    if (busy) return;
    setBusy(true);
    try {
      const payloadWithDates = {
        ...payload,
        pinned,
        startAt: startAt ? new Date(startAt).getTime() : undefined,
        dueAt: dueAt ? new Date(dueAt).getTime() : undefined,
      };
      await createStake(payloadWithDates);
      window.dispatchEvent(new Event("mindshift:stakes:update"));
    } finally {
      setBusy(false);
    }
  };
  const contractHeader = useMemo(() => {
    const titleMap = { money: "Money Stake", peer: "Peer Stake", streak: "Streak Stake" };
    return titleMap[tab];
  }, [tab]);

  // Field configs for create panel
  const tabFieldDefs = useMemo(() => ({
    money: [
      { key: "amount", label: "Amount (USD)", type: "number", min: 1, value: moneyAmount, onChange: (v)=>setMoneyAmount(v), placeholder: "e.g., 10" },
      { key: "goal", label: "Goal", type: "text", value: moneyGoal, onChange: (v)=>setMoneyGoal(v), placeholder: "e.g., 2 × 25m blocks today" },
    ],
    peer: [
      { key: "peer", label: "Peer Username", type: "text", value: peerUser, onChange: (v)=>setPeerUser(v), placeholder: "e.g., @hadee" },
      { key: "points", label: "Stake (points)", type: "number", min: 1, value: peerPoints, onChange: (v)=>setPeerPoints(v), placeholder: "e.g., 20" },
    ],
    streak: [
      { key: "minPerDay", label: "Min minutes/day", type: "number", min: 5, value: streakMin, onChange: (v)=>setStreakMin(v), placeholder: "e.g., 50" },
      { key: "days", label: "Duration (days)", type: "number", min: 1, value: streakDays, onChange: (v)=>setStreakDays(v), placeholder: "e.g., 5" },
    ],
  }), [moneyAmount, moneyGoal, peerUser, peerPoints, streakMin, streakDays]);

  const buildCreatePayload = () => {
    if (tab === "money") return { type: "money", amount: Number(moneyAmount) || 1, goal: moneyGoal || "", note: "Money stake" };
    if (tab === "peer") return { type: "peer", peer: peerUser, points: Number(peerPoints)||1, goal: `Accountability with ${peerUser||"peer"}`, note: "Peer stake" };
    return { type: "streak", minPerDay: Number(streakMin)||5, days: Number(streakDays)||1, goal: `${streakMin}m/day for ${streakDays}d`, note: "Streak stake" };
  };

  // KPI metrics
  const kpis = useMemo(() => {
    const active = allStakes.filter(s => s.status === "active");
    const succeeded = allStakes.filter(s => s.status === "succeeded").length;
    const failed = allStakes.filter(s => s.status === "failed").length;
    const totalForRate = succeeded + failed;
    const successRate = totalForRate ? Math.round((succeeded / totalForRate) * 100) : 0;
    const now = Date.now();
    const dayMs = 24*60*60*1000;
    const atRisk = active.filter(s => s.dueAt && (s.dueAt - now) <= 2*dayMs && (s.dueAt - now) >= 0).length;
    const totalMoney = allStakes.reduce((sum, s) => sum + (Number(s.amount)||0), 0);
    const totalPoints = allStakes.reduce((sum, s) => sum + (Number(s.points)||0), 0);
    return { activeCount: active.length, atRisk, successRate, totalMoney, totalPoints };
  }, [allStakes]);

  // Sidebar filter helpers
  const [sidebarStatus, setSidebarStatus] = useState("");
  useEffect(() => {
    const read = () => {
      try {
        const sp = new URLSearchParams(window.location.search);
        setSidebarStatus(sp.get("status") || "");
      } catch {}
    };
    read();
    const onPop = () => read();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const applyStatusFilter = (val) => {
    try {
      const sp = new URLSearchParams(window.location.search);
      if (!val) sp.delete("status"); else sp.set("status", val);
      const nextUrl = `${window.location.pathname}?${sp.toString()}`;
      window.history.pushState(null, "", nextUrl);
      window.dispatchEvent(new CustomEvent("mindshift:filters:set", { detail: { status: val } }));
      setSidebarStatus(val || "");
    } catch {}
  };

  return (
    <section className="py-6">
      <style jsx>{`
        /* Section wrapper */
        .faq-section { width: 100%; padding: 24px 0; }
        /* Heading */
        .faq-title { font-family: var(--font-sans); font-weight: 800; font-size: clamp(1.5rem, 2.2vw, 2rem); color: var(--color-green-900); letter-spacing: 0.02em; margin-bottom: 16px; }
        /* Optional blurb */
        .faq-subtitle { color: var(--color-d1e2fc89, var(--color-teal-300)); font-size: 0.95rem; margin-bottom: 20px; }
        /* List */
        .faq-list { display: grid; gap: 14px; }
        /* Item uses <details> for native accessibility */
        .faq-item { border-radius: 20px; border: 1px solid var(--color-green-900-20); background: var(--surface); box-shadow: 0 8px 24px rgba(0,0,0,0.06); overflow: hidden; }
        /* Summary (the clickable question) */
        .faq-summary { list-style: none; cursor: pointer; display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 12px; padding: 18px 20px; font-family: var(--font-sans); font-weight: 700; color: var(--color-green-900); position: relative; }
        /* Remove default triangle */
        .faq-summary::-webkit-details-marker { display: none; }
        /* Chevron icon */
        .faq-summary .chev { width: 20px; height: 20px; color: var(--color-green-900); transition: transform 180ms ease; }
        /* Rotate on open */
        .faq-item[open] .faq-summary .chev { transform: rotate(180deg); }
        /* Answer */
        .faq-content { padding: 0 20px 18px 20px; color: #10473f; line-height: 1.6; }
        /* Accent pills or links inside answers */
        .faq-pill { display: inline-flex; align-items: center; padding: 0.35rem 0.7rem; border-radius: 999px; background: var(--color-cyan-200); color: var(--color-green-900); border: 1px solid var(--color-green-900-20); font-weight: 700; }
        /* Divider line when open (subtle) */
        .faq-item[open] .faq-summary { border-bottom: 1px solid var(--color-green-900-20); }
        /* Hover affordance */
        .faq-summary:hover { background: #fff; }
        /* Optional: section background */
        .faq-section.mint-bg { background: var(--color-mint-500); border-radius: 24px; }
      `}</style>

      <div className="faq-section">
        <h1 className="faq-title">Stake: Focus Contracts</h1>
        <p className="faq-subtitle">Set stakes to keep yourself accountable. Money, peer, or streak stakes — your call.</p>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Active", value: kpis.activeCount },
            { label: "At risk", value: kpis.atRisk },
            { label: "Success rate", value: `${kpis.successRate}%` },
            { label: "Total stake", value: `$${kpis.totalMoney} · ${kpis.totalPoints} pts` },
          ].map((k) => (
            <div key={k.label} className="rounded-xl border border-neutral-200 bg-white p-3 text-center">
              <div className="text-xs text-neutral-500">{k.label}</div>
              <div className="text-lg font-semibold">{k.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="text-xs text-neutral-500 mb-2">Quick filters</div>
              <div className="flex flex-col gap-2">
                <button className={`nav-pill ${sidebarStatus==="active"?"nav-pill--cyan":""}`} onClick={()=>applyStatusFilter("active")}>Active</button>
                <button className={`nav-pill ${sidebarStatus==="succeeded,failed,cancelled"?"nav-pill--cyan":""}`} onClick={()=>applyStatusFilter("succeeded,failed,cancelled")}>Completed</button>
                <button className={`nav-pill ${sidebarStatus==="cancelled"?"nav-pill--cyan":""}`} onClick={()=>applyStatusFilter("cancelled")}>Cancelled</button>
                <button className="nav-pill" onClick={()=>applyStatusFilter("")}>Clear</button>
              </div>
            </div>
          </aside>

          {/* Main column: Create + List */}
          <div className="lg:col-span-1">
            {/* Tabbed Create Panel (contract style) */}
            <div className="rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                {(["money","peer","streak"]).map((t) => (
                  <button key={t} className={`nav-pill ${tab===t?"nav-pill--cyan":""}`} onClick={()=>setTab(t)}>{t}</button>
                ))}
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs text-neutral-500">Contract</div>
                    <div className="text-lg font-semibold text-neutral-800">{contractHeader}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={pinned} onChange={(e)=>setPinned(e.target.checked)} /> Pin
                    </label>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {tabFieldDefs[tab].map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs text-neutral-600 mb-1">{f.label}</label>
                      <input
                        type={f.type}
                        min={f.min}
                        value={f.type==="number" ? (Number(f.value) || 0) : f.value}
                        onChange={(e)=>f.onChange(f.type==="number" ? (Number(e.target.value)|| (f.min||0)) : e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                        placeholder={f.placeholder}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid gap-6 md:grid-cols-2 mt-4">
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Start date</label>
                    <input type="date" value={startAt} onChange={(e)=>setStartAt(e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Due date</label>
                    <input type="date" value={dueAt} onChange={(e)=>setDueAt(e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="text-xs text-neutral-600">
                    Preview: {tab} · {pinned?"Pinned":"Unpinned"}{startAt?` · starts ${startAt}`:""}{dueAt?` · due ${dueAt}`:""}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="nav-pill nav-pill--primary" disabled={busy} onClick={()=>onCreate(buildCreatePayload())}>{busy?"Creating...":"Create Stake"}</button>
                  </div>
                </div>
              </div>
            </div>

            <ContractTracker onSelect={setSelected} />
          </div>

          {/* Right column: Detail Drawer */}
          <div className="relative lg:col-span-1">
            {selected ? (
              <div className="sticky top-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-neutral-500">Contract</div>
                    <div className="text-lg font-semibold">{selected.type} — {selected.status}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="nav-pill" onClick={async ()=>{
                      await updateStake(selected.id, { pinned: !selected.pinned });
                      window.dispatchEvent(new Event("mindshift:stakes:update"));
                    }}>{selected.pinned?"Unpin":"Pin"}</button>
                    <button className="nav-pill" onClick={()=>setSelected(null)}>Close</button>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 text-sm">
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Goal</label>
                    <input className="w-full rounded-lg border border-neutral-300 px-3 py-2" value={editGoal} onChange={(e)=>setEditGoal(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Note</label>
                    <textarea className="w-full rounded-lg border border-neutral-300 px-3 py-2" rows={3} value={editNote} onChange={(e)=>setEditNote(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-neutral-600 mb-1">Start date</label>
                      <input type="date" className="w-full rounded-lg border border-neutral-300 px-3 py-2" value={editStart} onChange={(e)=>setEditStart(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-600 mb-1">Due date</label>
                      <input type="date" className="w-full rounded-lg border border-neutral-300 px-3 py-2" value={editDue} onChange={(e)=>setEditDue(e.target.value)} />
                    </div>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={editPinned} onChange={(e)=>setEditPinned(e.target.checked)} /> Pinned
                  </label>

                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    {selected.amount ? <span className="nav-pill">${selected.amount}</span> : null}
                    {selected.points ? <span className="nav-pill">{selected.points} pts</span> : null}
                    {selected.peer ? <span className="nav-pill">{selected.peer}</span> : null}
                    <span className="nav-pill">Created {new Date(selected.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-2 justify-end mt-2">
                    <button className="nav-pill" onClick={async ()=>{
                      await updateStake(selected.id, {
                        goal: editGoal,
                        note: editNote,
                        pinned: editPinned,
                        startAt: editStart ? new Date(editStart).getTime() : undefined,
                        dueAt: editDue ? new Date(editDue).getTime() : undefined,
                      });
                      window.dispatchEvent(new Event("mindshift:stakes:update"));
                    }}>Save</button>
                    <button className="nav-pill" onClick={async ()=>{ await updateStakeStatus(selected.id, "succeeded"); window.dispatchEvent(new Event("mindshift:stakes:update")); }}>Mark Succeeded</button>
                    <button className="nav-pill nav-pill--red" onClick={async ()=>{ await updateStakeStatus(selected.id, "failed"); window.dispatchEvent(new Event("mindshift:stakes:update")); }}>Mark Failed</button>
                    <button className="nav-pill" onClick={async ()=>{ await updateStakeStatus(selected.id, "cancelled"); window.dispatchEvent(new Event("mindshift:stakes:update")); }}>Cancel</button>
                    <button className="nav-pill" onClick={async ()=>{ await deleteStake(selected.id); setSelected(null); window.dispatchEvent(new Event("mindshift:stakes:update")); }}>Delete</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="sticky top-4 text-sm text-neutral-500">Select a stake to see details.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
