"use client";

import QuestBoard from "@/components/QuestBoard";
import ProductivityGraph from "@/components/ProductivityGraph";
import FocusSummaryModal from "@/components/FocusSummaryModal";
import LeaderboardSection from "@/components/LeaderboardSection";
import PeerStatusPanel from "@/components/PeerStatusPanel";
import ContractResultFeed from "@/components/ContractResultFeed";
import CommunityChallenges from "@/components/CommunityChallenges";
import { useState } from "react";
import { getUserId, postHistory, getQuestions, postAnswers, postEvent } from "@/lib/backend";

export default function Dashboard() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const uid = typeof window !== "undefined" ? getUserId() : "anonymous";

  async function runHistory() {
    setLoading(true);
    try {
      const data = await postHistory({
        user_id: uid,
        history: [
          { role: "user", content: "I struggle to focus during study time" },
          { role: "assistant", content: "Try Pomodoro" },
          { role: "user", content: "Work projects keep piling up" },
        ],
      });
      setResult({ endpoint: "/history/", data });
    } catch (e) {
      setResult({ endpoint: "/history/", error: String(e) });
    } finally { setLoading(false); }
  }

  async function runQuestions() {
    setLoading(true);
    try {
      const data = await getQuestions(uid);
      setResult({ endpoint: "/questions/", data });
    } catch (e) {
      setResult({ endpoint: "/questions/", error: String(e) });
    } finally { setLoading(false); }
  }

  async function runAnswers() {
    setLoading(true);
    try {
      const data = await postAnswers({
        user_id: uid,
        answers: {
          "How do you plan your study blocks?": "I plan in the morning with a schedule",
          "What distracts you most?": "Friends and social media",
        },
      });
      setResult({ endpoint: "/answers/", data });
    } catch (e) {
      setResult({ endpoint: "/answers/", error: String(e) });
    } finally { setLoading(false); }
  }

  async function runEvent() {
    setLoading(true);
    try {
      const data = await postEvent({
        user_id: uid,
        event_type: "start_focus",
        details: { duration: "25", method: "pomodoro" },
      });
      setResult({ endpoint: "/events/", data });
    } catch (e) {
      setResult({ endpoint: "/events/", error: String(e) });
    } finally { setLoading(false); }
  }

  return (
    <section className="min-h-[70vh] flex flex-col items-center justify-start py-10">
      <div className="w-full max-w-6xl px-4 md:px-6">
        <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <ProductivityGraph />
          </div>
          <div>
            <LeaderboardSection />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <PeerStatusPanel />
          <ContractResultFeed />
        </div>
        {/* Backend Test Panel */}
        <div className="mt-6">
          <div className="rounded-xl border border-neutral-200/80 bg-white/70 backdrop-blur-sm p-4" style={{ boxShadow: "0 6px 0 var(--color-green-900-20)" }}>
            <div className="flex flex-wrap gap-2 mb-3">
              <button className="nav-pill nav-pill--cyan" onClick={runHistory} disabled={loading}>Test /history</button>
              <button className="nav-pill nav-pill--cyan" onClick={runQuestions} disabled={loading}>Test /questions</button>
              <button className="nav-pill nav-pill--cyan" onClick={runAnswers} disabled={loading}>Test /answers</button>
              <button className="nav-pill nav-pill--cyan" onClick={runEvent} disabled={loading}>Test /events</button>
            </div>
            <pre className="text-xs whitespace-pre-wrap break-words">{loading ? "Loading..." : result ? JSON.stringify(result, null, 2) : "Click a button to test the backend."}</pre>
          </div>
        </div>
        <div className="mt-6">
          <CommunityChallenges />
        </div>
        <FocusSummaryModal />
      </div>
    </section>
  );
}
