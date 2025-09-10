"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { getGeneralQuestions, getQuestions, postAnswers, postHistory } from "../lib/backend";
import { getUserId } from "../lib/backend";
import { getSupabaseClient } from "../lib/supabase";
import { HelpCircle, ChevronDown, ChevronUp, Monitor, Smartphone, Clock, Download, X } from "lucide-react";

const PAGE_SIZE = 6;
const SCALE = [1, 2, 3, 4, 5];
const SCALE_LABEL = {
  1: "Strongly Disagree",
  2: "Disagree",
  3: "Neutral",
  4: "Agree",
  5: "Strongly Agree",
};

export default function TestRunner({ mode = "general", onComplete }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]); // [{id, text}]
  const [page, setPage] = useState(0);
  const [answers, setAnswers] = useState({}); // id -> 1..5
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Fetch questions
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const user_id = getUserId();
        let q = [];
        if (mode === "history") {
          // Do not auto-fetch; wait for user to upload history JSON
          q = [];
        } else {
          const res = await getGeneralQuestions(user_id);
          q = res?.questions || [];
        }
        // Normalize to objects with unique ids
        let list = (q || []).map((text, i) => ({ id: `q${i + 1}`, text: String(text) }));
        // Ensure multiple of PAGE_SIZE: for 15, pad to 18 by repeating last items
        const remainder = list.length % PAGE_SIZE;
        if (remainder !== 0) {
          if (list.length === 15) {
            const need = PAGE_SIZE - remainder; // 3
            const tail = list.slice(-need);
            // clone with unique ids
            const clones = tail.map((it, idx) => ({ id: `${it.id}_pad${idx + 1}`, text: it.text }));
            list = [...list, ...clones];
          } else if (list.length > 12) {
            // fallback: trim down to 12 for even pages
            list = list.slice(0, 12);
          } else if (list.length < 12) {
            // pad up to next multiple of 6 by repeating from start
            const need = PAGE_SIZE - (list.length % PAGE_SIZE);
            const clones = list.slice(0, need).map((it, idx) => ({ id: `${it.id}_pad${idx + 1}`, text: it.text }));
            list = [...list, ...clones];
          }
        }
        if (!mounted) return;
        setItems(list);
        setLoading(false);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load questions");
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [mode]);

  // Helpers for ChatGPT export flattening (history mode)
  function flattenChatGPTExport(input) {
    const convos = Array.isArray(input) ? input : [input];
    const out = [];
    for (const convo of convos) {
      const mapping = convo && convo.mapping;
      if (!mapping || typeof mapping !== "object") continue;
      for (const k of Object.keys(mapping)) {
        const node = mapping[k];
        const msg = node && node.message;
        if (!msg) continue;
        const role = msg?.author?.role || "user";
        let content = "";
        const c = msg?.content;
        if (c && c.content_type === "text" && Array.isArray(c.parts)) {
          content = c.parts.join("\n");
        } else if (typeof c === "string") {
          content = c;
        }
        if (content && typeof content === "string") {
          out.push({ role, content });
        }
      }
    }
    return out;
  }

  async function handleHistoryFile(file) {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const text = await file.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid JSON file");
      }
      let history = [];
      if (Array.isArray(parsed)) {
        if (parsed.length && parsed[0] && parsed[0].mapping) {
          history = flattenChatGPTExport(parsed);
        } else {
          history = parsed;
        }
      } else if (parsed && parsed.mapping) {
        history = flattenChatGPTExport(parsed);
      } else {
        history = parsed?.messages || parsed?.conversations || parsed?.history || parsed || [];
      }
      const res = await postHistory({ user_id: getUserId(), history });
      const q = res?.questions || [];
      const texts = Array.isArray(q)
        ? q.map((it) => (it && typeof it === "object" ? String(it.question || "") : String(it || ""))).filter(Boolean)
        : [];
      let list = texts.map((text, i) => ({ id: `q${i + 1}`, text }));
      const remainder = list.length % PAGE_SIZE;
      if (remainder !== 0) {
        if (list.length === 15) {
          const need = PAGE_SIZE - remainder;
          const tail = list.slice(-need);
          const clones = tail.map((it, idx) => ({ id: `${it.id}_pad${idx + 1}`, text: it.text }));
          list = [...list, ...clones];
        } else if (list.length > 12) {
          list = list.slice(0, 12);
        } else if (list.length < 12) {
          const need = PAGE_SIZE - (list.length % PAGE_SIZE);
          const clones = list.slice(0, need).map((it, idx) => ({ id: `${it.id}_pad${idx + 1}`, text: it.text }));
          list = [...list, ...clones];
        }
      }
      setItems(list);
      setPage(0);
      setAnswers({});
    } catch (e) {
      setError(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const totalPages = useMemo(() => (items.length ? Math.ceil(items.length / PAGE_SIZE) : 0), [items.length]);
  const pageItems = useMemo(() => items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE), [items, page]);

  const canNext = useMemo(() => pageItems.length > 0 && pageItems.every((q) => !!answers[q.id]), [pageItems, answers]);

  const containerRef = useRef(null);
  const questionRefs = useRef({});

  function scrollToQuestion(qid) {
    try {
      const el = questionRefs.current[qid];
      const container = containerRef.current;
      if (el && container && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch {}
  }

  // Scroll snapping active-state highlighting
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const qEl = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            qEl.classList.add("is-centered");
          } else {
            qEl.classList.remove("is-centered");
          }
        });
      },
      { root: el, threshold: [0.6] }
    );
    const nodes = el.querySelectorAll("[data-question]");
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [page, pageItems.length]);

  const onPick = (qid, val) => {
    setAnswers((a) => {
      const next = { ...a, [qid]: val };
      // Determine next question within current page
      const ids = pageItems.map((q) => q.id);
      const idx = ids.indexOf(qid);
      const isLastOnPage = idx >= 0 && idx === ids.length - 1;
      if (!isLastOnPage) {
        const nextId = ids[idx + 1];
        // Slight delay to allow button press UI update, then scroll
        setTimeout(() => scrollToQuestion(nextId), 50);
      }
      return next;
    });
  };

  const onNext = async () => {
    if (page < totalPages - 1) {
      setPage((p) => p + 1);
      // scroll to top of page
      const el = containerRef.current;
      if (el) el.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Submit
      const user_id = getUserId();
      // Convert map back to {question: numericValue}
      const payload = {};
      items.forEach((it) => {
        const val = answers[it.id];
        if (val != null) {
          payload[it.text] = val; // send 1..5 so backend can apply Likert scoring
        }
      });
      try {
        const res = await postAnswers({ user_id, answers: payload });
        const mbti = (res?.profile || "").toUpperCase();
        try {
          if (mbti) localStorage.setItem("mindshift_personality_type", mbti);
          localStorage.setItem("ms_intro_complete", "1");
          // Persist completion to Supabase profile if available (non-blocking)
          try {
            const sb = getSupabaseClient();
            if (sb) {
              const { data: sessionData } = await sb.auth.getSession();
              const uid = sessionData?.session?.user?.id;
              if (uid) {
                await sb
                  .from("profiles")
                  .update({ test_completed: true, last_result_mbti: mbti || null })
                  .eq("id", uid);
              }
            }
          } catch {}
        } catch {}
        onComplete?.();
      } catch (e) {
        setError(e?.message || "Failed to submit answers");
      }
    }
  };

  const onBack = () => {
    if (page > 0) {
      setPage((p) => p - 1);
      const el = containerRef.current;
      if (el) el.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[95] flex items-center justify-center" style={{ background: "var(--surface)" }}>
        <div className="text-neutral-500">Loading questions…</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="fixed inset-0 z-[95] flex items-center justify-center" style={{ background: "var(--surface)" }}>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // History mode: show upload UI until we have questions
  if (mode === "history" && items.length === 0) {
    return (
      <div className="fixed inset-0 z-[95] overflow-y-auto" style={{ background: "var(--surface)", color: "var(--text)" }}>
        <div className="min-h-full flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-6" style={{ fontFamily: "Tanker, sans-serif" }}>
              <h2 className="text-3xl md:text-4xl tracking-tight" style={{ color: "var(--color-green-900)" }}>Upload ChatGPT JSON</h2>
              <p className="mt-2 text-neutral-500 text-sm">We'll extract message text and generate tailored questions.</p>
              
              {/* Help Toggle Button */}
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border-2 transition-all duration-200 hover:scale-105"
                style={{ 
                  borderColor: "var(--color-green-900)", 
                  color: "var(--color-green-900)",
                  background: showHelp ? "var(--color-green-900-10)" : "transparent"
                }}
              >
                <HelpCircle size={16} />
                {showHelp ? "Hide" : "Show"} export guide
                {showHelp ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
            
            {/* Expandable Help Section */}
            {showHelp && (
              <div className="mb-8 rounded-2xl p-6 border-2 border-dashed" style={{ borderColor: "var(--color-green-900-30)", background: "var(--color-green-900-05)" }}>
                <div className="space-y-6">
                  <div className="text-center relative">
                    <button
                      onClick={() => setShowHelp(false)}
                      className="absolute top-0 right-0 p-2 rounded-full hover:bg-gray-200 transition-colors border border-gray-300"
                      style={{ background: "white" }}
                      aria-label="Close help"
                    >
                      <X size={16} className="text-gray-600" />
                    </button>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-green-900)" }}>How to Export Your ChatGPT History</h3>
                    <p className="text-sm text-neutral-600">Follow these steps to get your conversation data from OpenAI</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Web Instructions */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-emerald-700">
                        <Monitor size={20} />
                        <h4 className="font-semibold">On Web (Desktop/Laptop)</h4>
                      </div>
                      <ol className="space-y-2 text-sm text-neutral-700 pl-4">
                        <li className="flex items-start gap-2">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mt-0.5">1</span>
                          <span>Click on your <strong>profile/username</strong> in the bottom-left corner</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mt-0.5">2</span>
                          <span>Go to <strong>Settings → Data controls</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mt-0.5">3</span>
                          <span>Select <strong>Export data</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mt-0.5">4</span>
                          <span>OpenAI will prepare your file and send a download link to your email</span>
                        </li>
                      </ol>
                    </div>
                    
                    {/* Mobile Instructions */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Smartphone size={20} />
                        <h4 className="font-semibold">On Mobile App (iOS/Android)</h4>
                      </div>
                      <ol className="space-y-2 text-sm text-neutral-700 pl-4">
                        <li className="flex items-start gap-2">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mt-0.5">1</span>
                          <span>Tap on your <strong>profile picture</strong> or the <strong>three dots</strong> in the corner</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mt-0.5">2</span>
                          <span>Go to <strong>Settings → Data Controls</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mt-0.5">3</span>
                          <span>Tap <strong>Export data</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mt-0.5">4</span>
                          <span>You'll receive an email with the export link</span>
                        </li>
                      </ol>
                    </div>
                  </div>
                  
                  {/* Important Notes */}
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <Clock size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-amber-800 text-sm">⚠️ Important Notes:</h4>
                      <ul className="mt-2 space-y-1 text-sm text-amber-700">
                        <li>• Export can take <strong>few minutes to hours</strong> depending on your chat history size</li>
                        <li>• You'll receive a <strong>.zip file</strong> containing .json and .html files of your chats</li>
                        <li>• Look for <strong>conversations.json</strong> in the downloaded file</li>
                        <li>• Your data is processed <strong>client-side</strong> - we only receive generated questions</li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* What to Upload */}
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                    <Download size={20} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-emerald-800 text-sm">What to Upload:</h4>
                      <p className="mt-2 text-sm text-emerald-700">
                        Upload the <strong>conversations.json</strong> file from your downloaded export. 
                        This contains your chat history in a format we can analyze to create personalized questions.
                      </p>
                    </div>
                  </div>
                  
                  {/* Bottom Close Button */}
                  <div className="text-center">
                    <button
                      onClick={() => setShowHelp(false)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 bg-white hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                      style={{ 
                        borderColor: "var(--color-green-900)", 
                        color: "var(--color-green-900)"
                      }}
                    >
                      <ChevronUp size={16} />
                      Got it, close guide
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleHistoryFile(f);
              }}
              className={`relative border-2 border-dashed rounded-2xl p-6 md:p-8 text-center transition-colors ${dragging ? "border-emerald-500 bg-emerald-50/40" : "border-[color:var(--color-green-900)]"}`}
              style={{ boxShadow: "0 4px 0 var(--color-green-900-20)" }}
            >
              <div className="flex flex-col items-center gap-3">
                {/* Cloud upload icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12" style={{ color: "var(--color-green-900)" }} aria-hidden>
                  <path d="M7 20a5 5 0 0 1-.708-9.938A7.002 7.002 0 0 1 20 10c0 .208-.01.414-.03.617A4.5 4.5 0 1 1 18 20H7zm5-11.5a.75.75 0 0 0-1.5 0V15l-1.72-1.72a.75.75 0 1 0-1.06 1.06l3 3a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06L12 15V8.5z"/>
                </svg>
                <div className="text-sm text-neutral-600">
                  Drag & drop your <span className="font-semibold">.json</span> file here,
                  <label className="text-emerald-700 underline cursor-pointer ml-1">
                    or click to upload
                    <input
                      type="file"
                      accept="application/json,.json"
                      className="sr-only"
                      onChange={(e) => handleHistoryFile(e.target.files?.[0])}
                      disabled={uploading}
                    />
                  </label>
                </div>
                <div className="text-xs text-neutral-500">No size limit. Parsing happens client-side; text is sent to generate questions.</div>
              </div>

              {uploading && (
                <div className="absolute inset-0 rounded-2xl bg-white/70 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                      <circle cx="12" cy="12" r="10" strokeWidth="4" opacity=".25" />
                      <path d="M4 12a8 8 0 0 1 8-8" strokeWidth="4" />
                    </svg>
                    <span className="text-sm">Processing your history…</span>
                  </div>
                </div>
              )}
            </div>
            {error && <div className="mt-3 text-sm text-red-600 text-center">{error}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[95]" style={{ background: "var(--surface)", color: "var(--text)" }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-3xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4" style={{ fontFamily: "Tanker, sans-serif" }}>
            <div className="text-neutral-500">Page {page + 1} of {totalPages}</div>
            <div className="h-1 rounded-full flex-1 mx-4" style={{ background: "var(--color-green-900-20)" }}>
              <div className="h-1 rounded-full" style={{ width: `${((page + 1) / totalPages) * 100}%`, background: "var(--color-green-900)" }} />
            </div>
            <div className="text-neutral-500">{items.length} Qs</div>
          </div>

          {/* Questions container */}
          <div
            ref={containerRef}
            className="overflow-y-auto rounded-2xl px-4 md:px-6 py-4 md:py-6"
            style={{ maxHeight: "70vh", border: "2px solid var(--color-green-900)", scrollSnapType: "y mandatory" }}
          >
            <div className="space-y-10">
              {pageItems.map((q) => (
                <div
                  key={q.id}
                  data-question
                  className="transition-colors duration-300"
                  style={{ scrollSnapAlign: "center" }}
                  ref={(el) => { if (el) questionRefs.current[q.id] = el; }}
                >
                  <div className="mb-4 text-center" style={{ fontFamily: "Tanker, sans-serif" }}>
                    <p className="text-2xl md:text-3xl leading-snug question-text">
                      {q.text}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
                    {SCALE.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => onPick(q.id, v)}
                        className={`px-4 py-2 md:px-5 md:py-2.5 rounded-[999px] ${answers[q.id] === v ? "nav-pill nav-pill--cyan" : "nav-pill"}`}
                        aria-pressed={answers[q.id] === v}
                      >
                        <span className="font-mono mr-1">{v}</span>
                        <span className="hidden md:inline text-xs opacity-80">{SCALE_LABEL[v]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between">
            <button type="button" onClick={onBack} disabled={page === 0} className={`nav-pill ${page === 0 ? "opacity-60" : "nav-pill--accent"}`}>
              Back
            </button>
            <button type="button" onClick={onNext} disabled={!canNext} className={`nav-pill ${canNext ? "nav-pill--primary" : "opacity-60"}`}>
              {page === totalPages - 1 ? "Submit" : "Next"}
            </button>
          </div>
        </div>
      </div>

      {/* Active question color control */}
      <style jsx>{`
        .question-text { color: var(--neutral-500, #8a8a8a); }
        [data-question]:not(.is-centered) .question-text { color: #9ca3af; } /* gray-400 */
        [data-question].is-centered .question-text { color: var(--color-green-900); }
      `}</style>
    </div>
  );
}
