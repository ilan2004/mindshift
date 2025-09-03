// extension/blocked.js
(() => {
    const backBtn = document.getElementById('back');
    const passBtn = document.getElementById('pass5');
    const hostEl = document.getElementById('host');
    // If you also have a "Manage Wi‑Fi connections" button:
    const wifiBtn = document.getElementById('wifi');
  
    let lastUrl = null;
    let currentTabId = null;
  
    // Resolve last blocked URL via background (more reliable than referrer)
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
      try {
        const tab = (tabs && tabs[0]) || null;
        currentTabId = tab ? tab.id : null;
        const res = await chrome.runtime.sendMessage({
          type: 'mindshift:focus',
          action: 'getLastBlocked',
          payload: { tabId: currentTabId }
        });
        const url = res && res.payload ? res.payload.url : null;
        if (url) {
          lastUrl = url;
          const u = new URL(url);
          hostEl.textContent = `Attempted: ${u.hostname}`;
          return;
        }
      } catch {}
  
      // Fallback to referrer
      try {
        const ref = document.referrer || '';
        if (ref) {
          lastUrl = ref;
          const u = new URL(ref);
          hostEl.textContent = `Attempted: ${u.hostname}`;
        }
      } catch {}
    });
  
    backBtn?.addEventListener('click', () => {
      // Try client history first, else ask background to go back
      if (history.length > 1) {
        history.back();
      } else {
        (async () => {
          try {
            if (currentTabId != null) {
              await chrome.runtime.sendMessage({
                type: 'mindshift:focus',
                action: 'goBack',
                payload: { tabId: currentTabId }
              });
            } else {
              window.close();
            }
          } catch {
            window.close();
          }
        })();
      }
    });
  
    passBtn?.addEventListener('click', async () => {
      try {
        const target = lastUrl || document.referrer;
        if (!target) return;
        const u = new URL(target);
        const domain = u.hostname.replace(/^www\./, '');

        const res = await chrome.runtime.sendMessage({
          type: 'mindshift:focus',
          action: 'temporaryAllow',
          payload: { domain, minutes: 5 }
        });

        // Also start a 5-minute break so the main website UI reflects "Break" state
        await chrome.runtime.sendMessage({
          type: 'mindshift:focus',
          action: 'startBreak',
          payload: { durationMinutes: 5 }
        });

        // Give DNR a moment to apply rule removal to avoid redirect race
        await new Promise((r) => setTimeout(r, 300));

        // Navigate to original URL; use replace to avoid history clutter
        location.replace(target);

        // Fallback retry: if still blocked (rare timing), retry once after 700ms
        setTimeout(() => {
          try {
            if (location.pathname.endsWith('/blocked.html')) {
              location.replace(target);
            }
          } catch {}
        }, 700);
      } catch (e) {
        console.error(e);
      }
    });
  
    // Optional: “Manage Wi‑Fi connections” button (if present)
    wifiBtn?.addEventListener('click', async () => {
      try {
        // Opening chrome:// pages from JS can be restricted. Best effort:
        await chrome.tabs.create({ url: 'chrome://settings/?search=Wi-Fi' });
      } catch (e) {
        console.warn('Could not open settings:', e);
      }
    });
  })();