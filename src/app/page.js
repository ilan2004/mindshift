"use client";

import CharacterCard from "@/components/CharacterCard";
import QuestBoard from "@/components/QuestBoard";
import ProductivityGraph from "@/components/ProductivityGraph";
import FocusSummaryModal from "@/components/FocusSummaryModal";
import Badges from "@/components/Badges";
import NudgeBox from "@/components/NudgeBox";
import PeerStatusPanel from "@/components/PeerStatusPanel";
import CommunityChallenges from "@/components/CommunityChallenges";
import LeaderboardSection from "@/components/LeaderboardSection";
import { useEffect, useMemo, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function readMBTI() {
  try { return (localStorage.getItem("mindshift_personality_type") || "").toUpperCase(); } catch { return ""; }
}

function mbtiToCluster(mbti) {
  const t = (mbti || "").toUpperCase();
  if (["ENFJ","ESFJ","ESTJ"].includes(t)) return "achievers";
  if (["INTJ","INTP","ENTJ"].includes(t)) return "analysts";
  if (["ENFP","ESFP","ESTP"].includes(t)) return "explorers";
  if (["INFJ","INFP","ISFJ"].includes(t)) return "diplomats";
  return "achievers"; // sensible default
}

function clusterTone(cluster) {
  return cluster === "achievers" ? "social"
    : cluster === "analysts" ? "logic"
    : cluster === "explorers" ? "fun"
    : "meaningful"; // diplomats
}

export default function Home() {
  const [mbti, setMbti] = useState("");
  useEffect(() => { setMbti(readMBTI()); }, []);

  const cluster = useMemo(() => mbtiToCluster(mbti), [mbti]);
  const tone = useMemo(() => clusterTone(cluster), [cluster]);

  // Decide which components appear in hero side columns and which go to More For You
  const heroLeft = useMemo(() => {
    switch (cluster) {
      case "analysts":
        return (
          <div className="w-full max-w-md">
            <ProductivityGraph />
          </div>
        );
      case "explorers":
        return (
          <div className="w-full max-w-md">
            <QuestBoard />
          </div>
        );
      case "diplomats":
        return (
          <div className="w-full max-w-md">
            <PeerStatusPanel />
          </div>
        );
      case "achievers":
      default:
        return (
          <div className="w-full max-w-md">
            <LeaderboardSection />
          </div>
        );
    }
  }, [cluster]);

  const heroRight = useMemo(() => {
    switch (cluster) {
      case "analysts":
        return (
          <div className="w-full max-w-sm">
            <LeaderboardSection />
          </div>
        );
      case "explorers":
        return (
          <div className="w-full max-w-sm">
            <CommunityChallenges />
          </div>
        );
      case "diplomats":
        return (
          <div className="w-full max-w-sm">
            <CommunityChallenges />
          </div>
        );
      case "achievers":
      default:
        return (
          <div className="w-full max-w-sm">
            <PeerStatusPanel />
          </div>
        );
    }
  }, [cluster]);

  // Determine which lower sections to hide because they already appear in hero
  const used = useMemo(() => {
    const set = new Set(["character", "nudge"]);
    if (cluster === "analysts") { set.add("ProductivityGraph"); set.add("LeaderboardSection"); }
    if (cluster === "explorers") { set.add("QuestBoard"); set.add("CommunityChallenges"); }
    if (cluster === "diplomats") { set.add("PeerStatusPanel"); set.add("CommunityChallenges"); }
    if (cluster === "achievers") { set.add("LeaderboardSection"); set.add("PeerStatusPanel"); }
    return set;
  }, [cluster]);

  // Low-priority components per cluster to show in collapsed area
  const moreItems = useMemo(() => {
    switch (cluster) {
      case "analysts":
        return ["QuestBoard", "Badges"];
      case "explorers":
        return ["ProductivityGraph"]; // heavy stats hidden here
      case "diplomats":
        return ["LeaderboardSection", "ProductivityGraph"];
      case "achievers":
      default:
        return ["QuestBoard", "Badges", "ProductivityGraph"]; // graphs/deep stats
    }
  }, [cluster]);

  const [moreOpen, setMoreOpen] = useState(false);

  // In-view animations for section wrappers
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".reveal-on-scroll").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 24,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      });
    });
    // Refresh to catch dynamic "More for you" content
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [moreOpen]);

  return (
    <section className="min-h-screen w-full">
      {/* Hero Section */}
      <div className="w-full px-4 md:px-6 py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Left Panel */}
          <div className="reveal-on-scroll">
            {heroLeft}
          </div>
          
          {/* Center Panel - Character Card */}
          <div className="flex flex-col items-center gap-4 reveal-on-scroll">
            <CharacterCard />
            <NudgeBox tone={tone} />
          </div>
          
          {/* Right Panel */}
          <div className="reveal-on-scroll">
            {heroRight}
          </div>
        </div>
      </div>

      {/* Bento Grid Section */}
      <div className="w-full px-4 md:px-6 py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center" style={{ fontFamily: "Tanker, sans-serif" }}>
            Your Dashboard
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Row 1 */}
            {!used.has("ProductivityGraph") && (
              <div className="reveal-on-scroll md:col-span-2">
                <ProductivityGraph />
              </div>
            )}
            
            {!used.has("LeaderboardSection") && (
              <div className="reveal-on-scroll">
                <LeaderboardSection />
              </div>
            )}
            
            {/* Row 2 */}
            {!used.has("QuestBoard") && (
              <div className="reveal-on-scroll">
                <QuestBoard />
              </div>
            )}
            
            {!used.has("Badges") && (
              <div className="reveal-on-scroll md:col-span-2">
                <Badges />
              </div>
            )}
          </div>
          
          {/* More For You Section */}
          {moreItems.length > 0 && (
            <div className="mt-8">
              <button
                type="button"
                className="nav-pill nav-pill--neutral mx-auto block"
                onClick={() => setMoreOpen((v) => !v)}
                aria-expanded={moreOpen}
              >
                {moreOpen ? "Show Less" : "More for You"}
              </button>
              
              {moreOpen && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {moreItems.includes("ProductivityGraph") && (
                    <div className="reveal-on-scroll">
                      <ProductivityGraph />
                    </div>
                  )}
                  {moreItems.includes("LeaderboardSection") && (
                    <div className="reveal-on-scroll">
                      <LeaderboardSection />
                    </div>
                  )}
                  {moreItems.includes("QuestBoard") && (
                    <div className="reveal-on-scroll">
                      <QuestBoard />
                    </div>
                  )}
                  {moreItems.includes("Badges") && (
                    <div className="reveal-on-scroll">
                      <Badges />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <FocusSummaryModal />
    </section>
  );
}
