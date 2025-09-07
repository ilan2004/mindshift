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
import { buildBento, styleFor } from "./buildBento";

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

  const bentoItems = useMemo(() => {
    const exclude = Array.from(used).filter((id) => id !== "character" && id !== "nudge");
    return buildBento(cluster, tone, exclude, 8);
  }, [cluster, tone, used]);

  return (
    <>
    <section className="min-h-[70vh] flex flex-col items-center justify-start">
      <div className="w-full px-4 md:px-6 flex flex-col items-center gap-8">
        {/* Hero: 3-column with side components flanking Character (center fixed) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-20 lg:gap-28 items-start">
          {/* Left side */}
          <div className="order-2 md:order-1 flex justify-center md:justify-start mt-12 md:mt-16 lg:mt-20 px-6 lg:px-8 md:-ml-4 lg:-ml-8 reveal-on-scroll">
            {heroLeft}
          </div>
          {/* Center: Character always centered + Nudge with tone */}
          <div className="order-1 md:order-2 flex flex-col items-center gap-3 reveal-on-scroll">
            <CharacterCard />
            <NudgeBox tone={tone} />
          </div>
          {/* Right side */}
          <div className="order-3 md:order-3 flex justify-center md:justify-end mt-12 md:mt-16 lg:mt-20 px-6 lg:px-8 reveal-on-scroll">
            {heroRight}
          </div>
        </div>

        {/* Lower sections: hide duplicates shown in hero */}
        <div className="w-full reveal-on-scroll">
          <div className="bento-grid">
            {bentoItems.map((item) => (
              <div key={item.id} className="bento-card" style={styleFor(item)}>
                {item.el}
              </div>
            ))}
          </div>
        </div>

        {/* More for you (collapsed) */}
        {moreItems.length > 0 && (
          <div className="w-full max-w-6xl">
            <button
              type="button"
              className="nav-pill nav-pill--neutral"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
            >
              {moreOpen ? "Hide" : "More for you"}
            </button>
            {moreOpen && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {moreItems.includes("ProductivityGraph") && (
                  <div className="w-full reveal-on-scroll">
                    <ProductivityGraph />
                  </div>
                )}
                {moreItems.includes("LeaderboardSection") && (
                  <div className="w-full reveal-on-scroll">
                    <LeaderboardSection />
                  </div>
                )}
                {moreItems.includes("QuestBoard") && (
                  <div className="w-full reveal-on-scroll">
                    <QuestBoard />
                  </div>
                )}
                {moreItems.includes("Badges") && (
                  <div className="w-full reveal-on-scroll">
                    <Badges />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <FocusSummaryModal />
    </section>
    <style jsx global>{`
      .bento-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 0.5rem; grid-auto-flow: dense; }
      .bento-card { grid-column: span var(--c-base, 12); grid-row: span var(--r-base, 1); padding: 0; border: 0; background: transparent; box-shadow: none; margin: 0; }
      .bento-card > * { margin-top: 0; margin-bottom: 0; }
      .bento-card:hover { transform: none; box-shadow: none; }
      @media (min-width: 768px) {
        .bento-card { grid-column: span var(--c-md, var(--c-base, 12)); grid-row: span var(--r-md, var(--r-base, 1)); }
      }
      /* Masonry-style on large screens to eliminate vertical gaps */
      @media (min-width: 1024px) {
        .bento-grid { display: block; column-count: 2; column-gap: 1rem; }
        .bento-card { display: inline-block; width: 100%; break-inside: avoid; margin: 0 0 0.75rem; }
      }
    `}</style>
  </>
  );
}
