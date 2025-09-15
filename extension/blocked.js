// extension/blocked.js
(() => {
    const backBtn = document.getElementById('back');
    const passBtn = document.getElementById('pass5');
    const quizBtn = document.getElementById('quiz');
    const hostEl = document.getElementById('host');
    const modeEl = document.getElementById('mode');
    const remainingEl = document.getElementById('remaining');
    const barFill = document.getElementById('bar-fill');
    const resumeBtn = document.getElementById('resume');
    const tipEl = document.getElementById('streak-tip');
    // If you also have a "Manage Wi‑Fi connections" button:
    const wifiBtn = document.getElementById('wifi');
  const personalEl = document.getElementById('personal');
  const quizModal = document.getElementById('quiz-modal');
  const quizQ = document.getElementById('quiz-q');
  const quizChoices = document.getElementById('quiz-choices');
  const quizClose = document.getElementById('quiz-close');
  
    let lastUrl = null;
    let currentTabId = null;
    let tickTimer = null;
  
    // Resolve last blocked URL via background (more reliable than referrer)
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
      try {
        const tab = (tabs && tabs[0]) || null;
        currentTabId = tab ? tab.id : null;
        const res = await chrome.runtime.sendMessage({
          type: 'Nudge:focus',
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
      const res = await chrome.runtime.sendMessage({ type: 'Nudge:focus', action: 'getProfile', payload: {} });
      const profile = res && res.payload ? res.payload.profile : null;
      const msg = copyFor(profile?.mbti);
      if (personalEl) personalEl.textContent = msg;
      if (tipEl) {
        const t = (profile?.mbti || '').toUpperCase();
        const tips = {
          INTJ: 'Keep the streak: two blocks today beats a perfect one tomorrow.',
          INTP: 'Capture the idea, return after the block—streaks fuel insights.',
          ENTJ: 'Win the hour: finish this block, then move the next domino.',
          ENTP: 'One experiment at a time—ship a micro-result before switching.',
          INFJ: 'One clear step now amplifies your momentum later today.',
          INFP: 'Protect the block—create a tiny outcome you’re proud of.',
          ENFJ: 'Lead yourself first—finish this sprint, then share the win.',
          ENFP: 'Contain the spark for 25—explore freely after you ship.',
          ISTJ: 'Consistency compounds—check off one concrete item now.',
          ISFJ: 'Steady care: one solid task strengthens your rhythm.',
          ESTJ: 'Decide and do—close the loop on the current task.',
          ESFJ: 'Structure supports you—honor this block, reconnect after.',
          ISTP: 'Precision first—optimize one system, then iterate.',
          ISFP: 'Craft with intent—improve one detail in this block.',
          ESTP: 'Take the high‑leverage action now—momentum follows.',
          ESFP: 'Bring your spark—finish this block, then celebrate small.'
        };
        tipEl.textContent = tips[t] || 'Keep the chain going—one block at a time.';
      }
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

    function formatMMSS(ms) {
      const s = Math.max(0, Math.floor(ms / 1000));
      const m = Math.floor(s / 60);
      const r = s % 60;
      return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`;
    }

    async function refreshStatus() {
      try {
        const res = await chrome.runtime.sendMessage({ type: 'Nudge:focus', action: 'getStatus', payload: {} });
        const st = res && res.payload ? res.payload : null;
        const active = !!st?.active;
        const mode = st?.mode || 'idle';
        const remaining = Number(st?.remainingMs || 0);
        const totalMin = Number(st?.lastDurationMin || 25);
        const totalMs = totalMin * 60000;
        if (modeEl) modeEl.textContent = String(mode).toUpperCase();
        if (remainingEl) remainingEl.textContent = remaining ? formatMMSS(remaining) : '--:--';
        const pct = totalMs ? Math.max(0, Math.min(100, 100 * (1 - (remaining / totalMs)))) : 0;
        if (barFill) barFill.style.width = `${pct}%`;
        if (barFill) {
          // Color by mode
          if (mode === 'focus') barFill.style.backgroundColor = 'rgb(174, 251, 255)'; // cyan
          else if (mode === 'break') barFill.style.backgroundColor = '#fde68a'; // amber-200
          else if (mode === 'paused') barFill.style.backgroundColor = '#c7d2fe'; // indigo-200
          else barFill.style.backgroundColor = '#e5e7eb'; // gray-200
        }
        // Show Resume button only when paused
        if (resumeBtn) resumeBtn.style.display = (mode === 'paused') ? '' : 'none';
      } catch {}
    }

    function startTick() {
      if (tickTimer) clearInterval(tickTimer);
      tickTimer = setInterval(refreshStatus, 1000);
      refreshStatus();
    }

    startTick();
  
    backBtn?.addEventListener('click', () => {
      // Try client history first, else ask background to go back
      if (history.length > 1) {
        history.back();
      } else {
        (async () => {
          try {
            if (currentTabId != null) {
              await chrome.runtime.sendMessage({
                type: 'Nudge:focus',
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
  
    async function allowAndReturn(minutes = 5) {
      const target = lastUrl || document.referrer;
      if (!target) return;
      const u = new URL(target);
      const domain = u.hostname.replace(/^www\./, '');

      await chrome.runtime.sendMessage({
        type: 'Nudge:focus',
        action: 'temporaryAllow',
        payload: { domain, minutes }
      });

      // Also start a break so UI reflects state
      await chrome.runtime.sendMessage({
        type: 'Nudge:focus',
        action: 'startBreak',
        payload: { durationMinutes: minutes }
      });

      await new Promise((r) => setTimeout(r, 300));
      location.replace(target);
      setTimeout(() => {
        try {
          if (location.pathname.endsWith('/blocked.html')) {
            location.replace(target);
          }
        } catch {}
      }, 700);
    }

    passBtn?.addEventListener('click', async () => {
      try {
        await allowAndReturn(5);
      } catch (e) {
        console.error(e);
      }
    });

    // Quiz unlock
    function quizItems() {
      return [
        { q: 'What are you trying to do right now?', choices: ['Deep work', 'Browse', 'Chat'], a: 0 },
        { q: 'How long is your current focus block?', choices: ['25m', '5h', 'All day'], a: 0 }
      ];
    }

    function openQuiz() {
      const items = quizItems();
      let idx = 0; let correct = 0;
      function render() {
        const it = items[idx];
        quizQ.textContent = it.q;
        quizChoices.innerHTML = '';
        it.choices.forEach((c, i) => {
          const btn = document.createElement('button');
          btn.className = 'nav-pill';
          btn.textContent = c;
          btn.addEventListener('click', async () => {
            const ok = i === it.a; if (ok) correct++;
            idx++;
            if (idx >= items.length) {
              if (correct >= 1) {
                await allowAndReturn(2);
              }
              closeQuiz();
              return;
            }
            render();
          });
          quizChoices.appendChild(btn);
        });
      }
      function closeQuiz() {
        quizModal.style.display = 'none';
      }
      quizClose?.addEventListener('click', closeQuiz, { once: true });
      quizModal.style.display = 'flex';
      render();
    }

    quizBtn?.addEventListener('click', openQuiz);

    resumeBtn?.addEventListener('click', async () => {
      try {
        await chrome.runtime.sendMessage({ type: 'Nudge:focus', action: 'resumeSession', payload: {} });
        await new Promise((r)=>setTimeout(r,200));
        refreshStatus();
      } catch {}
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
