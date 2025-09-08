// Content script bridge: forwards window.postMessage <-> chrome.runtime messaging
(function () {
  const REQ = "mindshift:focus";
  const RES = "mindshift:focus:status";

  window.addEventListener("message", (event) => {
    const data = event?.data;
    if (!data || data.type !== REQ) return;
    const { action, payload } = data;
    chrome.runtime.sendMessage({ type: REQ, action, payload }, (resp) => {
      if (!resp || !resp.type) return;
      // Bubble back to the page
      window.postMessage({ type: RES, payload: resp.payload }, "*");
    });
  });

  // New: Listen to page-level CustomEvents and forward to background
  function safeHostnameFromUrl(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
  }

  function dispatchFocus(action, payload) {
    try { chrome.runtime.sendMessage({ type: REQ, action, payload }); } catch {}
  }

  // Start template/session: detail { duration, template, url }
  window.addEventListener("mindshift:focus:start_template", (e) => {
    const detail = (e && e.detail) || {};
    const duration = Number(detail.duration) || 25;
    dispatchFocus("startSession", { durationMinutes: duration });
  }, false);

  // Micro-break: detail { seconds }
  window.addEventListener("mindshift:focus:microbreak", (e) => {
    const secs = Number((e && e.detail && e.detail.seconds) || 90) || 90;
    const minutes = Math.max(1, Math.round(secs / 60));
    dispatchFocus("startBreak", { durationMinutes: minutes });
  }, false);

  // Break confirmed (no duration): start a short break by default
  window.addEventListener("mindshift:focus:break_confirmed", () => {
    dispatchFocus("startBreak", { durationMinutes: 5 });
  }, false);

  // Temporary allow a domain for N minutes: detail { url, minutes }
  window.addEventListener("mindshift:blocker:allow_temp", (e) => {
    const detail = (e && e.detail) || {};
    const minutes = Number(detail.minutes) || 2;
    const domain = detail.domain || safeHostnameFromUrl(detail.url || "");
    if (!domain) return;
    dispatchFocus("temporaryAllow", { domain, minutes });
  }, false);
})();
