"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Badges from "@/components/Badges";
import ProductivityGraph from "@/components/ProductivityGraph";

// Utilities: read/write localStorage with guards
function lsGet(key, def = "") {
  try { const v = localStorage.getItem(key); return v == null ? def : v; } catch { return def; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, val); } catch {}
}
function lsGetJSON(key, def = null) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : def; } catch { return def; }
}
function lsSetJSON(key, obj) {
  try { localStorage.setItem(key, JSON.stringify(obj)); } catch {}
}

// Focus metrics (private/local)
function readFocusSessions() {
  const arr = lsGetJSON("mindshift_focus_sessions", []);
  return Array.isArray(arr) ? arr : [];
}
function computeTotalFocusMinutes() {
  const sessions = readFocusSessions();
  let total = 0;
  for (const s of sessions) {
    if (typeof s?.duration_minutes === "number") total += s.duration_minutes;
    else if (s?.started_at && s?.ends_at) {
      const start = new Date(s.started_at).getTime();
      const end = new Date(s.ends_at).getTime();
      if (!Number.isNaN(start) && !Number.isNaN(end) && end > start) {
        total += Math.round((end - start) / 60000);
      }
    }
  }
  return total;
}
function readStreak() {
  try { return Number(localStorage.getItem("mindshift_streak")) || 0; } catch { return 0; }
}

// Profile storage keys (private)
const KEY_PROFILE_NAME = "mindshift_profile_name";
const KEY_PROFILE_AVATAR = "mindshift_profile_avatar_url";
const KEY_PROFILE_BIO = "mindshift_profile_bio";
const KEY_NOTIF_SESSION = "mindshift_notif_session_reminders";
const KEY_NOTIF_WEEKLY = "mindshift_notif_weekly_summary";
const KEY_FRIENDS = "mindshift_friends"; // [{id,name}]

