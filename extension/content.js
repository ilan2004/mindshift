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
})();
