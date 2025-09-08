"use client";

import { useEffect, useMemo, useState } from "react";
import { createStake, getStakes, updateStake, updateStakeStatus, deleteStake } from "@/lib/api";
import ContractTracker from "@/components/ContractTracker";

export default function StakePage() {
  // INR formatter
  const formatINR = (value) => {
    try {
      return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value) || 0);
    } catch {
      return `₹${Number(value) || 0}`;
    }
  };
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
  const [tab, setTab] = useState("money"); // money | peer | message | streak
  const [selected, setSelected] = useState(null);
  const [signatureName, setSignatureName] = useState("");
  const [showIntro, setShowIntro] = useState(false);
  const tabBg = (t) => (t === "peer" || t === "streak" ? "var(--color-lilac-300)" : "var(--color-mint-500)");
  // Sidebar scope filter
  const [scope, setScope] = useState("all"); // today | all
  const isTodayTs = (ts) => {
    if (!ts) return false;
    try {
      const d = new Date(ts);
      const now = new Date();
      return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth() && d.getDate()===now.getDate();
    } catch { return false; }
  };
  const timeLeft = (dueAt) => {
    if (!dueAt) return "";
    const now = Date.now();
    const diff = dueAt - now;
    const sign = diff >= 0 ? 1 : -1;
    const abs = Math.abs(diff);
    const d = Math.floor(abs/86400000);
    const h = Math.floor((abs%86400000)/3600000);
    const m = Math.floor((abs%3600000)/60000);
    const parts = [];
    if (d) parts.push(`${d}d`);
    if (h || d) parts.push(`${h}h`);
    parts.push(`${m}m`);
    return sign>0 ? `${parts.join(" ")} left` : `${parts.join(" ")} overdue`;
  };
  const prefillFromStake = (s) => {
    if (!s) return;
    if (s.type === "money") { setTab("money"); if (s.amount) setMoneyAmount(Number(s.amount)||1); setMoneyGoal(s.goal||""); }
    else if (s.type === "peer") { setTab("peer"); if (s.peer) setPeerUser(s.peer); if (s.points) setPeerPoints(Number(s.points)||1); }
    else if (s.type === "message") { setTab("message"); if (s.phone) setMsgPhone(s.phone); if (s.channel) setMsgChannel(s.channel); if (s.template) setMsgTemplate(s.template); }
    else if (s.type === "streak") { setTab("streak"); if (s.minPerDay) setStreakMin(Number(s.minPerDay)||5); if (s.days) setStreakDays(Number(s.days)||1); }
    if (s.startAt) setStartAt(new Date(s.startAt).toISOString().slice(0,10));
    if (s.dueAt) setDueAt(new Date(s.dueAt).toISOString().slice(0,10));
    // Scroll to create card
    try { document.getElementById("contract-create")?.scrollIntoView({ behavior: "smooth", block: "start" }); } catch {}
  };
  // Drawer editable fields
  const [editGoal, setEditGoal] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editDue, setEditDue] = useState("");
  const [editPinned, setEditPinned] = useState(false);

  // Auto Message fields
  const [msgPhone, setMsgPhone] = useState("");
  const [msgChannel, setMsgChannel] = useState("sms"); // sms | whatsapp
  const [msgTemplate, setMsgTemplate] = useState("If I miss my goal today, hold me accountable!");

  // KPI data
  const [allStakes, setAllStakes] = useState([]);

  const loadStakes = async () => {
    try {
      const items = await getStakes();
      setAllStakes(items);
      // Seed demo stakes on first visit if empty
      try {
        const seeded = localStorage.getItem("mindshift_seeded_stakes");
        if ((!items || items.length === 0) && !seeded) {
          localStorage.setItem("mindshift_seeded_stakes", "true");
          await Promise.all([
            createStake({ type: "money", amount: 250, goal: "2 × 25m deep work today", note: "Demo money stake", status: "active", pinned: true, startAt: Date.now(), dueAt: Date.now() + 24*60*60*1000 }),
            createStake({ type: "message", phone: "+91 9876543210", channel: "sms", template: "I missed my goal today—hold me to it.", goal: "Ship feature PR today", note: "Demo auto message", status: "active", startAt: Date.now(), dueAt: Date.now() + 36*60*60*1000 }),
            createStake({ type: "streak", minPerDay: 45, days: 7, goal: "45m/day for 7d", note: "Demo streak", status: "active", startAt: Date.now(), dueAt: Date.now() + 7*24*60*60*1000 })
          ]);
          window.dispatchEvent(new Event("mindshift:stakes:update"));
        }
      } catch {}
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
    // First-visit intro modal
    try {
      const seen = localStorage.getItem("mindshift_stake_intro_seen");
      if (!seen) setShowIntro(true);
    } catch {}
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
    const titleMap = { money: "Money Stake", peer: "Peer Stake", message: "Auto Message Stake", streak: "Streak Stake" };
    return titleMap[tab];
  }, [tab]);

  // Field configs for create panel
  const tabFieldDefs = useMemo(() => ({
    money: [
      { key: "amount", label: "Amount (INR)", type: "number", min: 1, value: moneyAmount, onChange: (v)=>setMoneyAmount(v), placeholder: "e.g., 250" },
      { key: "goal", label: "Goal", type: "text", value: moneyGoal, onChange: (v)=>setMoneyGoal(v), placeholder: "e.g., 2 × 25m blocks today" },
    ],
    peer: [
      { key: "peer", label: "Peer Username", type: "text", value: peerUser, onChange: (v)=>setPeerUser(v), placeholder: "e.g., @hadee" },
      { key: "points", label: "Stake (points)", type: "number", min: 1, value: peerPoints, onChange: (v)=>setPeerPoints(v), placeholder: "e.g., 20" },
    ],
    message: [
      { key: "phone", label: "Phone", type: "tel", value: msgPhone, onChange: (v)=>setMsgPhone(v), placeholder: "+91 98xxxxxxxx" },
      { key: "channel", label: "Channel", type: "select", value: msgChannel, onChange: (v)=>setMsgChannel(v), options: [ {label:"SMS", value:"sms"}, {label:"WhatsApp", value:"whatsapp"} ] },
      { key: "template", label: "Message", type: "textarea", value: msgTemplate, onChange: (v)=>setMsgTemplate(v), placeholder: "Your message text..." },
    ],
    streak: [
      { key: "minPerDay", label: "Min minutes/day", type: "number", min: 5, value: streakMin, onChange: (v)=>setStreakMin(v), placeholder: "e.g., 50" },
      { key: "days", label: "Duration (days)", type: "number", min: 1, value: streakDays, onChange: (v)=>setStreakDays(v), placeholder: "e.g., 5" },
    ],
  }), [moneyAmount, moneyGoal, peerUser, peerPoints, streakMin, streakDays, msgPhone, msgChannel, msgTemplate]);

  const buildCreatePayload = () => {
    if (tab === "money") return { type: "money", amount: Number(moneyAmount) || 1, goal: moneyGoal || "", note: "Money stake" };
    if (tab === "peer") return { type: "peer", peer: peerUser, points: Number(peerPoints)||1, goal: `Accountability with ${peerUser||"peer"}`, note: "Peer stake" };
    if (tab === "message") return { type: "message", phone: msgPhone.trim(), channel: msgChannel, template: msgTemplate.trim(), goal: `Auto message to ${msgPhone.trim()||"recipient"}`, note: "Auto message stake" };
    return { type: "streak", minPerDay: Number(streakMin)||5, days: Number(streakDays)||1, goal: `${streakMin}m/day for ${streakDays}d`, note: "Streak stake" };
  };

  const isCreateValid = useMemo(() => {
    if (tab === "money") return (Number(moneyAmount) || 0) >= 1 && (moneyGoal || "").trim().length > 0;
    if (tab === "peer") return (peerUser || "").trim().length > 0 && (Number(peerPoints) || 0) >= 1;
    if (tab === "message") return (msgPhone || "").trim().length >= 8 && (msgTemplate || "").trim().length >= 5;
    if (tab === "streak") return (Number(streakMin)||0) >= 5 && (Number(streakDays)||0) >= 1;
    return true;
  }, [tab, moneyAmount, moneyGoal, peerUser, peerPoints, msgPhone, msgTemplate, streakMin, streakDays]);

  const isSignatureValid = (signatureName || "").trim().length >= 2;

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
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
        {showIntro && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="rounded-xl max-w-md w-full p-4" style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 4px 0 var(--color-green-900), 0 8px 24px rgba(0,0,0,0.15)" }} role="dialog" aria-modal="true" aria-labelledby="stake-intro-title">
              <div className="mb-2">
                <h2 id="stake-intro-title" className="font-tanker text-2xl tracking-widest text-green" style={{ lineHeight: 1 }}>Why stakes work</h2>
              </div>
              <p className="text-sm text-neutral-800">
                Humans react stronger to potential loss than to equivalent gain — it’s called <strong>loss aversion</strong>. This page lets you set
                up commitments where missing a goal triggers a consequence (money transfer, auto message, or points). That little risk helps you follow through.
              </p>
              <div className="mt-3 text-xs text-neutral-600">Set a clear goal, a deadline, and a consequence that matters to you.</div>
              <div className="mt-4 flex justify-end">
                <button
                  className="nav-pill"
                  style={{ background: "var(--color-yellow-200)", color: "var(--color-green-900)", border: "2px solid var(--color-green-900)", boxShadow: "0 2px 0 var(--color-green-900)" }}
                  onClick={()=>{ try { localStorage.setItem("mindshift_stake_intro_seen", "true"); } catch {}; setShowIntro(false); }}
                >
                  OK
                </button>
              </div>
            </div>
        </div>
        )}
        {/* Container intro removed; heading will be inside the main card */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 2px 0 var(--color-green-900)" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-neutral-500">Panel</div>
                <button
                  className="nav-pill"
                  style={{
                    background: "var(--color-yellow-200)",
                    color: "var(--color-green-900)",
                    border: "2px solid var(--color-green-900)",
                    boxShadow: "0 2px 0 var(--color-green-900)",
                  }}
                  onClick={()=>{ setTab("money"); setMoneyAmount(250); setMoneyGoal(""); try { document.getElementById("contract-create")?.scrollIntoView({ behavior: "smooth", block: "start" }); } catch {} }}
                >
                  Create New
                </button>
              </div>
              <div className="text-[11px] text-neutral-600 mb-2">Your active stakes {scope==="today"?"today":"(all)"}</div>
              <div className="flex items-center gap-2 mb-2">
                <button className={`nav-pill text-[11px] ${scope==="today"?"nav-pill--cyan":""}`} onClick={()=>setScope("today")}>Today</button>
                <button className={`nav-pill text-[11px] ${scope==="all"?"nav-pill--cyan":""}`} onClick={()=>setScope("all")}>All</button>
              </div>
              <div className="text-xs text-neutral-600 mb-2">Active stakes</div>
              <div className="flex flex-col gap-2">
                {allStakes.filter(s=>s.status==="active").filter(s=> scope==="all" ? true : isTodayTs(s.dueAt)).slice(0,6).map(s=> (
                  <div key={s.id} className="rounded-lg p-2 relative cursor-pointer" style={{ background: "#fff", border: "1px solid var(--color-green-900-20)" }} onClick={()=>prefillFromStake(s)}>
                    {/* Status stamp */}
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        rotate: "-12deg",
                        border: "2px solid var(--color-green-900)",
                        color: "var(--color-green-900)",
                        padding: "1px 6px",
                        borderRadius: 6,
                        fontWeight: 800,
                        fontSize: 9,
                        letterSpacing: 0.5,
                        boxShadow: "0 0 0 2px var(--color-green-900) inset, 0 1px 0 rgba(0,0,0,0.05)",
                        opacity: 0.9,
                        background: "transparent",
                      }}
                    >
                      {(s.status||"ACTIVE").toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="nav-pill">{s.type}</span>
                      {s.amount ? <span className="nav-pill">{formatINR(s.amount)}</span> : null}
                      {s.points ? <span className="nav-pill">{s.points} pts</span> : null}
                      {s.phone ? <span className="nav-pill">{(s.channel||"sms").toUpperCase()}</span> : null}
                      {s.dueAt ? <span className="nav-pill">{timeLeft(s.dueAt)}</span> : null}
                      {s.days ? <span className="nav-pill">{s.days}d</span> : null}
                    </div>
                    <div className="mt-1 text-xs text-neutral-800 truncate">{s.goal || s.note || "No goal"}</div>
                  </div>
                ))}
                {allStakes.filter(s=>s.status==="active").filter(s=> scope==="all" ? true : isTodayTs(s.dueAt)).length === 0 && (
                  <div className="text-xs text-neutral-500">
                    No active stakes. Try a template:
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <button className="nav-pill" onClick={()=>{ setTab("money"); setMoneyAmount(250); setMoneyGoal("2 × 25m deep work today"); document.getElementById("contract-create")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>₹250 Deep Work</button>
                      <button className="nav-pill" onClick={()=>{ setTab("message"); setMsgPhone("+91 98xxxxxxxx"); setMsgChannel("sms"); setMsgTemplate("I missed my goal today—hold me to it."); document.getElementById("contract-create")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>Auto SMS</button>
                      <button className="nav-pill" onClick={()=>{ setTab("streak"); setStreakMin(45); setStreakDays(7); document.getElementById("contract-create")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>45m × 7d</button>
                    </div>
                  </div>
                )}
              <div className="mt-2 italic text-[11px] text-neutral-600">Missing today triggers your consequence. Stay sharp.</div>
              </div>
            </div>
          </aside>

          {/* Main column: Create + List */}
          <div className="lg:col-span-2">
            {/* Tabbed Create Panel (contract style) */}
            <div id="contract-create" className="rounded-xl p-4" style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 2px 0 var(--color-green-900)" }}>
              <div className="mb-2">
                <h1 className="font-tanker text-3xl md:text-4xl tracking-widest text-green" style={{ lineHeight: 1 }}>Stake: Focus Contracts</h1>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3 md:flex md:flex-wrap md:gap-2">
                {["money","peer","message","streak"].map((t) => (
                  <button
                    key={t}
                    className={`nav-pill text-xs md:text-sm`}
                    style={{
                      padding: "6px 10px",
                      background: tabBg(t),
                      color: "var(--color-green-900)",
                      border: "2px solid var(--color-green-900)",
                      boxShadow: "0 2px 0 var(--color-green-900)",
                      opacity: tab===t ? 1 : 0.95,
                    }}
                    onClick={()=>setTab(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {/* Templates dropdown */}
              <div className="mb-3 flex items-center gap-2">
                <label className="text-xs text-neutral-600">Templates</label>
                <select
                  className="rounded-lg border border-neutral-300 px-2 py-1 text-sm bg-white"
                  onChange={(e)=>{
                    const v = e.target.value;
                    if (!v) return;
                    if (v === "tpl_money") { setTab("money"); setMoneyAmount(250); setMoneyGoal("2 × 25m deep work today"); }
                    if (v === "tpl_message") { setTab("message"); setMsgPhone("+91 98xxxxxxxx"); setMsgChannel("sms"); setMsgTemplate("I missed my goal today—hold me to it."); }
                    if (v === "tpl_streak") { setTab("streak"); setStreakMin(45); setStreakDays(7); }
                    e.target.value = "";
                  }}
                >
                  <option value="">Choose…</option>
                  <option value="tpl_money">₹250 Deep Work</option>
                  <option value="tpl_message">Auto SMS</option>
                  <option value="tpl_streak">45m × 7d</option>
                </select>
              </div>
              <div className="rounded-xl p-4" style={{ background: "#fff", border: "1px solid var(--color-green-900-20)" }}>
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
                      {f.type === "textarea" ? (
                        <textarea
                          rows={3}
                          value={f.value}
                          onChange={(e)=>f.onChange(e.target.value)}
                          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                          placeholder={f.placeholder}
                        />
                      ) : f.type === "select" ? (
                        <select
                          value={f.value}
                          onChange={(e)=>f.onChange(e.target.value)}
                          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-white"
                        >
                          {(f.options||[]).map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                      <input
                        type={f.type}
                        min={f.min}
                        value={f.type==="number" ? (Number(f.value) || 0) : f.value}
                        onChange={(e)=>f.onChange(f.type==="number" ? (Number(e.target.value)|| (f.min||0)) : e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                        placeholder={f.placeholder}
                      />
                      )}
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

                {/* Signature and Preview split */}
                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Type your name to sign</label>
                    <input className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" placeholder="Your full name" value={signatureName} onChange={(e)=>setSignatureName(e.target.value)} />
                    {!isSignatureValid && <div className="mt-1 text-xs text-red-600">Signature required</div>}
                  </div>
                  <div>
                    <div className="text-xs text-neutral-600 mb-1">Signature preview</div>
                    <div className="rounded-lg border border-neutral-300 bg-white p-3">
                      <div className="h-12 flex items-end">
                        <span style={{ fontFamily: '"Brush Script MT", "Segoe Script", cursive', fontSize: 28 }}>
                          {signatureName || ""}
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-1">Signed on {new Date().toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                {/* Contract-style preview */}
                <div className="mt-4">
                  <div className="rounded-xl p-4 relative" style={{ background: "#fffdf7", border: "1px solid var(--color-green-900-20)", boxShadow: "inset 0 1px 0 rgba(0,0,0,0.03)" }}>
                    {/* Draft stamp */}
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        rotate: "-12deg",
                        border: "2px solid var(--color-green-900)",
                        color: "var(--color-green-900)",
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontWeight: 800,
                        fontSize: 10,
                        letterSpacing: 1,
                        boxShadow: "0 0 0 2px var(--color-green-900) inset, 0 1px 0 rgba(0,0,0,0.05)",
                        opacity: 0.9,
                        background: "transparent",
                      }}
                    >
                      DRAFT
                    </span>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-tanker text-xl tracking-wider" style={{ color: "var(--color-green-900)" }}>Contract of Focus</div>
                      <div className="text-xs text-neutral-500">ID: CT-{String(Date.now()).slice(-6)}</div>
                    </div>
                    <div className="text-xs text-neutral-700">
                      <p><strong>Purpose:</strong> {tab === 'money' ? (moneyGoal||'—') : tab === 'peer' ? `Accountability with ${peerUser||'peer'}` : tab === 'message' ? (msgTemplate||'—') : `${streakMin}m/day for ${streakDays}d`}</p>
                      <p className="mt-1"><strong>Schedule:</strong> {startAt||'—'} to {dueAt||'—'}</p>
                      {tab === 'money' && <p className="mt-1"><strong>Consequence:</strong> Transfer {formatINR(moneyAmount)} on miss</p>}
                      {tab === 'peer' && <p className="mt-1"><strong>Consequence:</strong> Lose {peerPoints||0} points</p>}
                      {tab === 'message' && <p className="mt-1"><strong>Consequence:</strong> Send {msgChannel.toUpperCase()} to {msgPhone||'—'}</p>}
                      {tab === 'streak' && <p className="mt-1"><strong>Verification:</strong> Daily focus check-in</p>}
                    </div>
                    <div className="mt-4 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="h-12 flex items=end border-b border-neutral-300">
                            <span style={{ fontFamily: '"Brush Script MT", "Segoe Script", cursive', fontSize: 24 }}>{signatureName || ""}</span>
                          </div>
                          <div className="text-[10px] text-neutral-500 mt-1">Your Signature</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-neutral-500">Date</div>
                          <div className="text-sm">{new Date().toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="text-xs text-neutral-600">
                    Preview: {tab} · {pinned?"Pinned":"Unpinned"}{startAt?` · starts ${startAt}`:""}{dueAt?` · due ${dueAt}`:""}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="nav-pill"
                      style={{
                        background: "var(--color-yellow-200)",
                        color: "var(--color-green-900)",
                        border: "2px solid var(--color-green-900)",
                        boxShadow: "0 2px 0 var(--color-green-900)",
                      }}
                      disabled={busy || !isCreateValid || !isSignatureValid}
                      title={!isSignatureValid?"Signature required":(!isCreateValid?"Fill required fields":"")}
                      onClick={()=>onCreate({ ...buildCreatePayload(), signer: signatureName.trim() })}
                    >
                      {busy?"Signing...":"Sign & Activate"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Center column ends */}
          </div>
          {/* Right column removed for now per new layout */}
        </div>
      </div>
    </section>
  );
}
