"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function IntroOverlay({
  onStartTest,
  theme = "loader",
}) {
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");

  const canProceed = username.trim().length >= 2 && (gender === "male" || gender === "female");

  return (
    <div className="fixed inset-0 z-[100]" style={{ background: "var(--surface)", color: "var(--text)" }}>
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8" style={{ fontFamily: "Tanker, sans-serif" }}>
            <h1 className="text-4xl md:text-5xl tracking-tight" style={{ color: "var(--color-green-900)" }}>Mind / Shift</h1>
            <p className="mt-2 text-neutral-500">Let’s personalize your experience</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm mb-2 text-neutral-500">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-[14px] outline-none"
                style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 3px 0 var(--color-green-900)" }}
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-neutral-500">Gender</label>
              <div className="flex gap-3">
                {[
                  { key: "male", label: "Male" },
                  { key: "female", label: "Female" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setGender(opt.key)}
                    className={`px-4 py-2 rounded-[999px] ${gender === opt.key ? "nav-pill nav-pill--cyan" : "nav-pill"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <div className="text-sm mb-3 text-neutral-500">Choose how to take the test</div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={!canProceed}
                  onClick={() => onStartTest({ mode: "general", username, gender })}
                  className={`px-4 py-2 rounded-[999px] ${canProceed ? "nav-pill nav-pill--primary" : "nav-pill"}`}
                >
                  Take test – General questions
                </button>
                <button
                  type="button"
                  disabled={!canProceed}
                  onClick={() => onStartTest({ mode: "history", username, gender })}
                  className={`px-4 py-2 rounded-[999px] ${canProceed ? "nav-pill nav-pill--amber" : "nav-pill"}`}
                >
                  Take test – ChatGPT history based
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
