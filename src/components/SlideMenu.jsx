"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import gsap from "gsap";
import { getSupabaseClient } from "../lib/supabase";

export default function SlideMenu({ isOpen, onClose }) {
  const router = useRouter();
  const menuRef = useRef(null);
  const overlayRef = useRef(null);
  const timeline = useRef(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    // Create timeline for menu animations
    timeline.current = gsap.timeline({ paused: true })
      .to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      })
      .fromTo(menuRef.current,
        {
          x: "100%",
          opacity: 0,
        },
        {
          x: "0%",
          opacity: 1,
          duration: 0.5,
          ease: "power3.out"
        },
        "-=0.2" // Slight overlap for smoother feel
      )
      ;

    return () => {
      if (timeline.current) {
        timeline.current.kill();
      }
    };
  }, []);

  useEffect(() => {
    if (timeline.current) {
      if (isOpen) {
        timeline.current.play();
        // Animate visible menu items on each open to ensure late-added items are included
        const items = menuRef.current?.querySelectorAll?.(".menu-item");
        if (items && items.length) {
          gsap.fromTo(items,
            { x: 20, opacity: 0 },
            { x: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: "power2.out" }
          );
        }
      } else {
        timeline.current.reverse();
      }
    }
  }, [isOpen]);

  const menuItems = [
    { href: "/about", label: "About Your Type" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/game", label: "Game" },
    { href: "/stake", label: "Stake" },
    { href: "/profile", label: "Profile" },
  ];

  // Logout handler
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
      
      // Clear all localStorage data
      try {
        localStorage.clear();
      } catch (e) {
        console.warn('Could not clear localStorage:', e);
      }
      
      // Notify app shell to show auth overlay immediately and redirect home
      try { window.dispatchEvent(new Event('mindshift:auth:signed_out')); } catch {}
      
      // Reset loading state after successful logout
      setLoggingOut(false);
      onClose();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-[99998] ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={{ opacity: 0 }}
      />
      
      {/* Menu */}
      <div
        ref={menuRef}
        className="fixed top-0 right-0 bottom-0 w-[min(420px,90vw)] z-[99999]"
        style={{
          background: "var(--surface)",
          border: "2px solid var(--color-green-900)",
          boxShadow: "-4px 0 24px var(--color-green-900-20), 0 4px 0 var(--color-green-900)",
          opacity: 0,
          transform: "translateX(100%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2" style={{ borderColor: "var(--color-green-900-20)" }}>
          <h2 className="font-tanker text-3xl" style={{ color: "var(--color-green-900)" }}>Navigation</h2>
          <button
            onClick={onClose}
            className="nav-pill nav-pill--cyan"
            aria-label="Close menu"
          >
            Close
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-6 flex flex-col gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="menu-item nav-pill nav-pill--cyan w-full text-center text-lg"
              onClick={onClose}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </Link>
          ))}
          
          {/* Logout Button */}
          <div className="mt-4 pt-4 border-t-2" style={{ borderColor: "var(--color-green-900-20)" }}>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className={`menu-item nav-pill nav-pill--accent w-full text-center text-lg ${loggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ color: "var(--color-green-900)" }}
            >
              {loggingOut ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Logging out...
                </>
              ) : (
                <>
                  🚪 Sign Out
                </>
              )}
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t-2" style={{ borderColor: "var(--color-green-900-20)" }}>
          <div className="flex flex-col gap-3">
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              Current Focus Time
            </div>
            <div className="font-tanker text-2xl" style={{ color: "var(--color-green-900)" }}>
              2h 45m
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
