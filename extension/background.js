// MindShift background service worker (MV3)
// Placeholder: could manage timers, storage sync, messaging

chrome.runtime.onInstalled.addListener(() => {
  console.log("MindShift extension installed");
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "PING") {
    sendResponse({ ok: true, ts: Date.now() });
  }
});