// Simple ID generator
function genId() {
  return (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
}

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [notifSession, setNotifSession] = useState(false);
  const [notifWeekly, setNotifWeekly] = useState(false);
  const [friends, setFriends] = useState([]); // [{id,name}]

  const totalMinutes = useMemo(() => computeTotalFocusMinutes(), []);
  const streak = useMemo(() => readStreak(), []);

  // Scrollspy setup
  const [activeId, setActiveId] = useState("overview");
  const sectionIds = ["overview", "personality", "profile", "progress", "badges", "community", "notifications"];
  const observersRef = useRef([]);

  useEffect(() => {
    // Load profile fields
    setName(lsGet(KEY_PROFILE_NAME, "Your Name"));
    setAvatarUrl(lsGet(KEY_PROFILE_AVATAR, ""));
    setBio(lsGet(KEY_PROFILE_BIO, ""));
    setNotifSession(lsGet(KEY_NOTIF_SESSION, "false") === "true");
    setNotifWeekly(lsGet(KEY_NOTIF_WEEKLY, "false") === "true");
    const f = lsGetJSON(KEY_FRIENDS, []);
    setFriends(Array.isArray(f) ? f : []);

    // Scrollspy using IntersectionObserver
    const opts = { root: null, rootMargin: "0px 0px -70% 0px", threshold: [0, 0.25, 0.5, 1] };
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) {
        const id = visible[0].target.getAttribute("id");
        if (id) setActiveId(id);
      }
    }, opts);
    observersRef.current = [];
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        observersRef.current.push({ observer, el });
      }
    }
    return () => {
      observersRef.current.forEach(({ observer, el }) => observer.unobserve(el));
      observersRef.current = [];
    };
  }, []);

  // Handlers: persist edits
  const saveName = (v) => { setName(v); lsSet(KEY_PROFILE_NAME, v); };
  const saveAvatar = (v) => { setAvatarUrl(v); lsSet(KEY_PROFILE_AVATAR, v); };
  const saveBio = (v) => { setBio(v); lsSet(KEY_PROFILE_BIO, v); };
  const toggleNotifSession = () => { const nv = !notifSession; setNotifSession(nv); lsSet(KEY_NOTIF_SESSION, String(nv)); };
  const toggleNotifWeekly = () => { const nv = !notifWeekly; setNotifWeekly(nv); lsSet(KEY_NOTIF_WEEKLY, String(nv)); };

  // Friends
  const [friendInput, setFriendInput] = useState("");
  const addFriend = () => {
    const trimmed = friendInput.trim();
    if (!trimmed) return;
    const next = [{ id: genId(), name: trimmed }, ...friends].slice(0, 20);
    setFriends(next);
    lsSetJSON(KEY_FRIENDS, next);
    setFriendInput("");
  };
  const removeFriend = (id) => {
    const next = friends.filter((f) => f.id !== id);
    setFriends(next);
    lsSetJSON(KEY_FRIENDS, next);
  };

  return (
    <div className="min-h-screen w-full">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="md:col-span-3 lg:col-span-3 md:sticky md:top-4 self-start">
          <nav className="rounded-xl p-3"
            style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 2px 0 var(--color-green-900)" }}
            aria-label="Profile sections">
            <ul className="flex md:flex-col gap-2 flex-wrap">
              {sectionIds.map((sid) => (
                <li key={sid}>
                  <a
                    href={`#${sid}`}
                    className={`nav-pill ${activeId === sid ? "nav-pill--primary" : ""}`}
                    aria-current={activeId === sid ? "page" : undefined}
                  >
                    {titleForSection(sid)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="md:col-span-9 lg:col-span-9 flex flex-col gap-6">
          {/* Overview */}
          <section id="overview" aria-labelledby="overview-h" className="rounded-xl p-4"
            style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 2px 0 var(--color-green-900)" }}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="Avatar" src={avatarUrl} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>
              <div className="min-w-0">
                <h1 id="overview-h" className="h2 text-green font-tanker truncate">{name || "Your Name"}</h1>
                <p className="text-sm text-neutral-600 truncate">{bio || "Tell something about yourself"}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <MetricCard label="Total focus" value={`${totalMinutes}m`} />
              <MetricCard label="Streak" value={`${streak} days`} />
              <MetricCard label="Badges" value={<BadgeCountDisplay />} />
              <MetricCard label="Friends" value={`${friends.length}`} />
            </div>
          </section>

          {/* Personality (read-only summary for now) */}
          <section id="personality" aria-labelledby="personality-h" className="rounded-xl p-4"
            style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 2px 0 var(--color-green-900)" }}>
            <h2 id="personality-h" className="h3 font-semibold" style={{ fontFamily: "Tanker, sans-serif" }}>Personality</h2>
            <p className="text-sm text-neutral-600">Your recommendations and tone are tailored from your MBTI cluster. You can change it from the home onboarding modal in the future.</p>
          </section>

          {/* Editable Profile */}
          <section id="profile" aria-labelledby="profile-h" className="rounded-xl p-4"
            style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 2px 0 var(--color-green-900)" }}>
            <h2 id="profile-h" className="h3 font-semibold" style={{ fontFamily: "Tanker, sans-serif" }}>Edit Profile</h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium">Display name</span>
                <input value={name} onChange={(e) => saveName(e.target.value)} className="input" placeholder="Your Name" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Avatar URL</span>
                <input value={avatarUrl} onChange={(e) => saveAvatar(e.target.value)} className="input" placeholder="https://..." />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-medium">Bio</span>
                <textarea value={bio} onChange={(e) => saveBio(e.target.value)} className="input" rows={3} placeholder="Short bio" />
              </label>
            </div>
          </section>

          {/* Focus & Progress */}
          <section id="progress" aria-labelledby="progress-h" className="rounded-xl p-4"
            style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 2px 0 var(--color-green-900)" }}>
            <h2 id="progress-h" className="h3 font-semibold" style={{ fontFamily: "Tanker, sans-serif" }}>Focus & Progress</h2>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <MetricCard label="Total focus" value={`${totalMinutes}m`} />
              <MetricCard label="Streak" value={`${streak} days`} />
            </div>
            <div className="mt-4">
              <ProductivityGraph />
            </div>
          </section>

          {/* Badges */}
          <section id="badges" aria-labelledby="badges-h" className="rounded-xl p-4"
            style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 2px 0 var(--color-green-900)" }}>
            <h2 id="badges-h" className="h3 font-semibold" style={{ fontFamily: "Tanker, sans-serif" }}>Badges</h2>
            <div className="mt-2">
              <Badges />
            </div>
          </section>

          {/* Community (Add friends - private) */}
          <section id="community" aria-labelledby="community-h" className="rounded-xl p-4"
            style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 2px 0 var(--color-green-900)" }}>
            <h2 id="community-h" className="h3 font-semibold" style={{ fontFamily: "Tanker, sans-serif" }}>Friends</h2>
            <div className="mt-3 flex items-center gap-2">
              <input value={friendInput} onChange={(e) => setFriendInput(e.target.value)} className="input" placeholder="Add a friend (name only)" />
              <button type="button" className="nav-pill nav-pill--primary" onClick={addFriend}>Add</button>
            </div>
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {friends.length === 0 ? (
                <li className="text-sm text-neutral-600">No friends yet. Add a friend to get started.</li>
              ) : friends.map((f) => (
                <li key={f.id} className="rounded-xl p-2.5 flex items-center justify-between"
                  style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)" }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base" aria-hidden>👤</span>
                    <span className="text-sm font-medium truncate">{f.name}</span>
                  </div>
                  <button type="button" className="nav-pill" onClick={() => removeFriend(f.id)}>Remove</button>
                </li>
              ))}
            </ul>
          </section>

          {/* Notifications */}
          <section id="notifications" aria-labelledby="notifications-h" className="rounded-xl p-4"
            style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 2px 0 var(--color-green-900)" }}>
            <h2 id="notifications-h" className="h3 font-semibold" style={{ fontFamily: "Tanker, sans-serif" }}>Notifications</h2>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <ToggleRow
                label="Session reminders"
                desc="Get nudges to start or resume focus sessions"
                checked={notifSession}
                onChange={toggleNotifSession}
              />
              <ToggleRow
                label="Weekly summary"
                desc="A weekly recap of your focus and streaks"
                checked={notifWeekly}
                onChange={toggleNotifWeekly}
              />
            </div>
          </section>
        </main>
      </div>

      <style jsx global>{`
        .input { width: 100%; background: var(--surface); border: 2px solid var(--color-green-900); box-shadow: 0 2px 0 var(--color-green-900); border-radius: 0.75rem; padding: 0.5rem 0.75rem; outline: none; }
        .input:focus { border-color: var(--color-green-900); box-shadow: 0 0 0 3px var(--color-green-900-20); }
      `}</style>
    </div>
  );
}

function titleForSection(id) {
  switch (id) {
    case "overview": return "Overview";
    case "personality": return "Personality";
    case "profile": return "Edit Profile";
    case "progress": return "Focus & Progress";
    case "badges": return "Badges";
    case "community": return "Friends";
    case "notifications": return "Notifications";
    default: return id;
  }
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-xl p-2.5"
      style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 2px 0 var(--color-green-900)" }}>
      <div className="text-xs text-neutral-600">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}

function BadgeCountDisplay() {
  // Read badges count quickly for overview; relies on Badges storage
  const [count, setCount] = useState(0);
  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem("mindshift_badges");
        const arr = raw ? JSON.parse(raw) : [];
        setCount(Array.isArray(arr) ? arr.length : 0);
      } catch { setCount(0); }
    };
    read();
    const onUpdate = () => read();
    window.addEventListener("mindshift:badges:update", onUpdate);
    window.addEventListener("focus", onUpdate);
    return () => {
      window.removeEventListener("mindshift:badges:update", onUpdate);
      window.removeEventListener("focus", onUpdate);
    };
  }, []);
  return <span>{count}</span>;
}

function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <label className="flex items-start justify-between gap-3 rounded-xl p-2.5"
      style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 2px 0 var(--color-green-900)" }}>
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {desc && <div className="text-xs text-neutral-600">{desc}</div>}
      </div>
      <button type="button" className={`nav-pill ${checked ? "nav-pill--primary" : ""}`} aria-pressed={checked} onClick={onChange}>
        {checked ? "On" : "Off"}
      </button>
    </label>
  );
}


