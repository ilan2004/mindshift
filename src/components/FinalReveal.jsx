"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function FinalReveal({ onComplete }) {
  const rootRef = useRef(null);
  const [mbti, setMbti] = useState("");

  useEffect(() => {
    try {
      const v = localStorage.getItem("Nudge_personality_type") || "";
      setMbti((v || "").toUpperCase());
    } catch {}
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const prefersReduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (prefersReduced) {
      tl.set(el, { autoAlpha: 1 });
      tl.to(el, { autoAlpha: 0, duration: 0.2, delay: 0.6 });
      tl.call(() => onComplete?.());
      return () => tl.kill();
    }

    tl.set(el, { autoAlpha: 0 })
      .to(el, { autoAlpha: 1, duration: 0.4 })
      .fromTo(
        el.querySelector(".ms-word-1"),
        { yPercent: 100, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.5 },
        "+=0.05"
      )
      .fromTo(
        el.querySelector(".ms-word-2"),
        { yPercent: 100, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.5 },
        "<0.1"
      )
      .fromTo(
        el.querySelector(".ms-result"),
        { y: 10, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.5 },
        "+=0.1"
      )
      .to(el, { autoAlpha: 0, duration: 0.4, delay: 0.7 })
      .call(() => onComplete?.());

    return () => tl.kill();
  }, [onComplete]);

  return (
    <div ref={rootRef} className="fixed inset-0 z-[98] flex items-center justify-center" style={{ background: "var(--surface)", color: "var(--text)" }}>
      <div className="text-center" style={{ fontFamily: "Tanker, sans-serif" }}>
        <div className="overflow-hidden">
          <span className="ms-word-1 block text-5xl md:text-7xl tracking-tight" style={{ color: "var(--color-green-900)" }}>Mind</span>
        </div>
        <div className="overflow-hidden">
          <span className="ms-word-2 block text-5xl md:text-7xl tracking-tight" style={{ color: "var(--color-green-900)" }}>Shift</span>
        </div>
        {mbti && (
          <div className="mt-4">
            <div className="ms-result text-lg md:text-2xl text-neutral-600">
              You are a <span style={{ color: "var(--color-green-900)" }}>{mbti}</span> personality
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
