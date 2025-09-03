// Simple overlay injection placeholder. Later gate by site list + contracts.
(function () {
  const overlayId = "mindshift-overlay";
  if (document.getElementById(overlayId)) return;

  const overlay = document.createElement("div");
  overlay.id = overlayId;
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 2147483647;
    background: rgba(0,0,0,0.85); color: #fff; display: none;
    align-items: center; justify-content: center; flex-direction: column;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
  `;

  const title = document.createElement("h2");
  title.textContent = "MindShift: Stay on track";
  title.style.marginBottom = "8px";

  const msg = document.createElement("p");
  msg.textContent = "Quick nudge based on your profile. Take a 25-min focus sprint?";
  msg.style.marginBottom = "16px";

  const btn = document.createElement("button");
  btn.textContent = "Start 25-min timer";
  btn.style.cssText = `
    background: #22c55e; color: #000; border: 0; padding: 8px 12px;
    border-radius: 8px; cursor: pointer; font-weight: 600;
  `;
  btn.onclick = () => {
    overlay.style.display = "none";
    chrome.runtime?.sendMessage?.({ type: "START_TIMER", minutes: 25 });
  };

  overlay.appendChild(title);
  overlay.appendChild(msg);
  overlay.appendChild(btn);
  document.documentElement.appendChild(overlay);

  // For now, show overlay on any site after small delay (demo)
  setTimeout(() => {
    overlay.style.display = "flex";
  }, 1500);
})();
