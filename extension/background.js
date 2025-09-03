// MindShift Focus – Background Service Worker (MV3)
// Owns: session timer (chrome.alarms), block rules (DNR), storage, messaging

const STORAGE_KEYS = {
  SESSION: "mindshift_session",
  BLOCKLIST: "mindshift_blocklist",
  TEMP_ALLOW: "mindshift_tempAllowUntil", // { [domain]: epochMs }
};

const RULE_ID_BASE = 1000; // dynamic rule ids base
const ALARM_NAME = "mindshift_session_end";

// In-memory map of last blocked URL per tab
const lastBlockedByTab = new Map();

async function getStorage(keys) {
  return new Promise((resolve) => chrome.storage.sync.get(keys, (res) => resolve(res || {})));
}

async function setStorage(obj) {
  return new Promise((resolve) => chrome.storage.sync.set(obj, () => resolve()));
}

async function getState() {
  const res = await getStorage([STORAGE_KEYS.SESSION, STORAGE_KEYS.BLOCKLIST, STORAGE_KEYS.TEMP_ALLOW]);
  const session = res[STORAGE_KEYS.SESSION] || { active: false, mode: "idle", endsAt: null, remainingMs: 0, lastDurationMin: 25 };
  const blocklist = res[STORAGE_KEYS.BLOCKLIST] || [];
  const tempAllowUntil = res[STORAGE_KEYS.TEMP_ALLOW] || {};
  return { session, blocklist, tempAllowUntil };
}

async function saveSession(session) {
  await setStorage({ [STORAGE_KEYS.SESSION]: session });
}

async function saveBlocklist(blocklist) {
  await setStorage({ [STORAGE_KEYS.BLOCKLIST]: blocklist });
}

async function saveTempAllow(map) {
  await setStorage({ [STORAGE_KEYS.TEMP_ALLOW]: map });
}

function domainToRuleId(domain, variant = 0) {
  // Stable hash by summing char codes + variant
  let acc = variant;
  for (let i = 0; i < domain.length; i++) acc = (acc + domain.charCodeAt(i)) % 100000;
  return RULE_ID_BASE + acc;
}

async function applyBlockingRules(blocklist, tempAllowUntil, active, mode) {
  // De-duplicate domains to avoid duplicate rule IDs
  const uniqueDomains = Array.from(new Set(Array.isArray(blocklist) ? blocklist : []));
  // Always remove all our managed rule IDs for current blocklist first to avoid duplicate ID errors
  const allIds = uniqueDomains.flatMap((d) => [domainToRuleId(d, 0), domainToRuleId(d, 1)]);
  if (allIds.length) {
    try { await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: allIds }); } catch {}
  }

  // If not focusing, we're done after removal
  if (!active || mode !== "focus") {
    return;
  }

  const now = Date.now();
  const addRules = [];

  for (const domain of uniqueDomains) {
    const until = tempAllowUntil?.[domain] || 0;
    if (until > now) {
      // Temporarily allowed: skip adding rules
      continue;
    }
    const ruleId0 = domainToRuleId(domain, 0); // exact domain
    const ruleId1 = domainToRuleId(domain, 1); // subdomains
    addRules.push(
      {
        id: ruleId0,
        priority: 1,
        action: { type: "redirect", redirect: { extensionPath: "/blocked.html" } },
        condition: {
          urlFilter: `*://${domain}/*`,
          resourceTypes: ["main_frame"],
        },
      },
      {
        id: ruleId1,
        priority: 1,
        action: { type: "redirect", redirect: { extensionPath: "/blocked.html" } },
        condition: {
          urlFilter: `*://*.${domain}/*`,
          resourceTypes: ["main_frame"],
        },
      }
    );
  }

  if (addRules.length) {
    await chrome.declarativeNetRequest.updateDynamicRules({ addRules });
  }
}

async function updateRulesFromState() {
  const { session, blocklist, tempAllowUntil } = await getState();
  await applyBlockingRules(blocklist, tempAllowUntil, session.active, session.mode);
}

function computeRemainingMs(session) {
  if (!session?.endsAt) return 0;
  return Math.max(0, session.endsAt - Date.now());
}

async function startSession(durationMinutes, maybeDomains) {
  const { blocklist: existing } = await getState();
  const blocklist = Array.isArray(maybeDomains) && maybeDomains.length ? maybeDomains : existing;
  const endsAt = Date.now() + durationMinutes * 60 * 1000;
  const session = { active: true, mode: "focus", endsAt, remainingMs: 0, lastDurationMin: durationMinutes };
  await Promise.all([saveSession(session), saveBlocklist(blocklist)]);
  await chrome.alarms.clear(ALARM_NAME);
  await chrome.alarms.create(ALARM_NAME, { when: endsAt });
  await updateRulesFromState();
  return { session, blocklist };
}

async function pauseSession() {
  const { session } = await getState();
  if (!session.active) return { session };
  const remainingMs = computeRemainingMs(session);
  const next = { ...session, mode: "paused", endsAt: null, remainingMs };
  await saveSession(next);
  await chrome.alarms.clear(ALARM_NAME);
  await updateRulesFromState();
  return { session: next };
}

