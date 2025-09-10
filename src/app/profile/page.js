"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Badges from "@/components/Badges";
import ProductivityGraph from "@/components/ProductivityGraph";
import { getSupabaseClient } from "@/lib/supabase";
import { 
  getProfileData, 
  saveProfileField, 
  syncProfileData, 
  pushLocalDataToCloud,
  getCurrentUser 
} from "@/lib/profileService";
import { setupAutoSync } from "@/lib/statsSync";

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
  const router = useRouter();
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [notifSession, setNotifSession] = useState(false);
  const [notifWeekly, setNotifWeekly] = useState(false);
  const [friends, setFriends] = useState([]); // [{id,name}]
  const [loggingOut, setLoggingOut] = useState(false);

  const [totalMinutes, setTotalMinutes] = useState(() => computeTotalFocusMinutes());
  const [streak, setStreak] = useState(() => readStreak());
  const [points, setPoints] = useState(0);
  const [mbti, setMbti] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Scrollspy setup
  const [activeId, setActiveId] = useState("overview");
  const sectionIds = useMemo(() => ["overview", "personality", "profile", "progress", "badges", "community", "notifications", "account"], []);
  const observersRef = useRef([]);

  // Load profile data from Supabase + localStorage on mount
  useEffect(() => {
    let mounted = true;
    
    const loadProfile = async () => {
      setIsSyncing(true);
      
      try {
        // Try to sync from Supabase first
        const profileData = await getProfileData();
        
        if (!mounted) return;
        
        if (profileData) {
          // Update state from synced data
          setName(profileData.username || "Your Name");
          setAvatarUrl(profileData.avatar_url || "");
          setBio(profileData.bio || "");
          setMbti((profileData.mbti_type || "").toUpperCase());
          setPoints(profileData.points || 0);
          setStreak(profileData.streak || 0);
          setTotalMinutes(profileData.total_focus_minutes || computeTotalFocusMinutes());
          setLastSyncTime(new Date());
        }
        
        setIsOnline(true);
      } catch (error) {
        console.warn('Error loading profile, using localStorage:', error);
        setIsOnline(false);
        
        // Fallback to localStorage
        if (!mounted) return;
        setName(lsGet(KEY_PROFILE_NAME, lsGet("ms_display_name", "Your Name")));
        setAvatarUrl(lsGet(KEY_PROFILE_AVATAR, ""));
        setBio(lsGet(KEY_PROFILE_BIO, ""));
        try { setPoints(Number(localStorage.getItem("mindshift_points")) || 0); } catch {}
        try { setMbti((localStorage.getItem("mindshift_personality_type") || "").toUpperCase()); } catch {}
        setTotalMinutes(computeTotalFocusMinutes());
        setStreak(readStreak());
      }
      
      // Load other local-only settings
      if (mounted) {
        setNotifSession(lsGet(KEY_NOTIF_SESSION, "false") === "true");
        setNotifWeekly(lsGet(KEY_NOTIF_WEEKLY, "false") === "true");
        const f = lsGetJSON(KEY_FRIENDS, []);
        setFriends(Array.isArray(f) ? f : []);
        setIsSyncing(false);
      }
    };
    
    loadProfile();

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
    // Subscribe to storage and custom updates for live refresh
    const onStorage = (e) => {
      if (!e || !e.key) return;
      if (e.key === "mindshift_points") {
        try { setPoints(Number(localStorage.getItem("mindshift_points")) || 0); } catch {}
      } else if (e.key === "mindshift_streak") {
        setStreak(readStreak());
      } else if (e.key === "mindshift_personality_type") {
        try { setMbti((localStorage.getItem("mindshift_personality_type") || "").toUpperCase()); } catch {}
      } else if (e.key === KEY_PROFILE_NAME || e.key === "ms_display_name") {
        setName(lsGet(KEY_PROFILE_NAME, lsGet("ms_display_name", "Your Name")));
      } else if (e.key === KEY_PROFILE_AVATAR) {
        setAvatarUrl(lsGet(KEY_PROFILE_AVATAR, ""));
      } else if (e.key === KEY_PROFILE_BIO) {
        setBio(lsGet(KEY_PROFILE_BIO, ""));
      } else if (e.key === KEY_FRIENDS) {
        const f = lsGetJSON(KEY_FRIENDS, []);
        setFriends(Array.isArray(f) ? f : []);
      } else if (e.key === "mindshift_focus_sessions") {
        setTotalMinutes(computeTotalFocusMinutes());
      }
    };
    const refreshCounters = () => {
      try { setPoints(Number(localStorage.getItem("mindshift_points")) || 0); } catch {}
      setStreak(readStreak());
      setTotalMinutes(computeTotalFocusMinutes());
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("mindshift:counters:update", refreshCounters);
    window.addEventListener("mindshift:focus:sessions:update", refreshCounters);

    // Gentle polling fallback in case events are missed
    const poll = setInterval(refreshCounters, 15000);
    
    // Background sync every 2 minutes
    const syncInterval = setInterval(async () => {
      try {
        await syncProfileData();
        setLastSyncTime(new Date());
      } catch (error) {
        console.warn('Background sync failed:', error);
      }
    }, 120000);
    
    // Setup auto-sync for statistics
    const cleanupAutoSync = setupAutoSync();

    return () => {
      observersRef.current.forEach(({ observer, el }) => observer.unobserve(el));
      observersRef.current = [];
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("mindshift:counters:update", refreshCounters);
      window.removeEventListener("mindshift:focus:sessions:update", refreshCounters);
      clearInterval(poll);
      clearInterval(syncInterval);
      if (cleanupAutoSync) cleanupAutoSync();
    };
    
    return () => mounted = false;
  }, [sectionIds]);

  // Handlers: persist edits with Supabase sync
  const saveName = async (v) => { 
    setName(v); 
    lsSet(KEY_PROFILE_NAME, v);
    lsSet("ms_display_name", v);
    await saveProfileField('username', v);
  };
  const saveAvatar = async (v) => { 
    setAvatarUrl(v); 
    lsSet(KEY_PROFILE_AVATAR, v);
    await saveProfileField('avatar_url', v);
  };
  const saveBio = async (v) => { 
    setBio(v); 
    lsSet(KEY_PROFILE_BIO, v);
    await saveProfileField('bio', v);
  };
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

  // Manual sync handler
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await pushLocalDataToCloud();
      await syncProfileData();
      setLastSyncTime(new Date());
      setIsOnline(true);
    } catch (error) {
      console.warn('Manual sync failed:', error);
      setIsOnline(false);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Logout handler with data sync
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // Try to sync local data to cloud before logout
      try {
        await pushLocalDataToCloud();
      } catch (error) {
        console.warn('Could not sync data before logout:', error);
      }
      
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
      
      // Clear all localStorage data
      try {
        localStorage.clear();
      } catch (e) {
        console.warn('Could not clear localStorage:', e);
      }
      
      // Redirect to home page (this will show the auth overlay)
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      setLoggingOut(false);
    }
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
              <div className="min-w-0 flex-1">
                <h1 id="overview-h" className="h2 text-green font-tanker truncate">{name || "Your Name"}</h1>
                <p className="text-sm text-neutral-600 truncate">{bio || "Tell something about yourself"}</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Sync Status Indicator */}
                <div className="flex items-center gap-2">
                  {isSyncing ? (
                    <div className="pill" title="Syncing with cloud">
                      <span className="animate-spin mr-1">⏳</span>
                      Syncing
                    </div>
                  ) : isOnline ? (
                    <button 
                      onClick={handleManualSync}
                      className="pill hover:opacity-80 cursor-pointer transition-opacity" 
                      title={`Last synced: ${lastSyncTime ? lastSyncTime.toLocaleTimeString() : 'Never'}\nClick to sync now`} 
                      style={{ background: 'var(--color-mint-500)', color: 'var(--color-green-900)' }}
                    >
                      <span className="mr-1">☁️</span>
                      Synced
                    </button>
                  ) : (
                    <button 
                      onClick={handleManualSync}
                      className="pill hover:opacity-80 cursor-pointer transition-opacity" 
                      title="Offline - click to try syncing" 
                      style={{ background: 'var(--color-amber-400)', color: 'var(--color-green-900)' }}
                    >
                      <span className="mr-1">📱</span>
                      Sync
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="nav-pill nav-pill--accent"
                  title="Sign out of your account"
                >
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <MetricCard label="Total focus" value={`${totalMinutes}m`} />
              <MetricCard label="Streak" value={`${streak} days`} />
              <MetricCard label="Points" value={points} />
              <MetricCard label="Badges" value={<BadgeCountDisplay />} />
            </div>
          </section>

          {/* Personality (live) */}
          <section id="personality" aria-labelledby="personality-h" className="rounded-xl p-4"
            style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 2px 0 var(--color-green-900)" }}>
            <h2 id="personality-h" className="h3 font-semibold" style={{ fontFamily: "Tanker, sans-serif" }}>Personality</h2>
            {mbti ? (
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <div className="nav-pill font-tanker text-lg" style={{ background: "var(--surface)", borderColor: "var(--color-green-900)" }}>{mbti}</div>
                <div className="pill">{groupForMBTI(mbti)} · {nameForMBTI(mbti)}</div>
                <div className="text-sm text-neutral-700">Points: <span className="font-semibold">{points}</span></div>
                <div className="text-sm text-neutral-700">Streak: <span className="font-semibold">{streak} days</span></div>
                <div className="text-sm text-neutral-700">Total focus: <span className="font-semibold">{totalMinutes}m</span></div>
              </div>
            ) : (
              <p className="text-sm text-neutral-600 mt-2">No personality set yet. Start a quick onboarding from the home page to determine it.</p>
            )}
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
              <MetricCard label="Points" value={points} />
              <MetricCard label="Sessions" value={readFocusSessions().length} />
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
            <div className="flex items-center justify-between">
              <h2 id="community-h" className="h3 font-semibold" style={{ fontFamily: "Tanker, sans-serif" }}>Friends</h2>
              <div className="pill">{friends.length} friend{friends.length !== 1 ? 's' : ''}</div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input 
                value={friendInput} 
                onChange={(e) => setFriendInput(e.target.value)} 
                className="input" 
                placeholder="Add a friend (name only)"
                onKeyDown={(e) => { if (e.key === 'Enter') addFriend(); }}
              />
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

          {/* Account Management */}
          <section id="account" aria-labelledby="account-h" className="rounded-xl p-4"
            style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 2px 0 var(--color-green-900)" }}>
            <h2 id="account-h" className="h3 font-semibold" style={{ fontFamily: "Tanker, sans-serif" }}>Account</h2>
            <div className="mt-3 space-y-3">
              <div className="rounded-xl p-3" style={{ background: "var(--color-yellow-200)", border: "2px solid var(--color-orange-500)" }}>
                <p className="text-sm font-medium text-orange-800">⚠️ Logout Warning</p>
                <p className="text-xs text-orange-700 mt-1">
                  Logging out will clear all your local data including focus sessions, badges, and settings. 
                  Make sure you&apos;ve synced any important data to your account.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className={`nav-pill nav-pill--accent ${loggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loggingOut ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Logging out...
                  </>
                ) : (
                  <>
                    🚪 Sign Out
                  </>
                )}
              </button>
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
    case "account": return "Account";
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

function groupForMBTI(type) {
  const t = String(type || "").toUpperCase();
  if (!t) return "Unknown";
  // By temperament:
  if (/^(INT.|ENT.)$/.test(t)) return "Analyst"; // NT
  if (/^(INF.|ENF.)$/.test(t)) return "Diplomat"; // NF
  if (/^(ISJ.|ESJ.)$/.test(t)) return "Sentinel"; // SJ
  if (/^(ISP.|ESP.)$/.test(t)) return "Explorer"; // SP
  return "Unknown";
}
function nameForMBTI(type) {
  const map = {
    INTJ: "Architect", INTP: "Logician", ENTJ: "Commander", ENTP: "Debater",
    INFJ: "Advocate", INFP: "Mediator", ENFJ: "Protagonist", ENFP: "Campaigner",
    ISTJ: "Logistician", ISFJ: "Defender", ESTJ: "Executive", ESFJ: "Consul",
    ISTP: "Virtuoso", ISFP: "Adventurer", ESTP: "Entrepreneur", ESFP: "Entertainer",
  };
  const t = String(type || "").toUpperCase();
  return map[t] || "Type";
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


