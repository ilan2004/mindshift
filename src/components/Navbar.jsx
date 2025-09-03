"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  // Close menu on route change/hash change or resize up to md
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("hashchange", close);
    window.addEventListener("popstate", close);
    const handleResize = () => {
      // Tailwind md breakpoint is 768px by default
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("hashchange", close);
      window.removeEventListener("popstate", close);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <header className="border-b">
      <nav className="mx-auto max-w-6xl px-4 md:px-6 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg" aria-label="Go to Home">
            MindShift
          </Link>
          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/leaderboard" className="nav-pill nav-pill--cyan">Leaderboard</Link>
            <Link href="/game" className="nav-pill nav-pill--cyan">Game</Link>
          </div>
          {/* Mobile hamburger (never rendered on desktop) */}
          {isMobile && (
            <button
              type="button"
              className="nav-pill inline-flex"
              aria-controls="mobile-nav"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "Close" : "Menu"}
            </button>
          )}
        </div>
        {/* Mobile sheet */}
        <div
          id="mobile-nav"
          className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-200 ease-out ${open ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="pt-3 pb-2 flex flex-col gap-2">
            <Link href="/leaderboard" className="nav-pill nav-pill--cyan w-full text-center" onClick={() => setOpen(false)}>
              Leaderboard
            </Link>
            <Link href="/game" className="nav-pill nav-pill--cyan w-full text-center" onClick={() => setOpen(false)}>
              Game
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
