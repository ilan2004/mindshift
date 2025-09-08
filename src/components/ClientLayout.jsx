"use client";
import { useEffect, useState } from "react";
import Loader from "./Loader";
import AuthOverlay from "./AuthOverlay";
import { getSupabaseClient } from "../lib/supabase";
import TestRunner from "./TestRunner";
import FinalReveal from "./FinalReveal";
import GreetingReveal from "./GreetingReveal";

export default function ClientLayout({ children }) {
  const [stage, setStage] = useState("greeting"); // greeting | introForm | testRunner | finalReveal | app
  const [userMeta, setUserMeta] = useState({ username: "", gender: "", mode: "general" });

  // On mount, if authenticated and profile says test_completed, skip intro/test
  useEffect(() => {
    const sb = getSupabaseClient();
    if (!sb) return;
    (async () => {
      try {
        const { data: sessionData } = await sb.auth.getSession();
        const uid = sessionData?.session?.user?.id;
        if (!uid) return;
        const { data: profile } = await sb.from("profiles").select("test_completed, username, gender").eq("id", uid).single();
        if (profile?.test_completed) {
          setUserMeta({
            username: profile?.username || "",
            gender: (profile?.gender === "female" ? "female" : profile?.gender === "male" ? "male" : ""),
            mode: "general",
          });
          setStage("app");
        }
      } catch {}
    })();
  }, []);

  const handleLoaderComplete = () => {
    setStage("introForm");
  };

  // Prevent background scroll while in overlay stages
  useEffect(() => {
    const overlayStages = new Set(["greeting", "introForm", "testRunner", "finalReveal"]);
    if (overlayStages.has(stage)) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [stage]);

  // Safety: auto-advance from greeting to introForm in case animation callback fails
  useEffect(() => {
    if (stage !== "greeting") return;
    const t = setTimeout(() => {
      setStage((s) => (s === "greeting" ? "introForm" : s));
    }, 2200);
    return () => clearTimeout(t);
  }, [stage]);

  const startTest = ({ mode, username, gender }) => {
    setUserMeta({ username, gender, mode });
    try {
      if (username) localStorage.setItem("ms_display_name", username);
      if (gender) localStorage.setItem("ms_gender", gender === "female" ? "W" : "M");
    } catch {}
    setStage("testRunner");
  };

  const handleTestComplete = () => {
    setStage("finalReveal");
  };

  const handleRevealComplete = () => {
    try { localStorage.setItem("ms_intro_complete", "1"); } catch {}
    setStage("app");
  };

  return (
    <>
      {/* Loader disabled for check */}
      {false && <Loader onComplete={handleLoaderComplete} />}
      {stage === "greeting" && (
        <GreetingReveal onComplete={() => setStage("introForm")} />
      )}
      {stage === "introForm" && (
        <AuthOverlay onStartTest={startTest} />
      )}
      {stage === "testRunner" && (
        <TestRunner mode={userMeta.mode} onComplete={handleTestComplete} />
      )}
      {stage === "finalReveal" && (
        <FinalReveal onComplete={handleRevealComplete} />
      )}
      {stage === "app" ? (
        children
      ) : (
        // Solid backdrop to avoid flashing home page between overlay transitions (z below overlays)
        <div className="fixed inset-0 z-[80]" style={{ background: "var(--surface)" }} aria-hidden />
      )}
    </>
  );
}
