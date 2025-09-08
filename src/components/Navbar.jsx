"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SlideMenu from "./SlideMenu";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Close menu on route change/hash change
  useEffect(() => {
    const close = () => setIsMenuOpen(false);
    window.addEventListener("hashchange", close);
    window.addEventListener("popstate", close);
    return () => {
      window.removeEventListener("hashchange", close);
      window.removeEventListener("popstate", close);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-mint border-b-2 border-green">
      <nav className="max-w-7xl mx-auto px-4 py-4 md:px-6">
        <div className="flex items-center">
          {/* Logo aligned left */}
          <div className="flex-1">
            <Link
              href="/"
              className="font-tanker font-semibold text-4xl md:text-5xl leading-none tracking-widest"
              aria-label="Go to Home"
            >
              MindShift
            </Link>
          </div>

          {/* Menu button aligned right */}
          <div className="flex-none ml-4">
            <button
              type="button"
              className="nav-pill nav-pill--cyan"
              aria-controls="menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(true)}
            >
              Menu
            </button>
          </div>

          {/* Slide Menu */}
          <SlideMenu 
            isOpen={isMenuOpen} 
            onClose={() => setIsMenuOpen(false)} 
          />
        </div>
      </nav>
    </header>
  );
}
