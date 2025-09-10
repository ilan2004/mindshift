"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function GreetingReveal({ onComplete }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const prefersReduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (prefersReduced) {
      tl.set(el, { autoAlpha: 1 });
      tl.to(el, { autoAlpha: 0, duration: 0.2, delay: 0.5 });
      tl.call(() => onComplete?.());
      return () => tl.kill();
    }

    const line1 = el.querySelector(".ms-greet-1");
    const line2 = el.querySelector(".ms-greet-2");
    const line3 = el.querySelector(".ms-greet-3");

    tl.set(el, { autoAlpha: 0 })
      .to(el, { autoAlpha: 1, duration: 0.2 })
      .fromTo(
        line1,
        { yPercent: 120, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 1.2 }
      )
      .fromTo(
        line2,
        { yPercent: 120, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.8 },
        "<0.2"
      )
      .fromTo(
        line3,
        { yPercent: 120, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.6 },
        "<0.1"
      )
      .to(el, { autoAlpha: 0, duration: 0.3, delay: 0.8 })
      .call(() => onComplete?.());

    return () => tl.kill();
  }, [onComplete]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[98] flex items-center justify-center"
      style={{ background: "var(--surface)", color: "var(--text)" }}
      aria-live="polite"
    >
      <div className="text-center space-y-2" style={{ fontFamily: "Tanker, sans-serif" }}>
        <div className="overflow-hidden">
          <span className="ms-greet-1 block text-5xl md:text-7xl tracking-tight" style={{ color: "var(--color-green-900)" }}>
            Welcome to
          </span>
        </div>
        <div className="overflow-hidden">
          <span className="ms-greet-2 block text-6xl md:text-8xl tracking-tight font-bold" style={{ color: "var(--color-green-900)" }}>
            Nudge
          </span>
        </div>
        <div className="overflow-hidden mt-2">
          <span className="ms-greet-3 block text-lg md:text-xl tracking-wide text-neutral-500">
            Gentle Guidance. Better Habits.
          </span>
        </div>
      </div>
    </div>
  );
}