async function resumeSession() {
  const { session } = await getState();
  if (!session || session.mode !== "paused") return { session };
  const endsAt = Date.now() + (session.remainingMs || 0);
  const next = { ...session, mode: "focus", active: true, endsAt, remainingMs: 0 };
  await saveSession(next);
  await chrome.alarms.clear(ALARM_NAME);
  await chrome.alarms.create(ALARM_NAME, { when: endsAt });
  await updateRulesFromState();
  return { session: next };
}

async function stopSession() {
  const next = { active: false, mode: "idle", endsAt: null, remainingMs: 0, lastDurationMin: 25 };
  await saveSession(next);
  await chrome.alarms.clear(ALARM_NAME);
  await updateRulesFromState();
  return { session: next };
}

async function startBreak(durationMinutes) {
  // Break: active but no blocking rules
  const endsAt = Date.now() + durationMinutes * 60 * 1000;
  const next = { active: true, mode: "break", endsAt, remainingMs: 0 };
  await saveSession(next);
  await chrome.alarms.clear(ALARM_NAME);
  await chrome.alarms.create(ALARM_NAME, { when: endsAt });
  await updateRulesFromState();
  return { session: next };
}

async function updateBlocklist(domains) {
  const list = Array.isArray(domains) ? domains : [];
  await saveBlocklist(list);
  await updateRulesFromState();
  const { session } = await getState();
  return { session, blocklist: list };
}

function statusPayload(session, blocklist) {
  const remainingMs = session.mode === "paused" ? (session.remainingMs || 0) : computeRemainingMs(session);
  return { active: session.active, mode: session.mode, remainingMs, domains: blocklist };
}

async function temporaryAllow(domain, minutes = 5) {
  if (!domain) return {};
  const clean = String(domain).replace(/^www\./, "");
  const { tempAllowUntil, blocklist } = await getState();
  // Map subdomain to the actual blocklist entry (e.g., m.youtube.com -> youtube.com)
  let allowKey = clean;
  if (Array.isArray(blocklist) && blocklist.length) {
    const matched = blocklist.find((d) => clean === d || clean.endsWith(`.${d}`));
    if (matched) allowKey = matched;
  }
  const next = { ...tempAllowUntil, [allowKey]: Date.now() + minutes * 60 * 1000 };
  await saveTempAllow(next);
  await updateRulesFromState();
  const { session, blocklist: bl2 } = await getState();
  return { session, blocklist: bl2 };
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm?.name !== ALARM_NAME) return;
  await stopSession();
});

// Track blocked navigations so blocked.html can know the original URL
if (chrome.declarativeNetRequest?.onRuleMatchedDebug) {
  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
    try {
      const tabId = info?.request?.tabId;
      const url = info?.request?.url;
      if (typeof tabId === "number" && url) {
        lastBlockedByTab.set(tabId, url);
      }
    } catch {}
  });
}

chrome.runtime.onInstalled.addListener(async () => {
  // Ensure initial state
  const { session } = await getState();
  if (!session || typeof session.active === "undefined") {
    await saveSession({ active: false, mode: "idle", endsAt: null, remainingMs: 0, lastDurationMin: 25 });
  }
});

// Message bridge from content script / popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (!msg || msg.type !== "mindshift:focus") return;
    const { action, payload } = msg;
    let out = null;
    if (action === "startSession") out = await startSession(payload?.durationMinutes || 25, payload?.domains);
    else if (action === "pauseSession") out = await pauseSession();
    else if (action === "resumeSession") out = await resumeSession();
    else if (action === "stopSession") out = await stopSession();
    else if (action === "startBreak") out = await startBreak(payload?.durationMinutes || 5);
    else if (action === "updateBlocklist") out = await updateBlocklist(payload?.domains || []);
    else if (action === "temporaryAllow") out = await temporaryAllow(payload?.domain, payload?.minutes || 5);
    else if (action === "getStatus") {
      const { session, blocklist } = await getState();
      out = { session, blocklist };
    } else if (action === "getLastBlocked") {
      const tabId = payload?.tabId;
      const url = typeof tabId === "number" ? lastBlockedByTab.get(tabId) : undefined;
      sendResponse({ ok: true, type: "mindshift:focus:last", payload: { url: url || null } });
      return; // early return because we already responded
    } else if (action === "goBack") {
      try {
        const tabId = payload?.tabId;
        if (typeof tabId === "number") await chrome.tabs.goBack(tabId);
        sendResponse({ ok: true, type: "mindshift:focus:nav", payload: { done: true } });
      } catch (e) {
        sendResponse({ ok: false, type: "mindshift:focus:nav", error: String(e) });
      }
      return;
    }

    if (out) {
      const { session, blocklist } = out;
      sendResponse({ ok: true, type: "mindshift:focus:status", payload: statusPayload(session, blocklist || []) });
    }
  })();
  return true; // async
});
