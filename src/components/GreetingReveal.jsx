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
        { yPercent: 0, autoAlpha: 1, duration: 0.7 },
        "<0.15"
      )
      .to(el, { autoAlpha: 0, duration: 0.25, delay: 0.05 })
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
            Hi,
          </span>
        </div>
        <div className="overflow-hidden">
          <span className="ms-greet-2 block text-2xl md:text-3xl tracking-tight" style={{ color: "var(--color-green-900)" }}>
            welcome to Mindshift
          </span>
        </div>
      </div>
    </div>
  );
}
