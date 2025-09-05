// extension/blocked.js
(() => {
    const backBtn = document.getElementById('back');
    const passBtn = document.getElementById('pass5');
    const hostEl = document.getElementById('host');
    // If you also have a "Manage Wi‑Fi connections" button:
    const wifiBtn = document.getElementById('wifi');
  const personalEl = document.getElementById('personal');
  
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

  // Personalized copy based on MBTI
  function copyFor(mbti) {
    const t = (mbti || '').toUpperCase();
    const clusters = {
      // Analysts
      INTJ: "Strategic minds thrive on deep focus. Protect this block to unlock compounding gains.",
      INTP: "Curiosity is your edge. Park ideas in a note and return after this focus sprint.",
      ENTJ: "Decisive leaders deliver. Ship one concrete outcome before switching contexts.",
      ENTP: "Channel your experimentation—one test at a time. Capture the rest for later.",
      // Diplomats
      INFJ: "Clarity fuels purpose. One meaningful step now creates momentum for the day.",
      INFP: "Your values guide you. Focus on the task that feels most true right now.",
      ENFJ: "Your energy lifts others. Finish this block, then share the win.",
      ENFP: "You spark possibilities. Contain the spark for 25 minutes—then explore.",
      // Sentinels
      ISTJ: "Consistency compounds. Complete the checklist item in front of you.",
      ISFJ: "Reliable care starts with focus. One thing done well helps everyone.",
      ESTJ: "Own the execution. Clear the path by closing this task decisively.",
      ESFJ: "Support thrives on structure. Honor this block—then reconnect.",
      // Explorers
      ISTP: "Precision wins. Tune out noise and optimize one system now.",
      ISFP: "Craft with intention. Make something a little better in this block.",
      ESTP: "Action is leverage. Do the high-impact move first.",
      ESFP: "Bring your spark to the work. Finish this block, then celebrate."
    };
    return clusters[t] || "This site is blocked during your focus session. Protect this block—future you will thank you.";
  }

  async function renderPersonalized() {
    try {
      const res = await chrome.runtime.sendMessage({ type: 'mindshift:focus', action: 'getProfile', payload: {} });
      const profile = res && res.payload ? res.payload.profile : null;
      const msg = copyFor(profile?.mbti);
      if (personalEl) personalEl.textContent = msg;
    } catch {
      // keep default text
    }
  }

  renderPersonalized();
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